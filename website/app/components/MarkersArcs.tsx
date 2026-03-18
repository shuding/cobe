'use client'

import { useState } from 'react'
import { Code, Desc } from './ui'

const markersArcsTabs = [
  {
    key: 'markers',
    name: 'Markers',
    code: `markers: [
  // Basic marker
  { location: [37.78, -122.44], size: 0.03 },
  // With custom color (RGB 0-1)
  { location: [51.51, -0.13], size: 0.05, color: [1, 0, 0] },
  // With id for CSS anchoring
  { location: [35.68, 139.65], size: 0.04, id: 'tokyo' }
]`,
    description:
      'Place dots on the globe using `[latitude, longitude]`. Size is relative to globe radius (0.01-0.1). Colors override the global `markerColor`.',
  },
  {
    key: 'arcs',
    name: 'Arcs',
    code: `arcs: [
  // Basic arc between two points
  { from: [37.78, -122.44], to: [51.51, -0.13] },
  // With custom color
  { from: [40.71, -74.01], to: [48.86, 2.35], color: [0, 1, 0] },
  // With id for CSS anchoring (anchors at arc midpoint)
  { from: [35.68, 139.65], to: [-33.87, 151.21], id: 'tokyo-sydney' }
]

// Global arc settings
arcColor: [0.3, 0.5, 1],  // Default color
arcWidth: 0.5,            // Line thickness
arcHeight: 0.3            // Curve height above surface`,
    description:
      "Draw curved lines between locations. Arc anchors position at the curve's peak for attaching labels or tooltips.",
  },
]

export function MarkersArcs() {
  const [activeTab, setActiveTab] = useState('markers')
  const tab = markersArcsTabs.find((t) => t.key === activeTab)!

  return (
    <section className='section'>
      <h2>Markers & Arcs</h2>
      <div className='recipes-tabs'>
        {markersArcsTabs.map((t) => (
          <button
            key={t.key}
            className={`recipe-tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div className='recipe-content'>
        <Code code={tab.code} />
        <p className='recipe-desc'>
          <Desc text={tab.description} />
        </p>
      </div>
    </section>
  )
}
