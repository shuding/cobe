import Phenomenon from "phenomenon";

const OPT_PHI = "phi";
const OPT_THETA = "theta";
const OPT_DOTS = "mapSamples";
const OPT_MAP_BRIGHTNESS = "mapBrightness";
const OPT_BASE_COLOR = "baseColor";
const OPT_MARKER_COLOR = "markerColor";
const OPT_GLOW_COLOR = "glowColor";
const OPT_MARKERS = "markers";
const OPT_DIFFUSE = "diffuse";
const OPT_DPR = "devicePixelRatio";
const OPT_DARK = "dark";

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
};

const { PI, sin, cos } = Math;

const mapMarkers = (markers) => {
  return [].concat(
    ...markers.map((m) => {
      let [a, b] = m.location;
      a = (a * PI) / 180;
      b = (b * PI) / 180 - PI;
      const cx = cos(a);
      return [-cx * cos(b), sin(a), cx * sin(b), m.size];
    })
  );
};

export default (canvas, opts) => {
  const createUniform = (type, name) => {
    return {
      type,
      value: opts[name],
    };
  };

  const p = new Phenomenon({
    canvas,
    context: {
      alpha: true,
      stencil: false,
      antialias: true,
      depth: false,
      preserveDrawingBuffer: false,
    },
    settings: {
      [OPT_DPR]: opts[OPT_DPR] || 1,
      onSetup: (gl) => {
        const RGBFormat = gl.RGB;
        const srcType = gl.UNSIGNED_BYTE;
        const TEXTURE_2D = gl.TEXTURE_2D;

        const texture = gl.createTexture();
        gl.bindTexture(TEXTURE_2D, texture);
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
        );

        const image = new Image();
        image.onload = () => {
          gl.bindTexture(TEXTURE_2D, texture);
          gl.texImage2D(TEXTURE_2D, 0, RGBFormat, RGBFormat, srcType, image);

          gl.generateMipmap(TEXTURE_2D);

          const program = gl.getParameter(gl.CURRENT_PROGRAM);
          const textureLocation = gl.getUniformLocation(
            program,
            GLSLX_NAME_U_TEXTURE
          );
          gl.texParameteri(TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          gl.uniform1i(textureLocation, 0);
        };
        image.src = __TEXTURE__;
      },
    },
  });

  p.add("", {
    vertex: `attribute vec3 aPosition;uniform mat4 uProjectionMatrix;uniform mat4 uModelMatrix;uniform mat4 uViewMatrix;void main(){gl_Position=uProjectionMatrix*uModelMatrix*uViewMatrix*vec4(aPosition,1.);}`,
    fragment: GLSLX_SOURCE_MAIN,
    uniforms: {
      [GLSLX_NAME_U_RESOLUTION]: {
        type: "vec2",
        value: [opts.width, opts.height],
      },
      [GLSLX_NAME_PHI]: createUniform("float", OPT_PHI),
      [GLSLX_NAME_THETA]: createUniform("float", OPT_THETA),
      [GLSLX_NAME_DOTS]: createUniform("float", OPT_DOTS),
      [GLSLX_NAME_DOTS_BRIGHTNESS]: createUniform("float", OPT_MAP_BRIGHTNESS),
      [GLSLX_NAME_BASE_COLOR]: createUniform("vec3", OPT_BASE_COLOR),
      [GLSLX_NAME_MARKER_COLOR]: createUniform("vec3", OPT_MARKER_COLOR),
      [GLSLX_NAME_DIFFUSE]: createUniform("float", OPT_DIFFUSE),
      [GLSLX_NAME_GLOW_COLOR]: createUniform("vec3", OPT_GLOW_COLOR),
      [GLSLX_NAME_DARK]: createUniform("float", OPT_DARK),
      [GLSLX_NAME_MARKERS]: {
        type: "vec4",
        value: mapMarkers(opts[OPT_MARKERS]),
      },
      [GLSLX_NAME_MARKERS_NUM]: {
        type: "float",
        value: opts[OPT_MARKERS].length,
      },
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
      const state = {};
      if (opts.onRender) {
        opts.onRender(state);
        for (let k in OPT_MAPPING) {
          if (state[k] !== undefined) {
            uniforms[OPT_MAPPING[k]].value = state[k];
          }
        }
        if (state[OPT_MARKERS] !== undefined) {
          uniforms[GLSLX_NAME_MARKERS].value = mapMarkers(state[OPT_MARKERS]);
          uniforms[GLSLX_NAME_MARKERS_NUM].value = state[OPT_MARKERS].length;
        }
      }
    },
  });

  return p;
};
