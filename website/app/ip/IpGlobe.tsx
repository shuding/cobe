'use client'

import createGlobe from 'cobe'
import { useEffect, useRef } from 'react'

interface IpGlobeProps {
  lat: number
  lon: number
  city: string
}

export function IpGlobe({ lat, lon, city }: IpGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const phi = -(lon * Math.PI) / 180 - Math.PI / 2
    const theta = (lat * Math.PI) / 180

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi,
      theta,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 1, 1],
      markerColor: [0.2, 0.4, 1],
      glowColor: [1, 1, 1],
      markerElevation: 0,
      markers: [{ location: [lat, lon], size: 0.03, id: 'city' }],
    })

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = '1'
    }, 100)

    return () => globe.destroy()
  }, [lat, lon])

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '1',
        position: 'relative',
      }}
    >
      <style>{`@supports not (anchor-name: --test) { .ip-city-label { display: none; } }`}</style>
      <canvas
        ref={canvasRef}
        className='globe-canvas'
        width={600 * 2}
        height={600 * 2}
        style={{ opacity: 0, transition: 'opacity 1.2s ease' }}
      />
      <div
        className='ip-city-label'
        style={
          {
            position: 'absolute',
            bottom: 'anchor(top)',
            left: 'anchor(center)',
            translate: '-50% 0',
            marginBottom: '8px',
            padding: '0.15rem 0.35rem',
            background: 'var(--ink)',
            color: 'var(--bg)',
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            positionAnchor: '--cobe-city',
            opacity: 'var(--cobe-visible-city, 0)',
            transition: 'opacity 0.8s',
          } as React.CSSProperties
        }
      >
        {city}
      </div>
    </div>
  )
}

