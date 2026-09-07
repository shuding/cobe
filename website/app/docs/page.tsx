import type { Metadata } from 'next'
import { Code } from '../components/ui'
import { FlyDemo } from './FlyDemo'
import './docs.css'

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'The 5KB WebGL globe: install, options, click-to-fly, and how to pick a layer.',
}

const QUICK_START = `import createGlobe from 'cobe'

const canvas = document.getElementById('globe')
let phi = 0

const globe = createGlobe(canvas, {
  devicePixelRatio: 2,
  width: 600 * 2,
  height: 600 * 2,
  phi: 0,
  theta: 0.2,
  dark: 0,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [1, 1, 1],
  markerColor: [0.2, 0.4, 1],
  glowColor: [1, 1, 1],
  markers: [
    { location: [37.76, -122.44], size: 0.05, id: 'sf' },
    { location: [19.08, 72.88], size: 0.05, id: 'bom' },
  ],
})

// Nothing moves until you drive it.
function frame() {
  globe.update({ phi: (phi += 0.003) })
  requestAnimationFrame(frame)
}
frame()`

const CLICK_TO_FLY = `import createGlobe from 'cobe/lite'
import { pick, flyTo } from 'cobe/pick'

const globe = createGlobe(canvas, { /* ...options */ markers })

const detach = pick(globe, canvas, {
  // A marker was clicked - fly to it and zoom in a little.
  onMarkerClick: (marker) => {
    flyTo(globe, marker.location, { duration: 950, zoom: 1.25 })
  },

  // Bare map was clicked - you get the coordinates under the pointer.
  onGlobeClick: ([lat, lon]) => {
    console.log(lat.toFixed(2), lon.toFixed(2))
  },

  // Fires with null when the pointer leaves every marker.
  onMarkerHover: (marker) => setTooltip(marker),
})

// On unmount:
detach()
globe.destroy()`

const FLY_ONLY = `import { flyTo } from 'cobe/fly'

// A list, a search result, a button - no hit-testing needed, so this
// costs 457 bytes instead of 1,155.
cityButton.onclick = () => flyTo(globe, city.location, { zoom: 1.4 })`

const HANDOVER = `import { flyTo, centerOn } from 'cobe/pick'

let phi = 4.7
let theta = 0.25
let flying = false

function frame() {
  // While a flight runs it is the only writer of phi/theta.
  if (!flying) {
    globe.update({ phi: (phi += 0.003), theta })
  }
  requestAnimationFrame(frame)
}

function go(location) {
  flying = true
  flyTo(globe, location, {
    zoom: 1.25,
    onDone: () => {
      // Resume the idle spin from wherever the flight ended.
      const camera = centerOn(location)
      phi = camera.phi
      theta = camera.theta
      flying = false
    },
  })
}

// pick() cancels the flight on pointerdown, so a drag handler should
// read the live camera back rather than trust its own last value.
canvas.addEventListener('pointerdown', () => {
  const [livePhi, liveTheta] = globe.state()
  flying = false
  phi = livePhi
  theta = liveTheta
})`

const DRAG = `let drag = null

canvas.addEventListener('pointerdown', (e) => {
  const [phi, theta] = globe.state()
  drag = { x: e.clientX, y: e.clientY, phi, theta }
})

window.addEventListener('pointermove', (e) => {
  if (!drag) return
  currentPhi = drag.phi + (e.clientX - drag.x) / 220
  currentTheta = Math.max(
    -1.1,
    Math.min(1.1, drag.theta - (e.clientY - drag.y) / 220),
  )
})

window.addEventListener('pointerup', () => (drag = null))`

const PAUSE = `// Don't burn a GPU frame on a globe nobody can see.
const io = new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting
})
io.observe(canvas)

function frame() {
  if (visible && !document.hidden) {
    globe.update({ phi: (phi += 0.003) })
  }
  requestAnimationFrame(frame)
}`

const REDUCED = `const still = matchMedia('(prefers-reduced-motion: reduce)').matches

// Respect it in two places: the idle spin, and the flight duration.
if (!still) globe.update({ phi: (phi += 0.003) })
flyTo(globe, location, { duration: still ? 0 : 950 })`

type Row = [string, string, string, string]

const CORE_OPTIONS: Row[] = [
  ['width', 'number', 'required', 'Drawing-buffer width. Multiply by devicePixelRatio yourself.'],
  ['height', 'number', 'required', 'Drawing-buffer height.'],
  ['devicePixelRatio', 'number', '1', 'Read once at creation; changing it later has no effect.'],
  ['phi', 'number', '0', 'Rotation around the pole, in radians.'],
  ['theta', 'number', '0', 'Tilt, in radians. Useful range is about -1.1 to 1.1.'],
  ['scale', 'number', '1', 'Zoom. Above ~1.5 the globe starts clipping the canvas.'],
  ['offset', '[number, number]', '[0, 0]', 'Shift the globe within the canvas, in CSS pixels.'],
  ['markers', 'Marker[]', '[]', 'See the Marker table below.'],
  ['markerColor', '[r, g, b]', '[1, 0.5, 0]', 'Default marker colour, 0..1 per channel.'],
  ['markerElevation', 'number', '0.05', 'How far markers float above the surface.'],
  ['baseColor', '[r, g, b]', '[1, 1, 1]', 'Colour of the land dots.'],
  ['glowColor', '[r, g, b]', '[1, 1, 1]', 'Atmosphere colour at the limb.'],
  ['mapSamples', 'number', '10000', 'Number of land dots. 16000 looks good; 40000+ costs frames.'],
  ['mapBrightness', 'number', '1', 'Dot brightness. 5-6 for a dark globe.'],
  ['mapBaseBrightness', 'number', '0', 'Floor brightness for dots on the night side.'],
  ['diffuse', 'number', '1', 'Strength of the directional light.'],
  ['dark', 'number', '0', '0 for a light globe, 1 for a dark one.'],
  ['opacity', 'number', '1', 'Whole-globe alpha.'],
  ['context', 'WebGLContextAttributes', '{}', 'Merged into getContext options.'],
]

const ARC_OPTIONS: Row[] = [
  ['arcs', 'Arc[]', '[]', 'Great-circle arcs. Each is { from, to, color?, id? }.'],
  ['arcColor', '[r, g, b]', '[0.3, 0.6, 1]', 'Default arc colour.'],
  ['arcWidth', 'number', '1', 'Line width multiplier.'],
  ['arcHeight', 'number', '0.2', 'How far the arc bows away from the surface.'],
]

const MARKER_FIELDS: Row[] = [
  ['location', '[lat, lon]', 'required', 'Degrees. Latitude first.'],
  ['size', 'number', 'required', 'Radius in globe units. 0.03-0.06 reads well.'],
  ['color', '[r, g, b]', 'markerColor', 'Overrides markerColor for this one marker.'],
  ['id', 'string', '-', 'Needed for hit-testing and for DOM anchors.'],
]

const SIZES: [string, string, string, string, string][] = [
  ['cobe (full renderer)', '12,932', '5,904', '5,203', 'Globe, markers, arcs, DOM anchors, WebGL1 fallback'],
  ['cobe/lite', '8,763', '4,512', '4,003', 'Globe and markers. WebGL2 only'],
  ['cobe/fly', '694', '482', '457', 'flyTo, centerOn, cancelFly'],
  ['cobe/pick', '2,271', '1,237', '1,155', 'unproject, hitTest, pick - fly bundled in'],
]

const COMBOS: [string, number, string][] = [
  ['lite + fly', 4460, 'Fly to places from a list or a button'],
  ['lite + pick', 5158, 'Everything the demo above does'],
  ['full + pick', 6358, 'Add arcs and DOM-anchored labels'],
]

const BASELINE = 5177

function OptionTable({ rows }: { rows: Row[] }) {
  return (
    <div className='dp-tablewrap'>
      <table className='dp-table'>
        <thead>
          <tr>
            <th>Option</th>
            <th>Type</th>
            <th>Default</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, type, def, note]) => (
            <tr key={name}>
              <td>
                <code>{name}</code>
              </td>
              <td>
                <code>{type}</code>
              </td>
              <td>
                <code>{def}</code>
              </td>
              <td>{note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DocsPage() {
  return (
    <main className='dp'>
      <header className='dp-head'>
        <h1 className='dp-title'>COBE</h1>
        <p className='dp-tagline'>
          A WebGL globe in about 4KB. Zero dependencies. Now with markers you
          can actually click.
        </p>
        <div className='dp-badges'>
          <span className='dp-badge'>4,003 B core</span>
          <span className='dp-badge'>+1,155 B picking</span>
          <span className='dp-badge'>0 deps</span>
        </div>
        <nav className='dp-toc'>
          <a href='#demo'>Demo</a>
          <a href='#install'>Install</a>
          <a href='#start'>Quick start</a>
          <a href='#fly'>Click to fly</a>
          <a href='#layers'>Layers &amp; size</a>
          <a href='#options'>Options</a>
          <a href='#api'>API</a>
          <a href='#recipes'>Recipes</a>
          <a href='#limits'>Limits</a>
        </nav>
      </header>

      <h2 id='demo'>Demo</h2>
      <p>
        This is <code>cobe/lite</code> plus <code>cobe/pick</code> and nothing
        else &mdash; the 5,158-byte configuration from the table below. Drag it,
        click a dot, click the empty ocean.
      </p>
      <FlyDemo />

      <h2 id='install'>Install</h2>
      <Code code={'npm i cobe'} />
      <p>
        ESM only, and it ships its own types. There is no CSS to import and
        nothing to configure.
      </p>

      <h2 id='start'>Quick start</h2>
      <p>
        One call, one canvas. The renderer is deliberately passive: it draws
        exactly the frame you ask for and never starts a loop of its own, so an
        idle globe costs nothing.
      </p>
      <Code code={QUICK_START} />
      <p className='dp-note'>
        Set the canvas <code>width</code>/<code>height</code> attributes to the
        same values you pass in, and its CSS size to the un-multiplied size.
        Mismatched values are the usual cause of a blurry globe.
      </p>

      <h2 id='fly'>Click to fly</h2>
      <p>
        The picking layer turns pointer positions back into coordinates, which
        is what makes markers clickable. It is the exact inverse of the
        renderer&rsquo;s own transform, so a marker is picked where it is drawn
        &mdash; including when it peeks over the limb.
      </p>
      <Code code={CLICK_TO_FLY} />
      <p>
        <code>flyTo</code> rotates the short way round: from 350&deg; to 10&deg;
        it turns 20&deg; forward, not 340&deg; back. Starting a second flight
        cancels the first, and so does the user grabbing the globe.
      </p>

      <h3>Only need the camera?</h3>
      <p>
        Flying to a place chosen from a list needs no hit-testing, so the fly
        layer ships on its own.
      </p>
      <Code code={FLY_ONLY} />

      <h3>Handing the camera back</h3>
      <p>
        A flight and your own idle spin are two writers of the same value. Give
        the flight exclusive ownership while it runs, then resume from where it
        landed &mdash; <code>globe.state()</code> reads the live camera, and{' '}
        <code>centerOn</code> tells you where a flight will end up.
      </p>
      <Code code={HANDOVER} />

      <h2 id='layers'>Layers &amp; size</h2>
      <p>
        Everything optional lives behind its own entry point, so the bytes you
        pay for are the features you use. Measured from the built files, not
        estimated:
      </p>
      <div className='dp-tablewrap'>
        <table className='dp-table'>
          <thead>
            <tr>
              <th>Import</th>
              <th>Raw</th>
              <th>Gzip</th>
              <th>Brotli</th>
              <th>Contains</th>
            </tr>
          </thead>
          <tbody>
            {SIZES.map(([name, raw, gzip, brotli, contains]) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td className='dp-num'>{raw}</td>
                <td className='dp-num'>{gzip}</td>
                <td className='dp-num'>{brotli}</td>
                <td>{contains}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>What that adds up to, in brotli:</p>
      <div className='dp-tablewrap'>
        <table className='dp-table'>
          <thead>
            <tr>
              <th>Configuration</th>
              <th>Brotli</th>
              <th>vs 2.0.1</th>
              <th>Good for</th>
            </tr>
          </thead>
          <tbody>
            {COMBOS.map(([name, bytes, use]) => {
              const delta = bytes - BASELINE
              return (
                <tr key={name}>
                  <td>
                    <code>{name}</code>
                  </td>
                  <td className='dp-num'>{bytes.toLocaleString('en-US')}</td>
                  <td className={delta < 0 ? 'dp-num dp-win' : 'dp-num'}>
                    {delta > 0 ? '+' : ''}
                    {delta.toLocaleString('en-US')} B
                  </td>
                  <td>{use}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className='dp-note'>
        2.0.1 was 5,177 B and had no picking at all. Clicking a marker and
        flying to it now costs 5,158 B &mdash; slightly less than the old globe
        that could do neither. Arcs, DOM anchors and the WebGL1 fallback moved
        into the full build, which is what pays for it.
      </p>

      <h2 id='options'>Options</h2>
      <p>
        Every option is also accepted by <code>update()</code>, so anything
        here can be animated frame to frame.
      </p>
      <OptionTable rows={CORE_OPTIONS} />

      <h3>Markers</h3>
      <OptionTable rows={MARKER_FIELDS} />

      <h3>Arcs &mdash; full build only</h3>
      <p>
        <code>cobe/lite</code> has no arc shader, and its types leave these
        options out rather than accept them silently.
      </p>
      <OptionTable rows={ARC_OPTIONS} />

      <h2 id='api'>API</h2>

      <h3>createGlobe(canvas, options)</h3>
      <p>Returns a globe object with four members:</p>
      <ul className='dp-bullets'>
        <li>
          <code>update(state)</code> &mdash; applies a partial option set and
          draws one frame.
        </li>
        <li>
          <code>destroy()</code> &mdash; frees every GL resource. Always call it
          on unmount.
        </li>
        <li>
          <code>project([lat, lon])</code> &mdash; where a location lands on the
          canvas, as <code>{'{ x, y, visible }'}</code> with x and y as
          fractions of the canvas.
        </li>
        <li>
          <code>state()</code> &mdash; the live camera as{' '}
          <code>[phi, theta, scale, offset, devicePixelRatio, markerElevation, markers]</code>
          .
        </li>
      </ul>
      <p className='dp-note'>
        If the browser has no WebGL at all, <code>createGlobe</code> returns a
        stub whose methods do nothing rather than throwing. Feature-detect by
        checking whether anything drew, not by wrapping the call in try/catch.
      </p>

      <h3>flyTo(globe, location, options?)</h3>
      <p>
        Animates until <code>location</code> is front and centre. Returns a
        cancel function. Options: <code>duration</code> (default 900ms),{' '}
        <code>zoom</code> (target scale; omit to leave scale alone),{' '}
        <code>easing</code> (t 0..1 in, eased out; default ease-in-out cubic),
        and <code>onDone</code>, which does not fire if the flight is cancelled.
      </p>

      <h3>centerOn(location)</h3>
      <p>
        The <code>{'{ phi, theta }'}</code> that would put a location front and
        centre, without animating. Useful for a first frame, and for resuming
        your own loop after a flight.
      </p>

      <h3>cancelFly(globe)</h3>
      <p>Stops the flight currently running on that globe, if any.</p>

      <h3>unproject(globe, canvas, clientX, clientY, radius?)</h3>
      <p>
        Pointer position to <code>[lat, lon]</code>, or <code>null</code> if the
        pointer missed the globe. <code>radius</code> defaults to the map
        surface.
      </p>

      <h3>hitTest(globe, canvas, clientX, clientY, radius?)</h3>
      <p>
        The nearest visible marker within <code>radius</code> CSS pixels
        (default 16), or <code>null</code>. Markers on the far side are not
        clickable through the globe.
      </p>

      <h3>pick(globe, canvas, handlers?)</h3>
      <p>
        Wires the pointer events and returns a detach function. Handlers:{' '}
        <code>onMarkerClick</code>, <code>onMarkerHover</code>,{' '}
        <code>onGlobeClick</code>. Plus <code>radius</code> and{' '}
        <code>cursor</code> (set it to <code>false</code> if you manage the
        cursor yourself). A pointer that travels more than 6px counts as a drag,
        not a click.
      </p>

      <h2 id='recipes'>Recipes</h2>

      <h3>Drag to rotate</h3>
      <p>
        There is no controls layer yet, so this is still yours to write &mdash;
        about fifteen lines.
      </p>
      <Code code={DRAG} />

      <h3>Pause when off screen</h3>
      <Code code={PAUSE} />

      <h3>Respect reduced motion</h3>
      <Code code={REDUCED} />

      <h2 id='limits'>Limits worth knowing</h2>
      <ul className='dp-bullets'>
        <li>
          <strong>No built-in interaction.</strong> Drag, inertia and zoom are
          not in the box. Picking and flying are; rotating by hand is not.
        </li>
        <li>
          <strong>The map is a fixed 256&times;128 dot mask.</strong> No custom
          maps, country polygons or choropleths &mdash; and no plans to bundle
          any, since the mask alone is a fifth of the payload.
        </li>
        <li>
          <strong>
            <code>cobe/lite</code> is WebGL2-only.
          </strong>{' '}
          Roughly 2% of browsers need the full build&rsquo;s fallback path.
        </li>
        <li>
          <strong>Resizing needs an explicit update.</strong> Pass new{' '}
          <code>width</code> and <code>height</code>; there is no
          ResizeObserver.
        </li>
        <li>
          <strong>A lost WebGL context is not recovered.</strong> On mobile the
          globe can go blank and stay blank.
        </li>
        <li>
          <strong>No keyboard access.</strong> A canvas-only globe is invisible
          to assistive tech, so keep the real content in the DOM &mdash; the
          city list in the demo above is a list of buttons for that reason.
        </li>
      </ul>
    </main>
  )
}
