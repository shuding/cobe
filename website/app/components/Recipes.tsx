'use client'

import { useState } from 'react'
import { Code, Desc } from './ui'

const recipes = [
  {
    key: 'rotate',
    name: 'Auto Rotate',
    code: `const globe = createGlobe(canvas, { phi: 0, ... })

let phi = 0
function animate() {
  phi += 0.005 // Adjust speed as needed
  globe.update({ phi })
  requestAnimationFrame(animate)
}
animate()`,
    description:
      'Call `globe.update()` in a `requestAnimationFrame` loop for continuous rotation. Use smaller values (0.001-0.003) for subtle movement, larger values (0.01+) for faster spins.',
  },
  {
    key: 'drag',
    name: 'Draggable',
    code: `// Track pointer and apply spring physics
const pointerRef = useRef(null)
const [{ r }, api] = useSpring(() => ({ r: 0 }))

onPointerDown: (e) => pointerRef.current = e.clientX
onPointerMove: (e) => {
  if (pointerRef.current !== null) {
    const delta = e.clientX - pointerRef.current
    api.start({ r: delta / 200 })
  }
}
onPointerUp: () => pointerRef.current = null

// In animation loop:
globe.update({ phi: baseRotation + r.get() })`,
    description:
      'Combine with react-spring for momentum-based interactions. The spring provides natural deceleration when released.',
  },
  {
    key: 'focus',
    name: 'Focus Location',
    code: `// Convert lat/long to globe angles
function locationToAngles(lat, long) {
  return [
    Math.PI - ((long * Math.PI) / 180 - Math.PI / 2),
    (lat * Math.PI) / 180
  ]
}

const [targetPhi, targetTheta] = locationToAngles(35.68, 139.65)

// Ease toward target in animation loop
function animate() {
  const distPhi = targetPhi - currentPhi
  currentPhi += distPhi * 0.08
  globe.update({ phi: currentPhi, theta: targetTheta })
  requestAnimationFrame(animate)
}`,
    description:
      'Focus on any city by converting coordinates to angles. Use easing (0.05-0.1) for smooth camera transitions.',
  },
  {
    key: 'anchors',
    name: 'CSS Anchors',
    code: `// 1. Add id to markers and arcs
markers: [
  { location: [37.78, -122.44], size: 0.03, id: 'sf' }
]

// 2. COBE creates CSS variables automatically:
// --cobe-{id} (anchor position)
// --cobe-visible-{id} (0 when hidden, 1 when visible)

// 3. Position elements using CSS anchor functions
<div style={{
  position: 'absolute',
  positionAnchor: '--cobe-sf',
  bottom: 'anchor(top)',
  left: 'anchor(center)',
  opacity: 'var(--cobe-visible-sf, 0)'
}}>
  San Francisco
</div>`,
    description:
      'The `positionAnchor` property links DOM elements to markers. Use `anchor()` for positioning and visibility variables for fade effects.',
  },
  {
    key: 'dynamic',
    name: 'Dynamic Markers',
    code: `// Store markers in a ref
const markersRef = useRef([
  { location: [37.78, -122.44], size: 0.03 }
])

// Add marker dynamically
function addMarker(lat, lon) {
  markersRef.current = [
    ...markersRef.current,
    { location: [lat, lon], size: 0.03 }
  ]
}

// Update markers each frame
function animate() {
  globe.update({ markers: markersRef.current })
  requestAnimationFrame(animate)
}`,
    description:
      'Pass updated markers to `globe.update()` to add/remove markers without recreating the globe. The same pattern works for arcs.',
  },
  {
    key: 'perf',
    name: 'Performance',
    code: `// Tune mapSamples based on use case
mapSamples: 16000,  // Default, good balance
mapSamples: 8000,   // Mobile / low-end devices
mapSamples: 40000,  // High-res / hero sections

// Cap pixel ratio to avoid GPU overload
devicePixelRatio: Math.min(window.devicePixelRatio, 2),

// Pause rendering when not visible
const observer = new IntersectionObserver(([e]) => {
  if (e.isIntersecting) animate()
})
observer.observe(canvasRef.current)`,
    description:
      '`mapSamples` has the biggest performance impact. Start with 8000-16000 and increase for hero sections. Cap `devicePixelRatio` at 2.',
  },
  {
    key: 'cleanup',
    name: 'Cleanup',
    code: `// createGlobe returns { update, destroy }
useEffect(() => {
  const globe = createGlobe(canvas, { ... })

  let phi = 0
  function animate() {
    phi += 0.005
    globe.update({ phi })
    requestAnimationFrame(animate)
  }
  animate()

  // Always clean up when unmounting
  return () => globe.destroy()
}, [])`,
    description:
      'Call `globe.destroy()` to release the WebGL context and stop rendering. Essential for SPAs to prevent memory leaks.',
  },
]

export function Recipes() {
  const [activeRecipe, setActiveRecipe] = useState('rotate')
  const recipe = recipes.find((r) => r.key === activeRecipe)!

  return (
    <section className='section'>
      <h2>Recipes</h2>
      <div className='recipes-tabs'>
        {recipes.map((r) => (
          <button
            key={r.key}
            className={`recipe-tab ${activeRecipe === r.key ? 'active' : ''}`}
            onClick={() => setActiveRecipe(r.key)}
          >
            {r.name}
          </button>
        ))}
      </div>
      <div className='recipe-content'>
        <Code code={recipe.code} />
        <p className='recipe-desc'>
          <Desc text={recipe.description} />
        </p>
      </div>
    </section>
  )
}
