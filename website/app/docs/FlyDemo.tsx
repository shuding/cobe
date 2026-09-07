'use client'

// The demo on the docs page is deliberately the exact configuration the size
// table advertises: the lite renderer plus the pick layer, nothing else.
import createGlobe from 'cobe/lite'
import type { Globe, Marker } from 'cobe/lite'
import { pick, flyTo, centerOn } from 'cobe/pick'
import { useCallback, useEffect, useRef, useState } from 'react'

type City = {
  id: string
  name: string
  country: string
  location: [number, number]
}

const CITIES: City[] = [
  { id: 'sf', name: 'San Francisco', country: 'US', location: [37.7595, -122.4367] },
  { id: 'nyc', name: 'New York', country: 'US', location: [40.7128, -74.006] },
  { id: 'ldn', name: 'London', country: 'UK', location: [51.5072, -0.1276] },
  { id: 'ber', name: 'Berlin', country: 'DE', location: [52.52, 13.405] },
  { id: 'bom', name: 'Mumbai', country: 'IN', location: [19.076, 72.8777] },
  { id: 'blr', name: 'Bengaluru', country: 'IN', location: [12.9716, 77.5946] },
  { id: 'sgp', name: 'Singapore', country: 'SG', location: [1.3521, 103.8198] },
  { id: 'tyo', name: 'Tokyo', country: 'JP', location: [35.6762, 139.6503] },
  { id: 'syd', name: 'Sydney', country: 'AU', location: [-33.8688, 151.2093] },
  { id: 'gru', name: 'São Paulo', country: 'BR', location: [-23.5505, -46.6333] },
]

const SIZE = 440
const IDLE_SPIN = 0.0022
const ZOOM = 1.25

export function FlyDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<Globe | null>(null)

  // The idle spin owns phi/theta between flights. flyTo owns them during one,
  // which is why `flying` exists: two writers on the same frame would fight.
  const phiRef = useRef(4.7)
  const thetaRef = useRef(0.25)
  const flyingRef = useRef(false)
  const dragRef = useRef<{
    x: number
    y: number
    phi: number
    theta: number
  } | null>(null)

  const [selected, setSelected] = useState<City | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [clicked, setClicked] = useState<[number, number] | null>(null)

  const goTo = useCallback((city: City | null) => {
    const globe = globeRef.current
    if (!globe) return

    setSelected(city)
    setClicked(null)

    // Null means "reset": pull back out to the default view.
    const target = city ? city.location : ([20, 0] as [number, number])
    const zoom = city ? ZOOM : 1

    flyingRef.current = true
    flyTo(globe, target, {
      duration: 950,
      zoom,
      onDone: () => {
        // Hand the camera back to the idle spin from wherever it landed.
        const { phi, theta } = centerOn(target)
        phiRef.current = phi
        thetaRef.current = theta
        flyingRef.current = false
      },
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const markers: Marker[] = CITIES.map((c) => ({
      id: c.id,
      location: c.location,
      size: 0.05,
    }))

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: SIZE * 2,
      height: SIZE * 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: 1,
      diffuse: 1.2,
      scale: 1,
      mapSamples: 16000,
      mapBrightness: 5,
      baseColor: [0.32, 0.35, 0.42],
      markerColor: [0.35, 0.68, 1],
      glowColor: [0.11, 0.13, 0.18],
      offset: [0, 0],
      markers,
    })
    globeRef.current = globe

    const detach = pick(globe, canvas, {
      // pick's own cursor handling is off because the drag handler below wants
      // to show a grabbing cursor too, and one of them has to win.
      cursor: false,
      onMarkerClick: (marker) => {
        const city = CITIES.find((c) => c.id === marker.id)
        if (city) goTo(city)
      },
      onMarkerHover: (marker) => setHovered(marker ? (marker.id ?? null) : null),
      onGlobeClick: (location) => {
        setSelected(null)
        setClicked(location)
      },
    })

    // Drag to rotate. pick() has already cancelled any flight on pointerdown,
    // so read the live camera back out and carry on from there.
    const onDown = (e: PointerEvent) => {
      const [phi, theta] = globe.state()
      flyingRef.current = false
      dragRef.current = { x: e.clientX, y: e.clientY, phi, theta }
    }
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      phiRef.current = d.phi + (e.clientX - d.x) / 220
      thetaRef.current = Math.max(
        -1.1,
        Math.min(1.1, d.theta - (e.clientY - d.y) / 220),
      )
    }
    const onUp = () => {
      dragRef.current = null
    }

    canvas.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })

    let raf = 0
    const render = () => {
      // While a flight is running it is the only writer.
      if (!flyingRef.current && !document.hidden) {
        if (!dragRef.current) phiRef.current += IDLE_SPIN
        globe.update({ phi: phiRef.current, theta: thetaRef.current })
      }
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      detach()
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      globe.destroy()
      globeRef.current = null
    }
  }, [goTo])

  return (
    <div className='fd'>
      <div className='fd-stage'>
        <canvas
          ref={canvasRef}
          className='fd-canvas'
          width={SIZE * 2}
          height={SIZE * 2}
          style={{
            width: SIZE,
            height: SIZE,
            cursor: hovered ? 'pointer' : 'grab',
          }}
        />

        <div className='fd-readout'>
          {selected ? (
            <>
              <strong>{selected.name}</strong>
              <span>
                {selected.location[0].toFixed(2)},{' '}
                {selected.location[1].toFixed(2)}
              </span>
            </>
          ) : clicked ? (
            <>
              <strong>Ocean floor, probably</strong>
              <span>
                {clicked[0].toFixed(2)}, {clicked[1].toFixed(2)}
              </span>
            </>
          ) : (
            <>
              <strong>Click a dot</strong>
              <span>or anywhere on the map</span>
            </>
          )}
        </div>
      </div>

      <div className='fd-side'>
        <p className='fd-hint'>
          Drag to spin. Click a marker to fly to it, or click bare map to read
          its coordinates back.
        </p>
        <ul className='fd-list'>
          {CITIES.map((city) => (
            <li key={city.id}>
              <button
                type='button'
                onClick={() => goTo(city)}
                className={
                  selected?.id === city.id || hovered === city.id
                    ? 'fd-city fd-city-on'
                    : 'fd-city'
                }
              >
                <span>{city.name}</span>
                <span className='fd-cc'>{city.country}</span>
              </button>
            </li>
          ))}
        </ul>
        <button type='button' className='fd-reset' onClick={() => goTo(null)}>
          Reset view
        </button>
      </div>
    </div>
  )
}
