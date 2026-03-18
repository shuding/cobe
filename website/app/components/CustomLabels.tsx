'use client'

import { useState } from 'react'
import { Code, Desc } from './ui'

const customLabelsTabs: {
  key: string
  name: string
  code: string
  css?: string
  description: string
}[] = [
  {
    key: 'marker-labels',
    name: 'Marker Labels',
    code: `// 1. Define markers with IDs
const markers = [
  { id: 'sf', location: [37.78, -122.44], label: 'San Francisco' },
  { id: 'tokyo', location: [35.68, 139.65], label: 'Tokyo' },
]

// 2. Pass to COBE (label is your custom property)
createGlobe(canvas, {
  markers: markers.map(m => ({
    location: m.location, size: 0.03, id: m.id
  })),
})

// 3. Render labels anchored to markers
{markers.map(m => (
  <div
    key={m.id}
    className="marker-label"
    style={{
      positionAnchor: \`--cobe-\${m.id}\`,
      opacity: \`var(--cobe-visible-\${m.id}, 0)\`
    }}
  >
    {m.label}
  </div>
))}`,
    css: `.marker-label {
  position: absolute;
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% 0;
  margin-bottom: 8px;
  padding: 0.25rem 0.5rem;
  background: #1a1a1a;
  color: #fff;
  font-size: 0.75rem;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 0.3s;
}`,
    description:
      'COBE creates `--cobe-{id}` anchor and `--cobe-visible-{id}` visibility variable for each marker with an ID. The visibility is 1 when facing the camera, 0 when hidden.',
  },
  {
    key: 'arc-labels',
    name: 'Arc Labels',
    code: `// 1. Define arcs with IDs
const arcs = [
  { id: 'sf-tokyo', from: [37.78, -122.44], to: [35.68, 139.65], label: 'SF → Tokyo' },
]

// 2. Pass to COBE
createGlobe(canvas, {
  arcs: arcs.map(a => ({ from: a.from, to: a.to, id: a.id })),
  arcHeight: 0.3,
})

// 3. Render labels anchored to arc midpoints
{arcs.map(a => (
  <div
    key={a.id}
    className="arc-label"
    style={{
      positionAnchor: \`--cobe-arc-\${a.id}\`,
      opacity: \`var(--cobe-visible-arc-\${a.id}, 0)\`
    }}
  >
    {a.label}
  </div>
))}`,
    css: `.arc-label {
  position: absolute;
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% 0;
  margin-bottom: 8px;
  padding: 0.3rem 0.6rem;
  background: #fff;
  color: #1a1a1a;
  font-size: 0.7rem;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}`,
    description:
      "Arc anchors use `--cobe-arc-{id}` prefix. The anchor is positioned at the arc's highest point (peak), ideal for flight paths.",
  },
  {
    key: 'advanced transitions',
    name: 'Advanced Transitions',
    code: `\
{markers.map(m => (
  <div
    key={m.id}
    className="marker-label"
    style={{
      positionAnchor: \`--cobe-\${m.id}\`,
      // Fade out when marker rotates to back of globe
      opacity: \`var(--cobe-visible-\${m.id}, 0)\`,
      // Blur when marker is hidden (fallback used when var is undefined)
      filter: \`blur(var(--cobe-visible-\${m.id}, 8px))\`
    }}
  >
    {m.label}
  </div>
))}`,
    css: `\
.marker-label {
  /* ...rest of the styles... */

  /* Smooth transitions */
  transition: opacity 0.3s, filter 0.3s;
}
`,
    description:
      'The visibility variable is undefined when hidden, triggering the CSS fallback. When visible, it contains an invalid value that browsers ignore.',
  },
  {
    key: 'rich',
    name: 'Rich Content',
    code: `// Labels can contain any React/HTML content
<div
  className="analytics-label"
  style={{ positionAnchor: \`--cobe-\${m.id}\` }}
>
  <span className="count">{m.visitors}</span>
  <span className={m.trend >= 0 ? 'up' : 'down'}>
    {m.trend >= 0 ? '↑' : '↓'} {Math.abs(m.trend)}%
  </span>
</div>

// Interactive labels
<button
  className="city-label"
  style={{ positionAnchor: \`--cobe-\${m.id}\` }}
  onClick={() => setSelected(m.id)}
>
  {m.name}
  {selected === m.id && <Detail data={m} />}
</button>`,
    description:
      'Labels are regular DOM elements. Add click handlers, hover states, animations, or nest complex components. Use `pointer-events: auto` for interactive labels.',
  },
  {
    key: 'browser-support',
    name: 'Browser Support',
    code: `/* Hide labels in browsers without anchor positioning */
@supports not (anchor-name: --test) {
  .marker-label,
  .arc-label {
    display: none;
  }
}

/* Alternative: show labels without positioning */
@supports not (anchor-name: --test) {
  .marker-label {
    position: static;
    /* Render as a list or different layout */
  }
}`,
    description:
      'CSS Anchor Positioning is supported in Chrome 125+, Edge 125+, Firefox 147+, and Safari 26+. Use `@supports` to hide labels or provide a fallback for older browsers.',
  },
]

export function CustomLabels() {
  const [activeTab, setActiveTab] = useState('marker-labels')
  const tab = customLabelsTabs.find((t) => t.key === activeTab)!

  return (
    <section className='section'>
      <h2>Custom Labels</h2>
      <p className='section-intro'>
        Use CSS Anchor Positioning to attach labels, tooltips, or any DOM
        element to markers and arcs.
      </p>
      <div className='recipes-tabs'>
        {customLabelsTabs.map((t) => (
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
        {'css' in tab && tab.css && (
          <div style={{ marginTop: '1rem' }}>
            <Code code={tab.css} />
          </div>
        )}
        <p className='recipe-desc'>
          <Desc text={tab.description} />
        </p>
      </div>
    </section>
  )
}
