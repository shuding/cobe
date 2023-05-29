import Phenomenon from 'phenomenon'

const OPT_PHI = 'phi'
const OPT_THETA = 'theta'
const OPT_DOTS = 'mapSamples'
const OPT_MAP_BRIGHTNESS = 'mapBrightness'
const OPT_BASE_COLOR = 'baseColor'
const OPT_MARKER_COLOR = 'markerColor'
const OPT_GLOW_COLOR = 'glowColor'
const OPT_MARKERS = 'markers'
const OPT_DIFFUSE = 'diffuse'
const OPT_DPR = 'devicePixelRatio'
const OPT_DARK = 'dark'
const OPT_OFFSET = 'offset'
const OPT_SCALE = 'scale'
const OPT_OPACITY = 'opacity'
const OPT_MAP_BASE_BRIGHTNESS = 'mapBaseBrightness'

const OPT_MAPPING = {
  [OPT_PHI]: GLSLX_NAME_PHI,
  [OPT_THETA]: GLSLX_NAME_THETA,
  [OPT_DOTS]: GLSLX_NAME_DOTS,
  [OPT_MAP_BRIGHTNESS]: GLSLX_NAME_DOTS_BRIGHTNESS,
  [OPT_BASE_COLOR]: GLSLX_NAME_BASE_COLOR,
  [OPT_MARKER_COLOR]: GLSLX_NAME_MARKER_COLOR,
  [OPT_GLOW_COLOR]: GLSLX_NAME_GLOW_COLOR,
  [OPT_DIFFUSE]: GLSLX_NAME_DIFFUSE,
  [OPT_DARK]: GLSLX_NAME_DARK,
  [OPT_OFFSET]: GLSLX_NAME_OFFSET,
  [OPT_SCALE]: GLSLX_NAME_SCALE,
  [OPT_OPACITY]: GLSLX_NAME_OPACITY,
  [OPT_MAP_BASE_BRIGHTNESS]: GLSLX_NAME_MAP_BASE_BRIGHTNESS,
}

const { PI, sin, cos } = Math

const mapMarkers = (markers) => {
  return [].concat(
    ...markers.map((m) => {
      let [a, b] = m.location
      a = (a * PI) / 180
      b = (b * PI) / 180 - PI
      const cx = cos(a)
      return [-cx * cos(b), sin(a), cx * sin(b), m.size]
    }),
    // Make sure to fill zeros
    [0, 0, 0, 0]
  )
}

export default (canvas, opts) => {
  const createUniform = (type, name, fallback) => {
    return {
      type,
      value: typeof opts[name] === 'undefined' ? fallback : opts[name],
    }
  }

  // See https://github.com/shuding/cobe/pull/34.
  const contextType = canvas.getContext('webgl')
    ? 'webgl'
    : 'experimental-webgl'

  const p = new Phenomenon({
    canvas,
    contextType,
    context: {
      alpha: true,
      stencil: false,
      antialias: true,
      depth: false,
      preserveDrawingBuffer: false,
      ...opts.context,
    },
    settings: {
      [OPT_DPR]: opts[OPT_DPR] || 1,
      onSetup: (gl) => {
        const RGBFormat = gl.RGB
        const srcType = gl.UNSIGNED_BYTE
        const TEXTURE_2D = gl.TEXTURE_2D

        const texture = gl.createTexture()
        gl.bindTexture(TEXTURE_2D, texture)
        gl.texImage2D(
          TEXTURE_2D,
          0,
          RGBFormat,
          1,
          1,
          0,
          RGBFormat,
          srcType,
          new Uint8Array([0, 0, 0, 0])
        )

        const image = new Image()
        image.onload = () => {
          gl.bindTexture(TEXTURE_2D, texture)
          gl.texImage2D(TEXTURE_2D, 0, RGBFormat, RGBFormat, srcType, image)

          gl.generateMipmap(TEXTURE_2D)

          const program = gl.getParameter(gl.CURRENT_PROGRAM)
          const textureLocation = gl.getUniformLocation(
            program,
            GLSLX_NAME_U_TEXTURE
          )
          gl.texParameteri(TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
          gl.texParameteri(TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
          gl.uniform1i(textureLocation, 0)
        }
        image.src = __TEXTURE__
      },
    },
  })

  let state = {}

  p.add('base', {
    vertex: `attribute vec3 aPosition;uniform mat4 uProjectionMatrix;uniform mat4 uModelMatrix;uniform mat4 uViewMatrix;void main(){gl_Position=uProjectionMatrix*uModelMatrix*uViewMatrix*vec4(aPosition,1.);}`,
    fragment: GLSLX_SOURCE_MAIN,
    uniforms: {
      [GLSLX_NAME_U_RESOLUTION]: {
        type: 'vec2',
        value: [opts.width, opts.height],
      },
      [GLSLX_NAME_PHI]: createUniform('float', OPT_PHI),
      [GLSLX_NAME_THETA]: createUniform('float', OPT_THETA),
      [GLSLX_NAME_DOTS]: createUniform('float', OPT_DOTS),
      [GLSLX_NAME_DOTS_BRIGHTNESS]: createUniform('float', OPT_MAP_BRIGHTNESS),
      [GLSLX_NAME_MAP_BASE_BRIGHTNESS]: createUniform(
        'float',
        OPT_MAP_BASE_BRIGHTNESS
      ),
      [GLSLX_NAME_BASE_COLOR]: createUniform('vec3', OPT_BASE_COLOR),
      [GLSLX_NAME_MARKER_COLOR]: createUniform('vec3', OPT_MARKER_COLOR),
      [GLSLX_NAME_DIFFUSE]: createUniform('float', OPT_DIFFUSE),
      [GLSLX_NAME_GLOW_COLOR]: createUniform('vec3', OPT_GLOW_COLOR),
      [GLSLX_NAME_DARK]: createUniform('float', OPT_DARK),
      [GLSLX_NAME_MARKERS]: {
        type: 'vec4',
        value: mapMarkers(opts[OPT_MARKERS]),
      },
      [GLSLX_NAME_MARKERS_NUM]: {
        type: 'float',
        value: opts[OPT_MARKERS].length,
      },
      [GLSLX_NAME_OFFSET]: createUniform('vec2', OPT_OFFSET, [0, 0]),
      [GLSLX_NAME_SCALE]: createUniform('float', OPT_SCALE, 1),
      [GLSLX_NAME_OPACITY]: createUniform('float', OPT_OPACITY, 1),
    },
    mode: 4,
    geometry: {
      vertices: [
        { x: -100, y: 100, z: 0 },
        { x: -100, y: -100, z: 0 },
        { x: 100, y: 100, z: 0 },
        { x: 100, y: -100, z: 0 },
        { x: -100, y: -100, z: 0 },
        { x: 100, y: 100, z: 0 },
      ],
    },
    onRender: ({ uniforms }) => {
      state = {}
      if (opts.onRender) {
        state = opts.onRender(state) || state
        for (let k in OPT_MAPPING) {
          if (state[k] !== undefined) {
            uniforms[OPT_MAPPING[k]].value = state[k]
          }
        }
        if (state[OPT_MARKERS] !== undefined) {
          uniforms[GLSLX_NAME_MARKERS].value = mapMarkers(state[OPT_MARKERS])
          uniforms[GLSLX_NAME_MARKERS_NUM].value = state[OPT_MARKERS].length
        }
        if (state.width && state.height) {
          uniforms[GLSLX_NAME_U_RESOLUTION].value = [state.width, state.height]
        }
      }
    },
  })

  let markers = mapMarkers(opts[OPT_MARKERS])
  const markerPos = {
    name: 'markerPos',
    data: (index) => {
      const marker = markers.slice(index * 4, index * 4 + 4)
      marker[3] = marker[3] ?? 0.05
      return marker
    },
    size: 4,
  }

  p.add('marker', {
    multiplier: opts[OPT_MARKERS].length,
    attributes: [{ ...markerPos }],
    vertex: `
  attribute vec3 aPosition;
  attribute vec4 markerPos;

  uniform vec2 uResolution;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uModelMatrix;
  uniform mat4 uViewMatrix;
  uniform float phi;
  uniform float theta;
  uniform vec2 offset;
  uniform float scale;

  varying vec4 vMarkerPos;

  const float sqrt5 = 2.23606797749979;
  const float PI = 3.141592653589793;
  const float HALF_PI = 1.5707963267948966;
  const float kTau = 6.283185307179586;
  const float kPhi = 1.618033988749895;
  const float byLogPhiPlusOne = 0.7202100452062783;
  const float twoPiOnPhi = 3.8832220774509327;
  const float phiMinusOne = .618033988749895;
  const float r = .8;
  const float by2P32 = 2.3283064365386963e-10;

  mat3 rotate(float theta, float phi) {
    float cx = cos(theta);
    float cy = cos(phi);
    float sx = sin(theta);
    float sy = sin(phi);
  
    return mat3(
      cy, sy * sx, -sy * cx,
      0., cx, sx,
      sy, cy * -sx, cy * cx
    );
  }

  void main(){
    gl_PointSize = markerPos.w * 400. * scale;
    vec3 c = markerPos.xyz;

    vec3 pos = c * rotate(0., -phi) * rotate(-theta, 0.) * 1.32 * scale;

    vMarkerPos.xyz = pos;
    vMarkerPos.w = markerPos.w;

    gl_Position = uProjectionMatrix * uModelMatrix * uViewMatrix * vec4(aPosition + vec3(pos.xy, 0.), 1.);
  }
    `,
    fragment: `
  precision mediump float;

  uniform vec2 uResolution;
  uniform vec3 uMarkerColor;
  uniform vec2 offset;
  uniform float scale;

  varying vec4 vMarkerPos;

  void main(){
    if (vMarkerPos.z < 0.) {
      discard;
    }
    vec2 uv = gl_PointCoord.xy * 2. - 1.;
    float l = length(uv);
    if (l > 1.0) {
        discard;
    }
    gl_FragColor = vec4(0.,0.,1., 1.);
  }
`,
    uniforms: {
      uMarkerColor: createUniform('vec3', OPT_MARKER_COLOR),
      phi: createUniform('float', OPT_PHI),
      theta: createUniform('float', OPT_THETA),
      offset: createUniform('vec2', OPT_OFFSET, [0, 0]),
      scale: createUniform('float', OPT_SCALE, 1),
    },
    onRender: (renderer) => {
      if (opts.onRender) {
        if (state[OPT_MARKER_COLOR] !== undefined) {
          renderer.uniforms.uMarkerColor.value = state[OPT_MARKER_COLOR]
        }
        if (state[OPT_PHI] !== undefined) {
          renderer.uniforms.phi.value = state[OPT_PHI]
        }
        if (state[OPT_THETA] !== undefined) {
          renderer.uniforms.theta.value = state[OPT_THETA]
        }
        if (state[OPT_OFFSET] !== undefined) {
          renderer.uniforms.offset.value = state[OPT_OFFSET]
        }
        if (state[OPT_SCALE] !== undefined) {
          renderer.uniforms.scale.value = state[OPT_SCALE]
        }

        if (state[OPT_MARKERS] !== undefined) {
          markers = mapMarkers(state[OPT_MARKERS])
          renderer.multiplier = state[OPT_MARKERS].length
          renderer.prepareAttribute({ ...markerPos })
        }
      }
    },
    debug: true,
  })

  return p
}
