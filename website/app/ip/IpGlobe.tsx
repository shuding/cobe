'use client'

import createGlobe from 'cobe'
import { useEffect, useRef } from 'react'

interface IpGlobeProps {
  lat: number
  lon: number
}

export function IpGlobe({ lat, lon }: IpGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const phi = Math.PI / 2 - (lon * Math.PI) / 180
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
      markers: [{ location: [lat, lon], size: 0.03 }],
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
      <canvas
        ref={canvasRef}
        className='globe-canvas'
        width={600 * 2}
        height={600 * 2}
        style={{ opacity: 0, transition: 'opacity 1.2s ease' }}
      />
    </div>
  )
}

