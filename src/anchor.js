// CSS Anchor Element Management for COBE v2
// Creates invisible anchor elements for DOM positioning of popups/tooltips

/**
 * Create and manage anchor elements for markers and arcs
 * @param {HTMLElement} wrapper - The wrapper element containing the canvas
 * @returns {{ m: Function, a: Function, r: Function }}
 */
export function createAnchorManager(wrapper) {
  const markerAnchors = {}
  const arcAnchors = {}
  const visibilityVars = {}

  // Create a style tag for :root CSS variables
  const styleEl = document.createElement('style')
  document.head.append(styleEl)

  function updateStyleTag() {
    let vars = ''
    for (let key in visibilityVars) {
      vars += key + ':' + visibilityVars[key] + ';'
    }
    styleEl.textContent = ':root{' + vars + '}'
  }

  function updateAnchor(anchors, key, anchorName, position) {
    let anchor = anchors[key]

    if (!anchor) {
      anchor = document.createElement('div')
      anchor.style.cssText =
        'position:absolute;width:1px;height:1px;pointer-events:none;anchor-name:' +
        anchorName
      wrapper.append(anchor)
      anchors[key] = anchor
    }

    anchor.style.left = position.x * 100 + '%'
    anchor.style.top = position.y * 100 + '%'
  }

  function m(markers, project) {
    const activeKeys = {}

    for (let marker of markers) {
      const key = marker.id
      if (!key) continue

      const pos = project(marker.location)

      activeKeys[key] = 1

      updateAnchor(markerAnchors, key, `--cobe-${key}`, pos)

      if (pos.visible) {
        visibilityVars['--cobe-visible-' + key] = 'N'
      } else {
        delete visibilityVars['--cobe-visible-' + key]
      }
    }

    for (const key in markerAnchors) {
      if (!activeKeys[key]) {
        markerAnchors[key].remove()
        delete markerAnchors[key]
        delete visibilityVars['--cobe-visible-' + key]
      }
    }
  }

  function a(arcs, project) {
    const activeKeys = {}

    for (let arc of arcs) {
      const key = arc.id
      if (!key) continue

      const pos = project(arc)

      activeKeys[key] = 1

      updateAnchor(arcAnchors, key, `--cobe-arc-${key}`, pos)

      if (pos.visible) {
        visibilityVars['--cobe-visible-arc-' + key] = 'N'
      } else {
        delete visibilityVars['--cobe-visible-arc-' + key]
      }
    }

    for (const key in arcAnchors) {
      if (!activeKeys[key]) {
        arcAnchors[key].remove()
        delete arcAnchors[key]
        delete visibilityVars['--cobe-visible-arc-' + key]
      }
    }
  }

  function r() {
    for (const key in markerAnchors) {
      markerAnchors[key].remove()
    }
    for (const key in arcAnchors) {
      arcAnchors[key].remove()
    }
    styleEl.remove()
  }

  return { m, a, r, s: updateStyleTag }
}
