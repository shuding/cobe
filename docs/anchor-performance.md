# CSS Anchor Performance Notes

This note records the performance issue, implementation approach, and local
verification data for optimizing COBE v2 CSS anchor updates. It is intended as
source material for an upstream MR.

## Context

COBE v2 creates invisible CSS anchor elements for markers and arcs that provide
an `id`. The render loop calls `globe.update({ phi, theta })` during camera
rotation, and `update()` always refreshes anchor positions:

```js
anchorManager.m(markers, project)
anchorManager.a(arcs, projectArcMidpoint)
anchorManager.s()
```

When markers or arcs have ids, every camera frame can touch the DOM even when
the marker and arc arrays have not structurally changed.

## Problem

Before the optimization, `anchorManager.s()` rebuilt the full `:root{...}` CSS
variable stylesheet on every `update()` call:

```js
styleEl.textContent = ':root{' + vars + '}'
```

During camera movement, this ran at the render cadence. The stylesheet content
only needs to change when a marker or arc crosses the horizon and its
`--cobe-visible-*` variable is added or removed, so most frames were rewriting
identical CSS.

The same update path also wrote `anchor.style.left` and `anchor.style.top` for
each anchored marker/arc every frame. During rotation those positions generally
do change, so this note treats that as a separate remaining cost rather than
claiming it is solved by the stylesheet optimization.

## Change

The local patch changes `src/anchor.js` to:

- Track a `styleDirty` flag.
- Mark the stylesheet dirty only when a visibility variable is added or removed.
- Skip `styleEl.textContent` when the visibility set has not changed.
- Cache each anchor's last `left` and `top` strings and skip identical style
  writes.

The local patch also changes `src/index.js` so `devicePixelRatio` can be updated
after initialization:

- Keep `dpr`, `width`, and `height` as mutable render state.
- Recompute `canvas.width` / `canvas.height` when any of those values changes.

The public API is unchanged.

## Expected Effect

For steady camera movement:

- `styleEl.textContent` writes should drop from roughly once per frame to only
  frames where marker/arc visibility changes.
- Visual output should be unchanged because the generated stylesheet content is
  identical whenever it is actually written.
- Anchor `left/top` writes may still happen every frame while the camera moves.
  This is expected and is still a candidate for future optimization.

## Local Verification

### Unit Tests

The local patch adds `node --test` coverage for `src/anchor.js` without adding a
browser or DOM dependency. The tests use a minimal fake DOM and verify:

- `anchorManager.s()` only writes the visibility stylesheet when marker
  visibility variables change.
- Marker anchor `style.left` / `style.top` writes are skipped when the projected
  position string is unchanged.

Current result:

```txt
tests 2
pass 2
fail 0
```

### Browser Measurement

Test setup:

- Local page using cobe markers/arcs with ids.
- Local cobe build loaded by the page.
- Measurement started after cobe anchors were created.

Test commits:

- Old: `b722657^` (`6552a9d`, before local optimization)
- New: `b722657` (`Optimize anchor updates and DPR resizing`)

For each run:

1. Checkout target cobe commit.
2. Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm run build` in cobe.
3. Clear the page dependency cache.
4. Load the page in a separate Chrome instance with CDP.
5. Wait until the globe has real data and cobe anchors.
6. Reset counters after initial mount.
7. Measure a steady-state camera-movement window.

The page state check for both runs confirmed the cobe path was active:

```txt
canvas: 1
anchors: 8
loading: false
error: false
```

### Direct `textContent` Counter

A temporary page preload patched `Node.prototype.textContent` and counted only
assignments to `HTMLStyleElement` values containing `--cobe-visible`.

Five-second steady-state result:

```txt
old b722657^:
cobeStyleTextContentSets: 296

new b722657:
cobeStyleTextContentSets: 2
```

Interpretation:

- Old behavior rewrote the cobe visibility stylesheet at about 59 times/second.
- New behavior only rewrote it when the visible variable set changed.

### CDP Performance Metrics

A separate ten-second steady-state run using CDP `Performance.getMetrics` showed:

```txt
RecalcStyleDuration:
old 0.902813s
new 0.660966s

TaskDuration:
old 2.568354s
new 2.499983s
```

These numbers should be treated as directional only. Total CPU remains dominated
by other per-frame work, especially WebGL rendering and anchor position updates.
The direct `textContent` counter is the stronger proof for this specific patch.

## Compatibility Notes

- The generated CSS custom property names are unchanged.
- CSS anchor names are unchanged.
- Marker and arc ids keep the same semantics.
- The dirty-check only avoids writing identical visibility styles; it does not
  change the projection or visibility algorithm.
- `devicePixelRatio` update support changes previously ignored update input into
  effective resize behavior. Existing callers that never update DPR are
  unaffected.

## Follow-Up Ideas

The remaining anchor-specific cost is per-frame anchor position updates:

```js
anchor.style.left = ...
anchor.style.top = ...
```

Possible follow-ups:

- Lower the anchor DOM update rate while keeping WebGL animation at full rate.
- Quantize anchor positions and skip sub-pixel-equivalent movement.
- Add an option to disable CSS anchor updates during camera-only updates.
- Allow callers that do not need CSS anchors on every frame to opt out of
  per-frame anchor projection.

Those follow-ups have visible/interaction trade-offs and should be considered
separately from the zero-visual-change stylesheet dirty-check.
