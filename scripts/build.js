import esbuild from 'esbuild'

import fs from 'fs'
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

esbuild
  .build({
    entryPoints: ['src/index.js'],
    bundle: true,
    minify: true,
    outfile: 'dist/index.esm.js',
    format: 'esm',
    target: 'esnext',
    treeShaking: true,
    define: {
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
    },
  })
  .catch(() => process.exit(1))
  .then(async () => {
    const result = await minify(fs.readFileSync('dist/index.esm.js', 'utf-8'), {
      compress: {
        unsafe: true,
        passes: 2,
        pure_getters: true,
      },
    })
    // Just overwrite the file
    fs.writeFileSync('dist/index.esm.js', result.code)
  })
