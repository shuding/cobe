import { centerOn, unproject, hitTest, flyTo } from '../dist/pick.js'

const { PI, sin, cos, abs } = Math
const GLOBE_R = 0.8, ELEV = 0.05, W = 900, H = 900, DPR = 1

// A stand-in globe: same transform as the renderer, no WebGL needed.
function makeGlobe(phi, theta, scale = 1, offset = [0, 0], markers = []) {
  const g = {
    phi, theta, scale, offset, markers,
    state: () => [g.phi, g.theta, g.scale, g.offset, DPR, ELEV, g.markers],
    update: (s) => { if (s.phi !== undefined) g.phi = s.phi
                     if (s.theta !== undefined) g.theta = s.theta
                     if (s.scale !== undefined) g.scale = s.scale },
    project: (loc) => {
      const la = loc[0]*PI/180, lo = loc[1]*PI/180 - PI, cl = cos(la)
      const r = GLOBE_R + ELEV
      const p = [-cl*cos(lo)*r, sin(la)*r, cl*sin(lo)*r]
      const cx=cos(g.theta),cy=cos(g.phi),sx=sin(g.theta),sy=sin(g.phi)
      const rx=cy*p[0]+sy*p[2]
      const ry=sy*sx*p[0]+cx*p[1]-cy*sx*p[2]
      const rz=-sy*cx*p[0]+sx*p[1]+cy*cx*p[2]
      return { x:((rx/(W/H))*g.scale + g.offset[0]*g.scale*DPR/W + 1)/2,
               y:(-ry*g.scale + g.offset[1]*g.scale*DPR/H + 1)/2,
               visible: rz>=0 || rx*rx+ry*ry>=0.64 }
    },
  }
  return g
}
const canvas = { width: W, height: H, style: {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: W, height: H }) }

let pass = 0, fail = 0
const check = (name, ok, extra='') => { ok ? pass++ : fail++
  console.log(`  ${ok?'PASS':'FAIL'}  ${name}${extra?'  '+extra:''}`) }

// 1. centerOn puts a location dead centre, from the shipped bundle
console.log('centerOn (shipped dist/pick.js)')
for (const loc of [[37.76,-122.44],[19.08,72.88],[-33.87,151.21],[51.51,-0.13]]) {
  const c = centerOn(loc)
  const p = makeGlobe(c.phi, c.theta).project(loc)
  check(`centre ${loc}`, abs(p.x-0.5)<1e-9 && abs(p.y-0.5)<1e-9 && p.visible)
}

// 2. unproject inverts the renderer's transform, incl. scale and offset
console.log('unproject round-trip (scale + offset variations)')
let worst = 0
for (const [phi,theta,scale,offset] of [[0,0,1,[0,0]],[1.2,0.3,1,[0,0]],[4.7,-0.5,1.4,[0,0]],[2,0.9,0.8,[60,-40]]]) {
  const g = makeGlobe(phi,theta,scale,offset)
  for (const loc of [[37.76,-122.44],[19.08,72.88],[35.68,139.69],[0,0],[-23.55,-46.63]]) {
    // project onto the *surface* radius, which is what unproject assumes
    const la=loc[0]*PI/180, lo=loc[1]*PI/180-PI, cl=cos(la)
    const p=[-cl*cos(lo)*GLOBE_R, sin(la)*GLOBE_R, cl*sin(lo)*GLOBE_R]
    const cx=cos(theta),cy=cos(phi),sx=sin(theta),sy=sin(phi)
    const rx=cy*p[0]+sy*p[2], ry=sy*sx*p[0]+cx*p[1]-cy*sx*p[2]
    const rz=-sy*cx*p[0]+sx*p[1]+cy*cx*p[2]
    if (rz < 0) continue
    const u=((rx/(W/H))*scale + offset[0]*scale*DPR/W + 1)/2
    const v=(-ry*scale + offset[1]*scale*DPR/H + 1)/2
    const back = unproject(g, canvas, u*W, v*H)
    const err = Math.max(abs(back[0]-loc[0]), abs(((back[1]-loc[1]+540)%360)-180))
    worst = Math.max(worst, err)
  }
}
check('worst error across 4 cameras', worst < 1e-6, worst.toExponential(2)+' deg')
check('pointer off the globe returns null', unproject(makeGlobe(0,0), canvas, 5, 5) === null)

// 3. hitTest picks the nearest visible marker, ignores the far side
console.log('hitTest')
const markers = [
  { id:'sf', location:[37.76,-122.44], size:0.05 },
  { id:'tyo', location:[35.68,139.69], size:0.05 },
]
const gh = makeGlobe(centerOn(markers[0].location).phi, centerOn(markers[0].location).theta, 1, [0,0], markers)
check('marker at centre is hit', hitTest(gh, canvas, W/2, H/2, 16)?.id === 'sf')
check('empty area is not hit', hitTest(gh, canvas, W/2+200, H/2+200, 16) === null)
// Tokyo is only ~75 deg from SF, i.e. on the near hemisphere and genuinely
// clickable. Use SF's actual antipode for the hidden-marker case.
const anti = [-37.76, 57.56]
const gh2 = makeGlobe(gh.phi, gh.theta, 1, [0,0],
  [...markers, { id:'anti', location:anti, size:0.05 }])
const ap = gh2.project(anti)
check('antipodal marker reported hidden', ap.visible === false)
// The antipode projects onto the screen centre - the same pixel as the
// centred front marker - so the useful assertion is that the hidden one is
// never the answer, and that alone in the list it is unclickable.
check('hidden marker is never returned',
      hitTest(gh2, canvas, ap.x*W, ap.y*H, 16)?.id !== 'anti')
const gh3 = makeGlobe(gh.phi, gh.theta, 1, [0,0], [{ id:'anti', location:anti, size:0.05 }])
check('a hidden marker alone in the list is unclickable',
      hitTest(gh3, canvas, ap.x*W, ap.y*H, 16) === null)
check('near-side marker 75 deg out IS clickable', (() => {
  const p = gh2.project(markers[1].location)
  return p.visible && hitTest(gh2, canvas, p.x*W, p.y*H, 16)?.id === 'tyo'
})())

// 4. flyTo takes the short way round and lands on target
console.log('flyTo')
let now = 0, queue = []
globalThis.requestAnimationFrame = (fn) => { queue.push(fn); return queue.length }
globalThis.cancelAnimationFrame = () => {}
const run = (ms=1200, step=16) => { for (let t=0; t<=ms; t+=step) { now+=step
  const q = queue; queue = []; q.forEach(fn => fn(now)) } }

const gf = makeGlobe(0.05, 0)             // just past zero
const target = [0, 0]                      // centerOn -> phi = 3PI/2 = 4.712
let done = false
flyTo(gf, target, { duration: 300, onDone: () => (done = true) })
run(400)
const want = centerOn(target)
check('lands on target phi', abs(((gf.phi - want.phi + PI) % (2*PI) + 2*PI) % (2*PI) - PI) < 1e-6)
check('onDone fired', done)

const gs = makeGlobe(0.05, 0)
flyTo(gs, target, { duration: 300 })
queue.splice(0).forEach(fn => fn(now += 16))   // frame 1 only anchors the clock
check('first frame does not jump the camera', gs.phi === 0.05)
for (let i = 0; i < 3; i++) queue.splice(0).forEach(fn => fn(now += 16))
// target phi is 4.712: forwards is +4.66 rad, the short way is -1.62
check('rotates the short way, not 4.66 rad forward', gs.phi < 0.05,
      'phi ' + gs.phi.toFixed(4) + ' (started 0.0500)')

const gz = makeGlobe(0, 0, 1)
flyTo(gz, [10, 10], { duration: 200, zoom: 1.5 }); run(300)
check('zoom reaches target scale', abs(gz.scale - 1.5) < 1e-9)

const gc = makeGlobe(0, 0)
const cancel = flyTo(gc, [40, -74], { duration: 500 })
queue.splice(0).forEach(fn => fn(now += 16))
const midPhi = gc.phi
cancel(); run(600)
check('cancel freezes the camera', gc.phi === midPhi)

console.log(`\n  ${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
