import esbuild from 'esbuild'

import fs from 'fs'
import zlib from 'zlib'
import path from 'path'
import { fileURLToPath } from 'url'
import glslx from 'glslx'

// esbuild isn't small enough
import { minify } from 'terser'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, '../src')

// Read texture
import __TEXTURE__ from '../src/texture.js'

// Compile a single shader with GLSLX
function compileShader(filename) {
  const source = fs.readFileSync(path.join(srcDir, filename), 'utf-8')
  const result = glslx.compile(source, {
    format: 'json',
    renaming: 'all',
  })

  if (result.log) {
    console.error(`GLSLX errors in ${filename}:`, result.log)
    process.exit(1)
  }

  const shaders = JSON.parse(result.output)
  // Return the first (and only) shader's contents, stripping forward declaration
  return [
    shaders.shaders[0].contents.replace('void main();', ''),
    shaders.renaming,
  ]
}

// Compile combined vertex+fragment shader file with GLSLX
// This ensures varyings get consistent names across both shaders
function compileShaderPair(filename) {
  const source = fs.readFileSync(path.join(srcDir, filename), 'utf-8')
  const result = glslx.compile(source, {
    format: 'json',
    renaming: 'all',
  })

  if (result.log) {
    console.error(`GLSLX errors in ${filename}:`, result.log)
    process.exit(1)
  }

  const output = JSON.parse(result.output)
  // Find vertex and fragment shaders by name
  const vertShader = output.shaders.find((s) => s.name === 'vertex')
  const fragShader = output.shaders.find((s) => s.name === 'fragment')

  // Strip forward declarations from both shaders
  const stripDeclarations = (s) =>
    s
      .replace('void vertex();', '')
      .replace('void fragment();', '')
      .replace('void main();', '')

  return {
    vert: stripDeclarations(vertShader.contents),
    frag: stripDeclarations(fragShader.contents),
    renaming: output.renaming,
  }
}

// Fragment shaders need precision qualifier
const PRECISION = 'precision highp float;'

// Globe shaders don't share varyings, can use internal renaming
const [globeVert, globeVertRenaming] = compileShader('globe.vert.glslx')
const [globeFrag, globeFragRenaming] = compileShader('globe.frag.glslx')
// Marker/arc shaders: compile combined files so varyings match
const marker = compileShaderPair('marker.glslx')
const arc = compileShaderPair('arc.glslx')

function rename(object, prefix) {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [
      prefix + key,
      JSON.stringify(value),
    ]),
  )
}

const defines = {
  __TEXTURE__: JSON.stringify(__TEXTURE__),
  __GLOBE_VERT__: JSON.stringify(globeVert),
  __GLOBE_FRAG__: JSON.stringify(PRECISION + globeFrag),
  __MARKER_VERT__: JSON.stringify(marker.vert),
  __MARKER_FRAG__: JSON.stringify(PRECISION + marker.frag),
  __ARC_VERT__: JSON.stringify(arc.vert),
  __ARC_FRAG__: JSON.stringify(PRECISION + arc.frag),
  ...rename(globeVertRenaming, 'GLOBE_V_'),
  ...rename(globeFragRenaming, 'GLOBE_F_'),
  ...rename(marker.renaming, 'MARKER_'),
  ...rename(arc.renaming, 'ARC_'),
}

// Each entry ships as its own file so that importing the core renderer never
// pulls in the optional layers. Anything shared between them stays in the
// core bundle and is imported from there.
const ENTRIES = [
  // Full renderer: markers, arcs and DOM anchors. The default import, and
  // byte-for-byte the same code paths as before the flags were introduced.
  {
    in: 'src/index.js',
    out: 'dist/index.esm.js',
    flags: { __ARCS__: 'true', __ANCHORS__: 'true', __WEBGL1__: 'true' },
  },
  // Lite renderer: globe and markers only. Arcs and anchors are eliminated at
  // build time, along with the arc shader strings.
  {
    in: 'src/index.js',
    out: 'dist/lite.js',
    // WebGL2-only as well: the fallback path costs bytes and WebGL2 is
    // near-universal. The full build above keeps the fallback.
    flags: { __ARCS__: 'false', __ANCHORS__: 'false', __WEBGL1__: 'false' },
  },
  // Camera animation. Works with either renderer.
  { in: 'src/fly.js', out: 'dist/fly.js' },
  // Hit-testing and pointer wiring, with the fly layer bundled in and
  // re-exported. Self-contained on purpose: two files cost more compressed
  // than one, and clicking-then-flying always needs both.
  { in: 'src/pick.js', out: 'dist/pick.js' },
]

async function buildEntry({ in: entry, out, external = [], flags = {} }) {
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    outfile: out,
    format: 'esm',
    target: 'esnext',
    treeShaking: true,
    external,
    define: { ...defines, ...flags },
  })

  // esbuild alone leaves ~8% on the table; terser gets it back.
  const result = await minify(fs.readFileSync(out, 'utf-8'), {
    compress: {
      unsafe: true,
      passes: 3,
      pure_getters: true,
      toplevel: true,
    },
    mangle: { toplevel: true },
  })
  fs.writeFileSync(out, result.code)
}

// Report gzip and brotli, since the README makes a compressed-size claim and
// a raw byte count would quietly misrepresent it.
function report() {
  const sizes = ENTRIES.map(({ out }) => {
    const buf = fs.readFileSync(out)
    return {
      file: path.basename(out),
      raw: buf.length,
      gzip: zlib.gzipSync(buf, { level: 9 }).length,
      brotli: zlib.brotliCompressSync(buf).length,
    }
  })

  const pad = (v, n) => String(v).padStart(n)
  console.log('')
  console.log('  file             raw    gzip  brotli')
  for (const s of sizes) {
    console.log(
      `  ${s.file.padEnd(14)}${pad(s.raw, 5)}${pad(s.gzip, 8)}${pad(s.brotli, 8)}`,
    )
  }

  const total = sizes.reduce((a, s) => a + s.brotli, 0)
  console.log(`  ${'all layers'.padEnd(14)}${pad('', 5)}${pad('', 8)}${pad(total, 8)}`)
  console.log('')
}

Promise.all(ENTRIES.map(buildEntry))
  .then(() => {
    // Ship the hand-written type definitions alongside the bundles
    for (const f of ['index.d.ts', 'lite.d.ts', 'pick.d.ts', 'fly.d.ts']) {
      fs.copyFileSync(
        path.join(srcDir, f),
        path.join(__dirname, '../dist', f),
      )
    }
    report()
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
