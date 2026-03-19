'use client'

import createGlobe from 'cobe'
import { useEffect, useRef } from 'react'

interface IpGlobeProps {
  lat: number | null
  lon: number | null
  city: string | null
}

const EASING_FACTOR = 0.05
const STOP_THRESHOLD = 0.0001

export function IpGlobe({ lat, lon, city }: IpGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const targetPhi = lon !== null ? -(lon * Math.PI) / 180 - Math.PI / 2 : -Math.PI / 2
    const targetTheta = lat !== null ? (lat * Math.PI) / 180 : 0
    const hasLocation = lat !== null && lon !== null

    // Start slightly offset so the globe eases into position
    let currentPhi = targetPhi - 0.15
    let currentTheta = targetTheta - 0.04

    const width = canvasRef.current.offsetWidth
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: dpr,
      width: width,
      height: width,
      phi: currentPhi,
      theta: currentTheta,
      dark: 0,
      diffuse: 1.5,
      mapSamples: 16000,
      mapBrightness: 10,
      baseColor: [1, 1, 1],
      markerColor: [0.3, 0.45, 0.85],
      glowColor: [0.94, 0.93, 0.91],
      markerElevation: 0,
      opacity: 0.7,
      markers: hasLocation ? [{ location: [lat!, lon!], size: 0.03, id: 'city' }] : [],
    })

    let animationId = 0
    let destroyed = false

    function animate() {
      if (destroyed) return
      const dPhi = targetPhi - currentPhi
      const dTheta = targetTheta - currentTheta

      if (Math.abs(dPhi) > STOP_THRESHOLD || Math.abs(dTheta) > STOP_THRESHOLD) {
        // Ease toward target: advance a fixed percentage of remaining distance each frame
        currentPhi += dPhi * EASING_FACTOR
        currentTheta += dTheta * EASING_FACTOR
        globe.update({ phi: currentPhi, theta: currentTheta })
        animationId = requestAnimationFrame(animate)
      } else {
        globe.update({ phi: targetPhi, theta: targetTheta })
      }
    }

    setTimeout(() => {
      if (!destroyed && canvasRef.current) canvasRef.current.style.opacity = '1'
      animate()
    })

    return () => {
      destroyed = true
      cancelAnimationFrame(animationId)
      globe.destroy()
    }
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
        {city ?? ''}
      </div>
    </div>
  )
}

