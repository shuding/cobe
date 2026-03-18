'use client'

import createGlobe from 'cobe'
import { useEffect, useRef, useState } from 'react'
import {
  showcaseConfigs,
  getShowcaseMarkers,
  getShowcaseArcs,
  ShowcaseKey,
  // Marker data for overlays
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
  labelMarkers,
  satelliteMarkers,
  weatherMarkers,
  cdnMarkers,
} from '../showcases-data'

// Phase definitions: which showcases appear in each phase
const phases: { showcases: ShowcaseKey[]; duration: number }[] = [
  { showcases: ['default'], duration: 1500 },
  { showcases: ['cdn', 'stickers'], duration: 2000 },
  { showcases: ['labels', 'satellites', 'polaroids', 'live'], duration: 3000 },
  {
    showcases: [
      'flights',
      'interactive',
      'analytics',
      'pulse',
      'weather',
      'bars',
      'polaroids',
      'cdn',
      'stickers',
    ],
    duration: 4000,
  },
  { showcases: [], duration: 3000 }, // Text phase
]

function ShowcaseGlobe({
  showcaseKey,
  instanceKey,
}: {
  showcaseKey: ShowcaseKey
  instanceKey: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const config = showcaseConfigs[showcaseKey]

  useEffect(() => {
    if (!canvasRef.current) return
    let phi = 0
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
      theta: config.theta,
      dark: config.dark,
      diffuse: 1.5,
      mapSamples: 16000,
      mapBrightness: config.mapBrightness,
      baseColor: config.baseColor,
      markerColor: config.markerColor,
      glowColor: [0.94, 0.93, 0.91],
      markerElevation: config.markerElevation,
      markers: getShowcaseMarkers(showcaseKey, config.markerSize),
      arcs: getShowcaseArcs(showcaseKey),
      arcColor: config.arcColor,
      arcWidth: 0.5,
      arcHeight: 0.25,
      opacity: 0.7,
    })

    let animationId: number
    function animate() {
      phi += 0.003
      globe.update({
        phi,
        markers: getShowcaseMarkers(showcaseKey, config.markerSize),
      })
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      globe.destroy()
    }
  }, [showcaseKey, config])

  return (
    <div className='showcase-phase-item'>
      <div className='showcase-phase-globe'>
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
        <canvas ref={canvasRef} className='showcase-phase-canvas' />

        {/* Default */}
        {showcaseKey === 'default' && (
          <>
            <div className='globe-overlay'>
              <h1>COBE</h1>
            </div>
            <div className='orbit-ring' aria-hidden='true'>
              <svg className='orbit-svg' viewBox='0 0 300 300'>
                <defs>
                  <path
                    id={`orbitPath-${instanceKey}`}
                    d='M 150,150 m -130,0 a 130,130 0 1,0 260,0 a 130,130 0 1,0 -260,0'
                  />
                </defs>
                <text className='orbit-text'>
                  <textPath href={`#orbitPath-${instanceKey}`}>
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
                    filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
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
                    filter: `blur(calc((1 - var(--cobe-visible-arc-${a.id}, 0)) * 8px))`,
                  } as React.CSSProperties
                }
              >
                {a.label}
              </div>
            ))}
          </>
        )}

        {/* Stickers */}
        {showcaseKey === 'stickers' &&
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
        {showcaseKey === 'live' &&
          liveMarkers.map((m) => (
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
            </div>
          ))}

        {/* Interactive Markers */}
        {showcaseKey === 'interactive' &&
          interactiveMarkers.map((m) => (
            <div
              key={m.id}
              className='showcase-interactive'
              style={
                {
                  positionAnchor: `--cobe-${m.id}`,
                  opacity: `var(--cobe-visible-${m.id}, 0)`,
                  filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
                } as React.CSSProperties
              }
            >
              <span className='showcase-interactive-name'>{m.name}</span>
            </div>
          ))}

        {/* Polaroids */}
        {showcaseKey === 'polaroids' &&
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
        {showcaseKey === 'pulse' &&
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
        {showcaseKey === 'bars' &&
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
        {showcaseKey === 'analytics' &&
          analyticsMarkers.map((m) => (
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
        {showcaseKey === 'flights' &&
          flightArcs.map((a) => (
            <div
              key={a.id}
              className='showcase-flight'
              style={
                {
                  positionAnchor: `--cobe-arc-${a.id}`,
                  opacity: `var(--cobe-visible-arc-${a.id}, 0)`,
                } as React.CSSProperties
              }
            >
              ✈️
            </div>
          ))}

        {/* Labels */}
        {showcaseKey === 'labels' &&
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
        {showcaseKey === 'satellites' &&
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

        {/* Weather */}
        {showcaseKey === 'weather' &&
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

        {/* CDN */}
        {showcaseKey === 'cdn' &&
          cdnMarkers.map((m) => (
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
      </div>
    </div>
  )
}

export default function ShowcasesGrid() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase((p) => (p + 1) % phases.length)
    }, phases[phase].duration)
    return () => clearTimeout(timer)
  }, [phase])

  return (
    <div className='showcases-phase-page'>
      {/* Render all phases, show only the current one */}
      {phases.map((p, phaseIndex) => (
        <div
          key={phaseIndex}
          className={`showcases-phase-grid showcases-phase-${p.showcases.length}${phase === phaseIndex ? ' showcases-phase-active' : ''}`}
        >
          {p.showcases.length === 0 ? (
            <div className='showcases-phase-text'>cobe.vercel.app</div>
          ) : (
            p.showcases.map((key, i) => (
              <ShowcaseGlobe
                key={`${phaseIndex}-${key}-${i}`}
                showcaseKey={key}
                instanceKey={`${phaseIndex}-${key}-${i}`}
              />
            ))
          )}
        </div>
      ))}
    </div>
  )
}
