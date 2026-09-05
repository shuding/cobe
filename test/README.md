# Texture cleanup reproduction

Build with `npm run build`, serve the repository with `python3 -m http.server 8137`, and open http://localhost:8137/test/texture-cleanup.html in a browser with WebGL.

The page holds the texture image load, creates a globe, then destroys it. It checks that destruction deletes exactly one texture and clears the pending image callback. Before the fix it reports `passed: false`, zero deletions, and an uncleared callback. With the fix it reports `passed: true`, one deletion, and a cleared callback.

No test dependencies are required. The package's build dependencies are required to build `dist/index.esm.js`.
