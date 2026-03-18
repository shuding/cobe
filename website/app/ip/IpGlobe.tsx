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
    // Center the globe on the user's longitude; add a slight offset so the
    // marker is visible in the upper portion of the sphere.
    let phi = -lon * (Math.PI / 180)
    const theta = lat * (Math.PI / 180) * 0.4

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
      markers: [{ location: [lat, lon] as [number, number], size: 0.05, id: 'you' }],
    })

    let animationId: number
    function animate() {
      phi += 0.003
      globe.update({ phi })
      animationId = requestAnimationFrame(animate)
    }
    animate()

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = '1'
    }, 100)

    return () => {
      cancelAnimationFrame(animationId)
      globe.destroy()
    }
  }, [lat, lon])

  return (
    <div className='ip-globe-wrap'>
      <div className='ip-globe'>
        <canvas
          ref={canvasRef}
          className='globe-canvas'
          width={600 * 2}
          height={600 * 2}
          style={{ opacity: 0, transition: 'opacity 1.2s ease' }}
        />
        <div
          className='ip-marker-label'
          style={
            {
              positionAnchor: '--cobe-you',
              opacity: 'var(--cobe-visible-you, 0)',
            } as React.CSSProperties
          }
        >
          {city}
        </div>
      </div>
    </div>
  )
}
