'use client'

import createGlobe from 'cobe'
import { useEffect, useRef, useCallback, useState } from 'react'
import { useSpring } from 'react-spring'
import { Code, Recipes, MarkersArcs, CustomLabels } from './components'
import {
  showcases,
  showcaseConfigs,
  getShowcaseMarkers,
  getShowcaseArcs,
  ShowcaseKey,
  showcaseDefaultMarkers,
  showcaseDefaultArcs,
  stickerMarkers,
  liveMarkers,
  interactiveMarkers,
  polaroidMarkers,
  pulseMarkers,
  barMarkers,
  analyticsMarkers,
  flightArcs,
  flightMarkers,
  labelMarkers,
  satelliteMarkers,
  weatherMarkers,
  cdnMarkers,
  cdnArcs,
} from './showcases-data'

const installCommands = {
  'Copy Prompt': 'Add cobe@latest (https://cobe.vercel.app) to my app.',
  npm: 'npm i cobe',
  pnpm: 'pnpm i cobe',
  yarn: 'yarn add cobe',
  bun: 'bun add cobe',
}

const codeExample = `import createGlobe from 'cobe'

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
    { location: [37.78, -122.44], size: 0.03, id: 'sf' },
    { location: [40.71, -74.01], size: 0.03, id: 'nyc' },
  ],
  arcs: [
    { from: [37.78, -122.44], to: [40.71, -74.01] },
  ],
  arcColor: [0.3, 0.5, 1],
  arcWidth: 0.5,
  arcHeight: 0.3,
})

// Animate the globe
let phi = 0
function animate() {
  phi += 0.005
  globe.update({ phi })
  requestAnimationFrame(animate)
}
animate()`

const apiOptions = [
  {
    name: 'width',
    type: 'number',
    desc: 'Canvas width in pixels (use width * 2 for retina)',
    required: true,
  },
  {
    name: 'height',
    type: 'number',
    desc: 'Canvas height in pixels (use height * 2 for retina)',
    required: true,
  },
  {
    name: 'phi',
    type: 'number',
    desc: 'Horizontal rotation angle in radians (0 to 2π)',
    required: true,
  },
  {
    name: 'theta',
    type: 'number',
    desc: 'Vertical tilt angle in radians (-π/2 to π/2)',
    required: true,
  },
  {
    name: 'dark',
    type: 'number',
    desc: 'Land darkness: 0 = light mode, 1 = dark mode',
    required: true,
  },
  {
    name: 'diffuse',
    type: 'number',
    desc: 'Diffuse lighting intensity (typically 0.5 to 3)',
    required: true,
  },
  {
    name: 'mapSamples',
    type: 'number',
    desc: 'Number of dots rendering the map (1000 to 100000)',
    required: true,
  },
  {
    name: 'mapBrightness',
    type: 'number',
    desc: 'Brightness of land dots (1 to 20)',
    required: true,
  },
  {
    name: 'mapBaseBrightness',
    type: 'number',
    desc: 'Base brightness for ocean areas (0 to 1)',
  },
  {
    name: 'baseColor',
    type: '[r,g,b]',
    desc: 'Globe base color, values 0-1 (e.g. [1, 1, 1] = white)',
  },
  {
    name: 'markerColor',
    type: '[r,g,b]',
    desc: 'Default marker color, values 0-1',
  },
  {
    name: 'glowColor',
    type: '[r,g,b]',
    desc: 'Atmospheric glow color around the globe',
  },
  {
    name: 'markers',
    type: 'Marker[]',
    desc: '{ location: [lat, lon], size, color?, id? }',
  },
  {
    name: 'arcs',
    type: 'Arc[]',
    desc: '{ from: [lat, lon], to: [lat, lon], color?, id? }',
  },
  { name: 'arcColor', type: '[r,g,b]', desc: 'Default arc color, values 0-1' },
  { name: 'arcWidth', type: 'number', desc: 'Arc line thickness (0.1 to 2)' },
  {
    name: 'arcHeight',
    type: 'number',
    desc: 'Arc curve height above globe (0.1 to 0.5)',
  },
  {
    name: 'markerElevation',
    type: 'number',
    desc: 'Marker height above surface (0 to 0.2)',
  },
  { name: 'scale', type: 'number', desc: 'Globe scale multiplier (default 1)' },
  { name: 'offset', type: '[x,y]', desc: 'Pixel offset from center [x, y]' },
  { name: 'opacity', type: 'number', desc: 'Globe opacity (0 to 1)' },
  {
    name: 'devicePixelRatio',
    type: 'number',
    desc: 'Pixel density (use 2 for retina displays)',
  },
  {
    name: 'context',
    type: 'WebGLContextAttributes',
    desc: 'WebGL context options (antialias, alpha, etc.)',
  },
]

const returnedMethods = [
  {
    name: 'update(state)',
    type: 'function',
    desc: 'Updates globe state and triggers a re-render. Pass any options to update.',
  },
  {
    name: 'destroy()',
    type: 'function',
    desc: 'Releases WebGL context and stops rendering. Call when unmounting.',
  },
]

function Showcases() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeShowcase, setActiveShowcase] = useState<ShowcaseKey>('default')
  const showcaseRef = useRef<ShowcaseKey>('default')
  const [expanded, setExpanded] = useState<string | null>(null)
  const progressBarRef = useRef<HTMLSpanElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const lastPointer = useRef<{ x: number; y: number; t: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const velocity = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const [liveViewers, setLiveViewers] = useState(2847)
  const [cdnTraffic, setCdnTraffic] = useState(() =>
    cdnArcs.map((a, i) => ({ id: a.id, value: [420, 380, 290, 185, 156, 134][i] || 100 }))
  )
  const isPausedRef = useRef(false)
  const speedRef = useRef(1)
  const accumulatedRef = useRef(0)
  const [analyticsData, setAnalyticsData] = useState(() =>
    analyticsMarkers.map((m) => ({ ...m })),
  )

  const [spring, api] = useSpring(() => ({
    theta: showcaseConfigs.default.theta,
    dark: showcaseConfigs.default.dark,
    mapBrightness: showcaseConfigs.default.mapBrightness,
    mr: showcaseConfigs.default.markerColor[0],
    mg: showcaseConfigs.default.markerColor[1],
    mb: showcaseConfigs.default.markerColor[2],
    br: showcaseConfigs.default.baseColor[0],
    bg: showcaseConfigs.default.baseColor[1],
    bb: showcaseConfigs.default.baseColor[2],
    ar: showcaseConfigs.default.arcColor[0],
    ag: showcaseConfigs.default.arcColor[1],
    ab: showcaseConfigs.default.arcColor[2],
    markerSize: showcaseConfigs.default.markerSize,
    markerElevation: showcaseConfigs.default.markerElevation,
    config: { mass: 1, tension: 120, friction: 20 },
  }))

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
    isPausedRef.current = true
  }, [])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const deltaX = e.clientX - pointerInteracting.current.x
      const deltaY = e.clientY - pointerInteracting.current.y
      dragOffset.current = { phi: deltaX / 300, theta: deltaY / 1000 }

      // Track velocity (clamped)
      const now = Date.now()
      if (lastPointer.current) {
        const dt = Math.max(now - lastPointer.current.t, 1)
        const maxVelocity = 0.15
        velocity.current = {
          phi: Math.max(
            -maxVelocity,
            Math.min(
              maxVelocity,
              ((e.clientX - lastPointer.current.x) / dt) * 0.3,
            ),
          ),
          theta: Math.max(
            -maxVelocity,
            Math.min(
              maxVelocity,
              ((e.clientY - lastPointer.current.y) / dt) * 0.08,
            ),
          ),
        }
      }
      lastPointer.current = { x: e.clientX, y: e.clientY, t: now }
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
      lastPointer.current = null
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerup', handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])

  const currentActiveShowcase = useRef<ShowcaseKey>('default')
  useEffect(() => {
    currentActiveShowcase.current = activeShowcase
  }, [activeShowcase])

  useEffect(() => {
    const duration = currentActiveShowcase.current === 'default' ? 6000 : 4000
    const interval = setInterval(() => {
      if (isPausedRef.current) return
      accumulatedRef.current += 50
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${(accumulatedRef.current / duration) * 100}%`
      }
      if (accumulatedRef.current >= duration) {
        setActiveShowcase((current) => {
          const idx = showcases.findIndex((s) => s.key === current)
          return showcases[(idx + 1) % showcases.length].key
        })
        setExpanded(null)
        accumulatedRef.current = 0
        if (progressBarRef.current) progressBarRef.current.style.width = '0%'
      }
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Self-updating live viewers
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViewers((v) =>
        Math.max(100, v + Math.floor(Math.random() * 21) - 8),
      )
    }, 400)
    return () => clearInterval(interval)
  }, [])

  // Self-updating CDN traffic
  useEffect(() => {
    const interval = setInterval(() => {
      setCdnTraffic((data) =>
        data.map((t) => ({
          ...t,
          value: Math.max(50, t.value + Math.floor(Math.random() * 21) - 10),
        }))
      )
    }, 250)
    return () => clearInterval(interval)
  }, [])

  // Self-updating analytics
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsData((data) =>
        data.map((m) => ({
          ...m,
          visitors: m.visitors + Math.floor(Math.random() * 11) - 3,
          trend: Math.max(
            -20,
            Math.min(20, m.trend + Math.floor(Math.random() * 5) - 2),
          ),
        })),
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    showcaseRef.current = activeShowcase
    const config = showcaseConfigs[activeShowcase]
    api.start({
      theta: config.theta,
      dark: config.dark,
      mapBrightness: config.mapBrightness,
      mr: config.markerColor[0],
      mg: config.markerColor[1],
      mb: config.markerColor[2],
      br: config.baseColor[0],
      bg: config.baseColor[1],
      bb: config.baseColor[2],
      ar: config.arcColor[0],
      ag: config.arcColor[1],
      ab: config.arcColor[2],
      markerSize: config.markerSize,
      markerElevation: config.markerElevation,
    })
  }, [activeShowcase, api])

  const springRef = useRef(spring)
  useEffect(() => {
    springRef.current = spring
  }, [spring])

  useEffect(() => {
    if (!canvasRef.current) return
    let phi = 0
    const width = canvasRef.current.offsetWidth

    const markerArrays: Record<
      ShowcaseKey,
      { id: string; location: [number, number] }[]
    > = {
      default: showcaseDefaultMarkers,
      stickers: stickerMarkers,
      live: liveMarkers,
      interactive: interactiveMarkers,
      polaroids: polaroidMarkers,
      pulse: pulseMarkers,
      bars: barMarkers,
      analytics: analyticsMarkers,
      flights: flightMarkers,
      labels: labelMarkers,
      satellites: satelliteMarkers,
      weather: weatherMarkers,
      cdn: cdnMarkers,
    }

    // Pre-build arc arrays (static)
    const defaultArcs = showcaseDefaultArcs.map((a) => ({
      from: a.from,
      to: a.to,
      id: a.id,
    }))
    const flightArcsData = flightArcs.map((a) => ({
      from: a.from,
      to: a.to,
      id: a.id,
    }))
    const cdnArcsData = cdnArcs.map((a) => ({
      from: a.from,
      to: a.to,
      id: a.id,
    }))
    const emptyArcs: typeof defaultArcs = []

    // Cache for markers with size
    let cachedShowcase: ShowcaseKey | null = null
    let cachedSize = 0
    let cachedMarkers: {
      location: [number, number]
      size: number
      id: string
    }[] = []

    const getMarkers = () => {
      const s = showcaseRef.current
      const size = springRef.current.markerSize.get()
      // Return cached if same showcase and size hasn't changed much
      if (s === cachedShowcase && Math.abs(size - cachedSize) < 0.001) {
        return cachedMarkers
      }
      const arr = markerArrays[s]
      if (!arr) return []
      cachedShowcase = s
      cachedSize = size
      cachedMarkers = arr.map((m) => ({
        location: m.location,
        size,
        id: m.id,
      }))
      return cachedMarkers
    }

    const getArcs = () => {
      const s = showcaseRef.current
      if (s === 'default') return defaultArcs
      if (s === 'flights') return flightArcsData
      if (s === 'cdn') return cdnArcsData
      return emptyArcs
    }

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      window.innerWidth < 640 ? 1.8 : 2,
    )
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: dpr,
      width: width,
      height: width,
      phi: 0,
      theta: 0.2,
      dark: 0,
      diffuse: 1.5,
      mapSamples: 16000,
      mapBrightness: 10,
      baseColor: [1, 1, 1],
      markerColor: [0.3, 0.45, 0.85],
      glowColor: [0.94, 0.93, 0.91],
      markerElevation: 0.01,
      markers: getMarkers(),
      arcs: getArcs(),
      arcColor: [0.3, 0.45, 0.85],
      arcWidth: 0.5,
      arcHeight: 0.25,
      opacity: 0.7,
    })

    let animationId: number
    function animate() {
      const s = springRef.current
      if (!isPausedRef.current) {
        phi += 0.003 * speedRef.current
        // Apply momentum with decay
        if (
          Math.abs(velocity.current.phi) > 0.0001 ||
          Math.abs(velocity.current.theta) > 0.0001
        ) {
          phiOffsetRef.current += velocity.current.phi
          thetaOffsetRef.current += velocity.current.theta
          velocity.current.phi *= 0.95
          velocity.current.theta *= 0.95
        }
        // Soft spring back for theta limits
        const thetaMin = -0.4,
          thetaMax = 0.4
        if (thetaOffsetRef.current < thetaMin) {
          thetaOffsetRef.current += (thetaMin - thetaOffsetRef.current) * 0.1
        } else if (thetaOffsetRef.current > thetaMax) {
          thetaOffsetRef.current += (thetaMax - thetaOffsetRef.current) * 0.1
        }
      }
      globe.update({
        phi: phi + phiOffsetRef.current + dragOffset.current.phi,
        theta:
          s.theta.get() + thetaOffsetRef.current + dragOffset.current.theta,
        dark: s.dark.get(),
        mapBrightness: s.mapBrightness.get(),
        markerColor: [s.mr.get(), s.mg.get(), s.mb.get()],
        baseColor: [s.br.get(), s.bg.get(), s.bb.get()],
        arcColor: [s.ar.get(), s.ag.get(), s.ab.get()],
        markerElevation: s.markerElevation.get(),
        markers: getMarkers(),
        arcs: getArcs(),
      })
      animationId = requestAnimationFrame(animate)
    }
    animate()

    setTimeout(
      () => canvasRef.current && (canvasRef.current.style.opacity = '1'),
    )
    return () => {
      cancelAnimationFrame(animationId)
      globe.destroy()
    }
  }, [])

  return (
    <section className='hero'>
      <div className='showcases-demo'>
        <div className='showcases-globe'>
          <svg width='0' height='0' style={{ position: 'absolute' }}>
            <defs>
              <filter id='sticker-outline'>
                <feMorphology
                  in='SourceAlpha'
                  result='Dilated'
                  operator='dilate'
                  radius='2'
                />
                <feFlood floodColor='#ffffff' result='OutlineColor' />
                <feComposite
                  in='OutlineColor'
                  in2='Dilated'
                  operator='in'
                  result='Outline'
                />
                <feMerge>
                  <feMergeNode in='Outline' />
                  <feMergeNode in='SourceGraphic' />
                </feMerge>
              </filter>
            </defs>
          </svg>
          <canvas
            ref={canvasRef}
            className='showcases-canvas'
            onPointerDown={handlePointerDown}
            onPointerEnter={() => (speedRef.current = 0.8)}
            onPointerLeave={() => (speedRef.current = 1)}
          />

          {/* Default */}
          {activeShowcase === 'default' && (
            <>
              <div className='globe-overlay'>
                <h1>COBE</h1>
              </div>
              <div className='orbit-ring' aria-hidden='true'>
                <svg className='orbit-svg' viewBox='0 0 300 300'>
                  <defs>
                    <path
                      id='showcaseOrbitPath'
                      d='M 150,150 m -130,0 a 130,130 0 1,0 260,0 a 130,130 0 1,0 -260,0'
                    />
                  </defs>
                  <text className='orbit-text'>
                    <textPath href='#showcaseOrbitPath'>
                      {'The 5KB Globe Lib · '.repeat(10)}
                    </textPath>
                  </text>
                </svg>
              </div>
              {showcaseDefaultMarkers.map((m) => (
                <div
                  key={m.id}
                  className='showcase-default-label'
                  style={
                    {
                      positionAnchor: `--cobe-${m.id}`,
                      opacity: `var(--cobe-visible-${m.id}, 0)`,
                      filter: `blur(var(--cobe-visible-${m.id}, 10px))`,
                    } as React.CSSProperties
                  }
                >
                  {m.label}
                </div>
              ))}
              {showcaseDefaultArcs.map((a) => (
                <div
                  key={a.id}
                  className='arc-label'
                  style={
                    {
                      positionAnchor: `--cobe-arc-${a.id}`,
                      opacity: `var(--cobe-visible-arc-${a.id}, 0)`,
                      filter: `blur(var(--cobe-visible-arc-${a.id}, 10px))`,
                    } as React.CSSProperties
                  }
                >
                  {a.label}
                </div>
              ))}
            </>
          )}

          {/* Stickers */}
          {activeShowcase === 'stickers' &&
            stickerMarkers.map((m) => (
              <div
                key={m.id}
                className='showcase-sticker'
                style={
                  {
                    positionAnchor: `--cobe-${m.id}`,
                    opacity: `var(--cobe-visible-${m.id}, 0)`,
                  } as React.CSSProperties
                }
              >
                {m.sticker}
              </div>
            ))}

          {/* Live Badge */}
          {activeShowcase === 'live' &&
            liveMarkers.map((m, i) => (
              <div
                key={m.id}
                className='showcase-live'
                style={
                  {
                    positionAnchor: `--cobe-${m.id}`,
                    opacity: `var(--cobe-visible-${m.id}, 0)`,
                    filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
                  } as React.CSSProperties
                }
              >
                <span className='showcase-live-dot' />
                <span className='showcase-live-text'>LIVE</span>
                <span className='showcase-live-viewers'>
                  {Math.floor(
                    liveViewers * (0.3 + 0.7 * Math.pow(0.6, i)),
                  ).toLocaleString()}{' '}
                  watching
                </span>
              </div>
            ))}

          {/* Interactive Markers */}
          {activeShowcase === 'interactive' &&
            interactiveMarkers.map((m) => (
              <div
                key={m.id}
                className={`showcase-interactive ${expanded === m.id ? 'expanded' : ''}`}
                style={
                  {
                    positionAnchor: `--cobe-${m.id}`,
                    opacity: `var(--cobe-visible-${m.id}, 0)`,
                    filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
                  } as React.CSSProperties
                }
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
              >
                <span className='showcase-interactive-name'>{m.name}</span>
                {expanded === m.id && (
                  <span className='showcase-interactive-detail'>
                    {m.users.toLocaleString()} users
                  </span>
                )}
              </div>
            ))}

          {/* Polaroids */}
          {activeShowcase === 'polaroids' &&
            polaroidMarkers.map((m) => (
              <div
                key={m.id}
                className='showcase-polaroid'
                style={
                  {
                    positionAnchor: `--cobe-${m.id}`,
                    opacity: `var(--cobe-visible-${m.id}, 0)`,
                    filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
                    '--polaroid-rotate': `${m.rotate}deg`,
                  } as React.CSSProperties
                }
              >
                <img src={m.image} alt={m.caption} />
                <span className='showcase-polaroid-caption'>{m.caption}</span>
              </div>
            ))}

          {/* Pulse */}
          {activeShowcase === 'pulse' &&
            pulseMarkers.map((m) => (
              <div
                key={m.id}
                className='showcase-pulse'
                style={
                  {
                    positionAnchor: `--cobe-${m.id}`,
                    opacity: `var(--cobe-visible-${m.id}, 0)`,
                    filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
                    '--delay': `${m.delay}s`,
                  } as React.CSSProperties
                }
              >
                <span className='showcase-pulse-ring' />
                <span className='showcase-pulse-ring' />
                <span className='showcase-pulse-dot' />
              </div>
            ))}

          {/* Bars */}
          {activeShowcase === 'bars' &&
            barMarkers.map((m) => (
              <div
                key={m.id}
                className='showcase-bar'
                style={
                  {
                    positionAnchor: `--cobe-${m.id}`,
                    opacity: `var(--cobe-visible-${m.id}, 0)`,
                    filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
                  } as React.CSSProperties
                }
              >
                <span className='showcase-bar-label'>{m.label}</span>
                <span className='showcase-bar-track'>
                  <span
                    className='showcase-bar-fill'
                    style={{ '--value': `${m.value}%` } as React.CSSProperties}
                  />
                </span>
                <span className='showcase-bar-value'>{m.value}%</span>
              </div>
            ))}

          {/* Analytics */}
          {activeShowcase === 'analytics' &&
            analyticsData.map((m) => (
              <div
                key={m.id}
                className='showcase-analytics'
                style={
                  {
                    positionAnchor: `--cobe-${m.id}`,
                    opacity: `var(--cobe-visible-${m.id}, 0)`,
                    filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
                  } as React.CSSProperties
                }
              >
                <span className='showcase-analytics-count'>{m.visitors}</span>
                <span
                  className={`showcase-analytics-trend ${m.trend >= 0 ? 'up' : 'down'}`}
                >
                  {m.trend >= 0 ? '↑' : '↓'} {Math.abs(m.trend)}%
                </span>
              </div>
            ))}

          {/* Flights */}
          {activeShowcase === 'flights' &&
            flightArcs.map((a) => (
              <div
                key={a.id}
                className='showcase-flight'
                style={
                  {
                    positionAnchor: `--cobe-arc-${a.id}`,
                    opacity: `var(--cobe-visible-arc-${a.id}, 0)`,
                    // filter: `blur(calc((1 - var(--cobe-visible-arc-${a.id}, 0)) * 8px))`,
                  } as React.CSSProperties
                }
              >
                ✈️
              </div>
            ))}

          {/* Labels */}
          {activeShowcase === 'labels' &&
            labelMarkers.map((m) => (
              <div
                key={m.id}
                className='showcase-label'
                style={
                  {
                    positionAnchor: `--cobe-${m.id}`,
                    opacity: `var(--cobe-visible-${m.id}, 0)`,
                    filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
                    '--label-color': m.color,
                    '--label-rotate': `${m.rotate}deg`,
                  } as React.CSSProperties
                }
              >
                {m.text}
              </div>
            ))}

          {/* Satellites */}
          {activeShowcase === 'satellites' &&
            satelliteMarkers.map((m) => (
              <div
                key={m.id}
                className='showcase-satellite'
                style={
                  {
                    positionAnchor: `--cobe-${m.id}`,
                    opacity: `var(--cobe-visible-${m.id}, 0)`,
                    filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
                  } as React.CSSProperties
                }
              >
                🛰️
              </div>
            ))}

          {/* CDN */}
          {activeShowcase === 'cdn' && (
            <>
              {cdnMarkers.map((m) => (
                <div
                  key={m.id}
                  className='showcase-cdn'
                  style={
                    {
                      positionAnchor: `--cobe-${m.id}`,
                      opacity: `var(--cobe-visible-${m.id}, 0)`,
                      filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
                    } as React.CSSProperties
                  }
                >
                  <div className='showcase-cdn-pyramid'>
                    <div className='showcase-cdn-pyramid-face' />
                    <div className='showcase-cdn-pyramid-face' />
                    <div className='showcase-cdn-pyramid-face' />
                    <div className='showcase-cdn-pyramid-face' />
                  </div>
                  <span className='showcase-cdn-label'>{m.region}</span>
                </div>
              ))}
              {cdnTraffic.map((t) => (
                <div
                  key={t.id}
                  className='showcase-cdn-arc-label'
                  style={
                    {
                      positionAnchor: `--cobe-arc-${t.id}`,
                      opacity: `var(--cobe-visible-arc-${t.id}, 0)`,
                      filter: `blur(calc((1 - var(--cobe-visible-arc-${t.id}, 0)) * 8px))`,
                    } as React.CSSProperties
                  }
                >
                  {t.value}k req/s
                </div>
              ))}
            </>
          )}

          {/* Weather */}
          {activeShowcase === 'weather' &&
            weatherMarkers.map((m) => (
              <div
                key={m.id}
                className='showcase-weather'
                style={
                  {
                    positionAnchor: `--cobe-${m.id}`,
                    opacity: `var(--cobe-visible-${m.id}, 0)`,
                    filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
                  } as React.CSSProperties
                }
              >
                {m.emoji}
              </div>
            ))}
        </div>

        <div className='showcases-controls'>
          <div className='showcase-title'>
            {showcases.find((s) => s.key === activeShowcase)?.name}
          </div>
          <div className='showcase-indicators'>
            {showcases.map((s) => (
              <button
                key={s.key}
                className={`showcase-dot ${activeShowcase === s.key ? 'active' : ''}`}
                onClick={() => {
                  setActiveShowcase(s.key)
                  setExpanded(null)
                  accumulatedRef.current = 0
                  if (progressBarRef.current)
                    progressBarRef.current.style.width = '0%'
                }}
                aria-label={s.name}
              >
                <span className='showcase-dot-inner' />
                <span className='showcase-dot-label'>{s.name}</span>
              </button>
            ))}
          </div>
          <div className='showcase-progress'>
            <span ref={progressBarRef} className='showcase-progress-bar' />
          </div>
          <div className='showcase-nav'>
            <button
              className='showcase-nav-btn'
              onClick={() => {
                const idx = showcases.findIndex((s) => s.key === activeShowcase)
                setActiveShowcase(
                  showcases[(idx - 1 + showcases.length) % showcases.length]
                    .key,
                )
                setExpanded(null)
                accumulatedRef.current = 0
                if (progressBarRef.current)
                  progressBarRef.current.style.width = '0%'
              }}
              aria-label='Previous'
            >
              ←
            </button>
            <span className='showcase-count'>
              {showcases.findIndex((s) => s.key === activeShowcase) + 1} /{' '}
              {showcases.length}
            </span>
            <button
              className='showcase-nav-btn'
              onClick={() => {
                const idx = showcases.findIndex((s) => s.key === activeShowcase)
                setActiveShowcase(showcases[(idx + 1) % showcases.length].key)
                setExpanded(null)
                accumulatedRef.current = 0
                if (progressBarRef.current)
                  progressBarRef.current.style.width = '0%'
              }}
              aria-label='Next'
            >
              →
            </button>
          </div>
        </div>
      </div>
      <p className='hero-tagline'>COBE: The 5KB WebGL globe</p>
      <div className='hero-links'>
        <a
          href='https://github.com/shuding/cobe'
          target='_blank'
          rel='noopener'
        >
          GitHub
        </a>
        <span className='hero-links-sep'>/</span>
        <a href='https://x.com/shuding' target='_blank' rel='noopener'>
          @shuding
        </a>
        <span className='hero-links-sep'>/</span>
        <a
          href='https://x.com/shuding/status/1475916082875666441'
          target='_blank'
          rel='noopener'
        >
          Tech Details →
        </a>
      </div>
    </section>
  )
}

const playgroundPresets = {
  default: {
    dark: 0,
    diffuse: 1.2,
    mapSamples: 16000,
    mapBrightness: 6,
    baseColor: [1, 1, 1] as [number, number, number],
    markerColor: [0.3, 0.5, 1] as [number, number, number],
    glowColor: [1, 1, 1] as [number, number, number],
  },
  dark: {
    dark: 1,
    diffuse: 1.2,
    mapSamples: 16000,
    mapBrightness: 6,
    baseColor: [0.3, 0.3, 0.3] as [number, number, number],
    markerColor: [1, 0.5, 1] as [number, number, number],
    glowColor: [0.1, 0.1, 0.1] as [number, number, number],
  },
  minimal: {
    dark: 0,
    diffuse: 3,
    mapSamples: 40000,
    mapBrightness: 1.5,
    baseColor: [1, 1, 1] as [number, number, number],
    markerColor: [0.1, 0.1, 0.1] as [number, number, number],
    glowColor: [1, 1, 1] as [number, number, number],
  },
  neon: {
    dark: 2,
    diffuse: 0.6,
    mapSamples: 20000,
    mapBrightness: 12,
    baseColor: [0.02, 0.02, 0.1] as [number, number, number],
    markerColor: [0, 1, 0.8] as [number, number, number],
    glowColor: [0, 0.5, 0.8] as [number, number, number],
  },
}

const markerPresets = {
  'World Cities': {
    markers: [
      {
        id: 'pg-sf',
        location: [37.78, -122.44] as [number, number],
        label: 'San Francisco',
      },
      {
        id: 'pg-nyc',
        location: [40.71, -74.01] as [number, number],
        label: 'New York',
      },
      {
        id: 'pg-london',
        location: [51.51, -0.13] as [number, number],
        label: 'London',
      },
      {
        id: 'pg-tokyo',
        location: [35.68, 139.65] as [number, number],
        label: 'Tokyo',
      },
      {
        id: 'pg-sydney',
        location: [-33.87, 151.21] as [number, number],
        label: 'Sydney',
      },
      {
        id: 'pg-singapore',
        location: [1.35, 103.82] as [number, number],
        label: 'Singapore',
      },
      {
        id: 'pg-dubai',
        location: [25.2, 55.27] as [number, number],
        label: 'Dubai',
      },
      {
        id: 'pg-saopaulo',
        location: [-23.55, -46.63] as [number, number],
        label: 'São Paulo',
      },
      {
        id: 'pg-capetown',
        location: [-33.92, 18.42] as [number, number],
        label: 'Cape Town',
      },
    ],
    arcs: [
      {
        id: 'pg-sf-tokyo',
        from: [37.78, -122.44] as [number, number],
        to: [35.68, 139.65] as [number, number],
      },
      {
        id: 'pg-nyc-london',
        from: [40.71, -74.01] as [number, number],
        to: [51.51, -0.13] as [number, number],
      },
      {
        id: 'pg-london-dubai',
        from: [51.51, -0.13] as [number, number],
        to: [25.2, 55.27] as [number, number],
      },
    ],
  },
  'US Offices': {
    markers: [
      {
        id: 'pg-sf',
        location: [37.78, -122.44] as [number, number],
        label: 'San Francisco',
      },
      {
        id: 'pg-nyc',
        location: [40.71, -74.01] as [number, number],
        label: 'New York',
      },
      {
        id: 'pg-seattle',
        location: [47.61, -122.33] as [number, number],
        label: 'Seattle',
      },
      {
        id: 'pg-la',
        location: [34.05, -118.24] as [number, number],
        label: 'Los Angeles',
      },
      {
        id: 'pg-chicago',
        location: [41.88, -87.63] as [number, number],
        label: 'Chicago',
      },
      {
        id: 'pg-austin',
        location: [30.27, -97.74] as [number, number],
        label: 'Austin',
      },
    ],
    arcs: [
      {
        id: 'pg-sf-nyc',
        from: [37.78, -122.44] as [number, number],
        to: [40.71, -74.01] as [number, number],
      },
      {
        id: 'pg-seattle-chicago',
        from: [47.61, -122.33] as [number, number],
        to: [41.88, -87.63] as [number, number],
      },
      {
        id: 'pg-la-austin',
        from: [34.05, -118.24] as [number, number],
        to: [30.27, -97.74] as [number, number],
      },
    ],
  },
  'Flight Routes': {
    markers: [
      {
        id: 'pg-lhr',
        location: [51.47, -0.46] as [number, number],
        label: 'LHR',
      },
      {
        id: 'pg-jfk',
        location: [40.64, -73.78] as [number, number],
        label: 'JFK',
      },
      {
        id: 'pg-dxb',
        location: [25.25, 55.36] as [number, number],
        label: 'DXB',
      },
      {
        id: 'pg-sin',
        location: [1.36, 103.99] as [number, number],
        label: 'SIN',
      },
      {
        id: 'pg-hnd',
        location: [35.55, 139.78] as [number, number],
        label: 'HND',
      },
      {
        id: 'pg-syd',
        location: [-33.95, 151.18] as [number, number],
        label: 'SYD',
      },
      {
        id: 'pg-cdg',
        location: [49.01, 2.55] as [number, number],
        label: 'CDG',
      },
    ],
    arcs: [
      {
        id: 'pg-lhr-jfk',
        from: [51.47, -0.46] as [number, number],
        to: [40.64, -73.78] as [number, number],
      },
      {
        id: 'pg-dxb-sin',
        from: [25.25, 55.36] as [number, number],
        to: [1.36, 103.99] as [number, number],
      },
      {
        id: 'pg-hnd-syd',
        from: [35.55, 139.78] as [number, number],
        to: [-33.95, 151.18] as [number, number],
      },
      {
        id: 'pg-cdg-dxb',
        from: [49.01, 2.55] as [number, number],
        to: [25.25, 55.36] as [number, number],
      },
    ],
  },
  'Data Centers': {
    markers: [
      {
        id: 'pg-sanjose',
        location: [37.37, -121.92] as [number, number],
        label: 'us-west-1',
      },
      {
        id: 'pg-ashburn',
        location: [39.04, -77.49] as [number, number],
        label: 'us-east-1',
      },
      {
        id: 'pg-dublin',
        location: [53.35, -6.26] as [number, number],
        label: 'eu-west-1',
      },
      {
        id: 'pg-frankfurt',
        location: [50.11, 8.68] as [number, number],
        label: 'eu-central-1',
      },
      {
        id: 'pg-singapore',
        location: [1.35, 103.82] as [number, number],
        label: 'ap-southeast-1',
      },
      {
        id: 'pg-tokyo',
        location: [35.68, 139.65] as [number, number],
        label: 'ap-northeast-1',
      },
      {
        id: 'pg-sydney',
        location: [-33.87, 151.21] as [number, number],
        label: 'ap-southeast-2',
      },
      {
        id: 'pg-saopaulo',
        location: [-23.55, -46.63] as [number, number],
        label: 'sa-east-1',
      },
    ],
    arcs: [
      {
        id: 'pg-west-east',
        from: [37.37, -121.92] as [number, number],
        to: [39.04, -77.49] as [number, number],
      },
      {
        id: 'pg-dublin-frankfurt',
        from: [53.35, -6.26] as [number, number],
        to: [50.11, 8.68] as [number, number],
      },
      {
        id: 'pg-singapore-tokyo',
        from: [1.35, 103.82] as [number, number],
        to: [35.68, 139.65] as [number, number],
      },
    ],
  },
}

function InlinePlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const [preset, setPreset] =
    useState<keyof typeof playgroundPresets>('default')
  const [markerPreset, setMarkerPreset] =
    useState<keyof typeof markerPresets>('World Cities')
  const [phi, setPhi] = useState(0)
  const [theta, setTheta] = useState(0.2)
  const [dark, setDark] = useState(0)
  const [diffuse, setDiffuse] = useState(1.2)
  const [mapSamples, setMapSamples] = useState(16000)
  const [mapBrightness, setMapBrightness] = useState(6)
  const [mapBaseBrightness, setMapBaseBrightness] = useState(0)
  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [markerSize, setMarkerSize] = useState(0.04)
  const [markerElevation, setMarkerElevation] = useState(0)
  const [showArcs, setShowArcs] = useState(true)
  const [arcHeight, setArcHeight] = useState(0.25)
  const [arcWidth, setArcWidth] = useState(0.4)
  const [autoRotate, setAutoRotate] = useState(false)

  const stateRef = useRef({
    phi,
    theta,
    dark,
    diffuse,
    mapSamples,
    mapBrightness,
    mapBaseBrightness,
    scale,
    offsetX,
    offsetY,
    markerSize,
    markerElevation,
    showArcs,
    arcHeight,
    arcWidth,
    autoRotate,
    baseColor: playgroundPresets.default.baseColor,
    markerColor: playgroundPresets.default.markerColor,
    markers: markerPresets['World Cities'].markers,
    arcs: markerPresets['World Cities'].arcs,
    glowColor: playgroundPresets.default.glowColor,
  })

  useEffect(() => {
    stateRef.current = {
      phi,
      theta,
      dark,
      diffuse,
      mapSamples,
      mapBrightness,
      mapBaseBrightness,
      scale,
      offsetX,
      offsetY,
      markerSize,
      markerElevation,
      showArcs,
      arcHeight,
      arcWidth,
      autoRotate,
      baseColor: playgroundPresets[preset].baseColor,
      markerColor: playgroundPresets[preset].markerColor,
      glowColor: playgroundPresets[preset].glowColor,
      markers: markerPresets[markerPreset].markers,
      arcs: markerPresets[markerPreset].arcs,
    }
  }, [
    phi,
    theta,
    dark,
    diffuse,
    mapSamples,
    mapBrightness,
    mapBaseBrightness,
    scale,
    offsetX,
    offsetY,
    markerSize,
    markerElevation,
    showArcs,
    arcHeight,
    arcWidth,
    autoRotate,
    preset,
    markerPreset,
  ])

  useEffect(() => {
    const p = playgroundPresets[preset]
    setDark(p.dark)
    setDiffuse(p.diffuse)
    setMapBrightness(p.mapBrightness)
  }, [preset])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const deltaX = e.clientX - pointerInteracting.current.x
      const deltaY = e.clientY - pointerInteracting.current.y
      dragOffset.current = {
        phi: deltaX / 150,
        theta: deltaY / 300,
      }
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
  }, [])

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerup', handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const width = canvasRef.current.offsetWidth
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      window.innerWidth < 640 ? 1.8 : 2,
    )

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: dpr,
      width: width,
      height: width,
      phi: 0,
      theta: 0.2,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 1, 1],
      markerColor: [0.3, 0.5, 1],
      glowColor: [1, 1, 1],
      markers: stateRef.current.markers.map((m) => ({ ...m, size: 0.04 })),
      arcs: stateRef.current.arcs,
      arcColor: [0.3, 0.5, 1],
      arcWidth: 0.4,
      arcHeight: 0.25,
    })

    let animationId: number
    function animate() {
      const s = stateRef.current
      if (s.autoRotate) {
        phiRef.current += 0.003
      }
      globe.update({
        phi: s.phi + phiRef.current + dragOffset.current.phi,
        theta: s.theta + thetaOffsetRef.current + dragOffset.current.theta,
        scale: s.scale,
        offset: [s.offsetX, s.offsetY],
        dark: s.dark,
        diffuse: s.diffuse,
        mapSamples: s.mapSamples,
        mapBrightness: s.mapBrightness,
        mapBaseBrightness: s.mapBaseBrightness,
        baseColor: s.baseColor,
        markerColor: s.markerColor,
        glowColor: s.glowColor,
        markerElevation: s.markerElevation,
        markers: s.markers.map((m) => ({ ...m, size: s.markerSize })),
        arcs: s.showArcs ? s.arcs : [],
        arcHeight: s.arcHeight,
        arcWidth: s.arcWidth,
      })
      animationId = requestAnimationFrame(animate)
    }
    animate()

    globeRef.current = globe
    setTimeout(
      () => canvasRef.current && (canvasRef.current.style.opacity = '1'),
    )
    return () => {
      cancelAnimationFrame(animationId)
      globe.destroy()
    }
  }, [])

  return (
    <section className='section'>
      <h2>Playground</h2>
      <p className='section-intro'>
        Experiment with different options in real-time. Adjust the controls
        below to see how they affect the globe.
      </p>
      <div className='playground-inline'>
        <div className='playground-canvas-wrap'>
          <canvas
            ref={canvasRef}
            className='playground-canvas'
            onPointerDown={(e) => {
              pointerInteracting.current = { x: e.clientX, y: e.clientY }
              if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
            }}
          />
          {markerPresets[markerPreset].markers.map((m) => (
            <div
              key={m.id}
              className='playground-marker-label'
              style={
                {
                  positionAnchor: `--cobe-${m.id}`,
                  opacity: `var(--cobe-visible-${m.id}, 0)`,
                  filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
                } as React.CSSProperties
              }
            >
              {m.label}
            </div>
          ))}
        </div>
        <div className='playground-controls'>
          <div className='playground-control'>
            <label>
              phi <code>{phi.toFixed(2)}</code>
            </label>
            <input
              type='range'
              min='0'
              max='6.28'
              step='0.01'
              value={phi}
              onChange={(e) => setPhi(parseFloat(e.target.value))}
            />
          </div>
          <div className='playground-control'>
            <label>
              theta <code>{theta.toFixed(2)}</code>
            </label>
            <input
              type='range'
              min='-0.5'
              max='0.5'
              step='0.01'
              value={theta}
              onChange={(e) => setTheta(parseFloat(e.target.value))}
            />
          </div>
          <div className='playground-control'>
            <label>Theme</label>
            <select
              value={preset}
              onChange={(e) =>
                setPreset(e.target.value as keyof typeof playgroundPresets)
              }
            >
              <option value='default'>Default (Light)</option>
              <option value='dark'>Dark Mode</option>
              <option value='minimal'>Minimal</option>
              <option value='neon'>Neon</option>
            </select>
          </div>
          <div className='playground-control'>
            <label>Markers</label>
            <select
              value={markerPreset}
              onChange={(e) =>
                setMarkerPreset(e.target.value as keyof typeof markerPresets)
              }
            >
              {Object.keys(markerPresets).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div className='playground-control'>
            <label>
              dark <code>{dark.toFixed(2)}</code>
            </label>
            <input
              type='range'
              min='0'
              max='2'
              step='0.01'
              value={dark}
              onChange={(e) => setDark(parseFloat(e.target.value))}
            />
          </div>
          <div className='playground-control'>
            <label>
              diffuse <code>{diffuse.toFixed(1)}</code>
            </label>
            <input
              type='range'
              min='0'
              max='3'
              step='0.1'
              value={diffuse}
              onChange={(e) => setDiffuse(parseFloat(e.target.value))}
            />
          </div>
          <div className='playground-control'>
            <label>
              mapSamples <code>{mapSamples}</code>
            </label>
            <input
              type='range'
              min='1000'
              max='40000'
              step='1000'
              value={mapSamples}
              onChange={(e) => setMapSamples(parseFloat(e.target.value))}
            />
          </div>
          <div className='playground-control'>
            <label>
              mapBrightness <code>{mapBrightness.toFixed(1)}</code>
            </label>
            <input
              type='range'
              min='0'
              max='12'
              step='0.5'
              value={mapBrightness}
              onChange={(e) => setMapBrightness(parseFloat(e.target.value))}
            />
          </div>
          <div className='playground-control'>
            <label>
              mapBaseBrightness <code>{mapBaseBrightness.toFixed(2)}</code>
            </label>
            <input
              type='range'
              min='0'
              max='1'
              step='0.01'
              value={mapBaseBrightness}
              onChange={(e) => setMapBaseBrightness(parseFloat(e.target.value))}
            />
          </div>
          <div className='playground-control'>
            <label>
              scale <code>{scale.toFixed(2)}</code>
            </label>
            <input
              type='range'
              min='0.5'
              max='2'
              step='0.05'
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
            />
          </div>
          <div className='playground-control'>
            <label>
              offset[0] <code>{offsetX}</code>
            </label>
            <input
              type='range'
              min='-200'
              max='200'
              step='10'
              value={offsetX}
              onChange={(e) => setOffsetX(parseFloat(e.target.value))}
            />
          </div>
          <div className='playground-control'>
            <label>
              offset[1] <code>{offsetY}</code>
            </label>
            <input
              type='range'
              min='-200'
              max='200'
              step='10'
              value={offsetY}
              onChange={(e) => setOffsetY(parseFloat(e.target.value))}
            />
          </div>
          <div className='playground-control'>
            <label>
              markerSize <code>{markerSize.toFixed(3)}</code>
            </label>
            <input
              type='range'
              min='0'
              max='0.1'
              step='0.005'
              value={markerSize}
              onChange={(e) => setMarkerSize(parseFloat(e.target.value))}
            />
          </div>
          <div className='playground-control'>
            <label>
              markerElevation <code>{markerElevation.toFixed(2)}</code>
            </label>
            <input
              type='range'
              min='0'
              max='0.2'
              step='0.01'
              value={markerElevation}
              onChange={(e) => setMarkerElevation(parseFloat(e.target.value))}
            />
          </div>
          <div className='playground-control'>
            <label>
              arcHeight <code>{arcHeight.toFixed(2)}</code>
            </label>
            <input
              type='range'
              min='0.05'
              max='0.5'
              step='0.01'
              value={arcHeight}
              onChange={(e) => setArcHeight(parseFloat(e.target.value))}
            />
          </div>
          <div className='playground-control'>
            <label>
              arcWidth <code>{arcWidth.toFixed(2)}</code>
            </label>
            <input
              type='range'
              min='0.1'
              max='2'
              step='0.1'
              value={arcWidth}
              onChange={(e) => setArcWidth(parseFloat(e.target.value))}
            />
          </div>
          <div className='playground-control'>
            <label>
              <input
                type='checkbox'
                checked={showArcs}
                onChange={(e) => setShowArcs(e.target.checked)}
              />
              Show Arcs
            </label>
          </div>
          <div className='playground-control'>
            <label>
              <input
                type='checkbox'
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
              />
              Auto Rotate
            </label>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [pkgManager, setPkgManager] =
    useState<keyof typeof installCommands>('Copy Prompt')
  const [copied, setCopied] = useState(false)

  const copyInstall = () => {
    navigator.clipboard.writeText(installCommands[pkgManager])
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className='page'>
      {/* Hero - Showcases */}
      <Showcases />

      {/* Install Section */}
      <section className='section'>
        <div className='install-box'>
          <div className='install-tabs'>
            {(
              Object.keys(installCommands) as Array<
                keyof typeof installCommands
              >
            ).map((pm) => (
              <button
                key={pm}
                className={`install-tab ${pkgManager === pm ? 'active' : ''}`}
                onClick={() => setPkgManager(pm)}
              >
                {pm}
              </button>
            ))}
          </div>
          <div className='install-command' onClick={copyInstall}>
            <code>{installCommands[pkgManager]}</code>
            <span className='install-copy'>{copied ? 'Copied!' : 'Copy'}</span>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className='section'>
        <h2>Usage</h2>
        <Code code={codeExample} />
        <p className='section-note'>
          Works with any framework:{' '}
          <a
            href='https://codesandbox.io/s/eager-sky-r2q0g'
            target='_blank'
            rel='noopener'
          >
            React
          </a>
          ,{' '}
          <a
            href='https://stackblitz.com/edit/vitejs-vite-l5a8xk'
            target='_blank'
            rel='noopener'
          >
            Vue
          </a>
          ,{' '}
          <a
            href='https://codesandbox.io/s/great-visvesvaraya-78yf6'
            target='_blank'
            rel='noopener'
          >
            Svelte
          </a>
          , or vanilla JS.
        </p>
      </section>

      {/* API Reference */}
      <section className='section'>
        <h2>API</h2>
        <p className='section-intro'>
          <code>createGlobe(canvas, options)</code> returns an object with{' '}
          <code>update()</code> and <code>destroy()</code> methods.
        </p>
        <h3 className='api-subheading'>Options</h3>
        <div className='api-grid'>
          {apiOptions.map((opt) => (
            <div key={opt.name} className='api-item'>
              <div className='api-header'>
                <code className='api-name'>{opt.name}</code>
                <span className='api-type'>{opt.type}</span>
                {opt.required && <span className='api-required'>required</span>}
              </div>
              <span className='api-desc'>{opt.desc}</span>
            </div>
          ))}
        </div>
        <h3 className='api-subheading'>Returned Methods</h3>
        <div className='api-grid'>
          {returnedMethods.map((method) => (
            <div key={method.name} className='api-item'>
              <div className='api-header'>
                <code className='api-name'>{method.name}</code>
                <span className='api-type'>{method.type}</span>
              </div>
              <span className='api-desc'>{method.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recipes */}
      <Recipes />

      {/* Markers & Arcs */}
      <MarkersArcs />

      {/* Custom Labels */}
      <CustomLabels />

      {/* Playground */}
      <InlinePlayground />

      {/* Footer */}
      <footer className='footer'>
        <div className='footer-links'>
          <a
            href='https://github.com/shuding/cobe'
            target='_blank'
            rel='noopener'
          >
            GitHub
          </a>
          <span className='footer-links-sep'>/</span>
          <a href='https://x.com/shuding' target='_blank' rel='noopener'>
            @shuding
          </a>
          <span className='footer-links-sep'>/</span>
          <a
            href='https://x.com/shuding/status/1475916082875666441'
            target='_blank'
            rel='noopener'
          >
            Tech Details →
          </a>
        </div>
      </footer>
    </div>
  )
}
