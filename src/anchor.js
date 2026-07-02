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
  let styleDirty = true

  // Create a style tag for :root CSS variables
  const styleEl = document.createElement('style')
  document.head.append(styleEl)

  function updateStyleTag() {
    if (!styleDirty) return
    let vars = ''
    for (let key in visibilityVars) {
      vars += key + ':' + visibilityVars[key] + ';'
    }
    styleEl.textContent = ':root{' + vars + '}'
    styleDirty = false
  }

  function setVisible(key, visible) {
    const varName = '--cobe-visible-' + key
    if (visible) {
      if (visibilityVars[varName] === 'N') return
      visibilityVars[varName] = 'N'
      styleDirty = true
    } else if (visibilityVars[varName] != undefined) {
      delete visibilityVars[varName]
      styleDirty = true
    }
  }

  function updateAnchor(anchors, key, anchorName, position) {
    let anchor = anchors[key]
    const left = position.x * 100 + '%'
    const top = position.y * 100 + '%'

    if (!anchor) {
      anchor = document.createElement('div')
      anchor.style.cssText =
        'position:absolute;width:1px;height:1px;pointer-events:none;anchor-name:' +
        anchorName
      wrapper.append(anchor)
      anchors[key] = anchor
    }

    if (anchor._cobeLeft !== left) {
      anchor.style.left = left
      anchor._cobeLeft = left
    }
    if (anchor._cobeTop !== top) {
      anchor.style.top = top
      anchor._cobeTop = top
    }
  }

  function m(markers, project) {
    const activeKeys = {}

    for (let marker of markers) {
      const key = marker.id
      if (!key) continue

      const pos = project(marker.location)

      activeKeys[key] = 1

      updateAnchor(markerAnchors, key, `--cobe-${key}`, pos)
      setVisible(key, pos.visible)
    }

    for (const key in markerAnchors) {
      if (!activeKeys[key]) {
        markerAnchors[key].remove()
        delete markerAnchors[key]
        setVisible(key, false)
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
      setVisible('arc-' + key, pos.visible)
    }

    for (const key in arcAnchors) {
      if (!activeKeys[key]) {
        arcAnchors[key].remove()
        delete arcAnchors[key]
        setVisible('arc-' + key, false)
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
