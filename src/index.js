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
const OPT_OFFSET = "offset";
const OPT_SCALE = "scale";
const OPT_OPACITY = "opacity";
const OPT_MAP_BASE_BRIGHTNESS = "mapBaseBrightness";

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
};

const { PI, sin, cos, sqrt, atan2, floor, max, pow, log2 } = Math;

// Constants matching shader
const sqrt5 = 2.23606797749979;
const kPhi = 1.618033988749895;
const byLogPhiPlusOne = 0.7202100452062783;
const kTau = 6.283185307179586;
const twoPiOnPhi = 3.8832220774509327;
const phiMinusOne = 0.618033988749895;

// Optimized nearestFibonacciLattice implementation
const nearestFibonacciLattice = (p, d) => {
    const q = [p[0], p[2], p[1]], b = 1 / d;
    const k = max(2, floor(log2(sqrt5 * d * PI * (1 - q[2] * q[2])) * byLogPhiPlusOne));
    const pk = pow(kPhi, k) / sqrt5;
    const f = [floor(pk + .5), floor(pk * kPhi + .5)];
    const r1 = [((f[0] + 1) * phiMinusOne) % 1 * kTau - twoPiOnPhi, ((f[1] + 1) * phiMinusOne) % 1 * kTau - twoPiOnPhi];
    const r2 = [-2 * f[0], -2 * f[1]];
    const sp = [atan2(q[1], q[0]), q[2] - 1];
    const dt = r1[0] * r2[1] - r2[0] * r1[1];
    const c = [floor((r2[1] * sp[0] - r1[1] * (sp[1] * d + 1)) / dt), floor((-r2[0] * sp[0] + r1[0] * (sp[1] * d + 1)) / dt)];
    
    let md = PI, mp = [0, 0, 0];
    for (let s = 0; s < 4; s++) {
        const i = f[0] * (c[0] + s % 2) + f[1] * (c[1] + floor(s * .5));
        if (i > d) continue;
        const t = ((i * phiMinusOne) % 1) * kTau, cp = 1 - 2 * i * b, sp = sqrt(1 - cp * cp);
        const sm = [cos(t) * sp, sin(t) * sp, cp];
        const ds = sqrt((q[0] - sm[0]) ** 2 + (q[1] - sm[1]) ** 2 + (q[2] - sm[2]) ** 2);
        if (ds < md) md = ds, mp = sm;
    }
    return [mp[0], mp[2], mp[1]];
};

const mapMarkers = (ms, d) => [].concat(...ms.map(m => {
    let [a, b] = m.location;
    a = a * PI / 180; b = b * PI / 180 - PI;
    const c = cos(a), p = [-c * cos(b), sin(a), c * sin(b)];
    const l = nearestFibonacciLattice(p, d);
    return [...l, m.size, ...(m.color ? [...m.color, 1] : [0, 0, 0, 0])];
}), [0, 0, 0, 0, 0, 0, 0, 0]);

export default (canvas, opts) => {
    const createUniform = (type, name, fallback) => {
        return {
            type,
            value: typeof opts[name] === "undefined" ? fallback : opts[name],
        };
    };

    // See https://github.com/shuding/cobe/pull/34.
    const contextType = canvas.getContext("webgl2")
        ? "webgl2"
        : canvas.getContext("webgl")
          ? "webgl"
          : "experimental-webgl";

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
                    new Uint8Array([0, 0, 0, 0]),
                );

                const image = new Image();
                image.onload = () => {
                    gl.bindTexture(TEXTURE_2D, texture);
                    gl.texImage2D(
                        TEXTURE_2D,
                        0,
                        RGBFormat,
                        RGBFormat,
                        srcType,
                        image,
                    );

                    gl.generateMipmap(TEXTURE_2D);

                    const program = gl.getParameter(gl.CURRENT_PROGRAM);
                    const textureLocation = gl.getUniformLocation(
                        program,
                        GLSLX_NAME_U_TEXTURE,
                    );
                    gl.texParameteri(
                        TEXTURE_2D,
                        gl.TEXTURE_MIN_FILTER,
                        gl.NEAREST,
                    );
                    gl.texParameteri(
                        TEXTURE_2D,
                        gl.TEXTURE_MAG_FILTER,
                        gl.NEAREST,
                    );
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
            [GLSLX_NAME_DOTS_BRIGHTNESS]: createUniform(
                "float",
                OPT_MAP_BRIGHTNESS,
            ),
            [GLSLX_NAME_MAP_BASE_BRIGHTNESS]: createUniform(
                "float",
                OPT_MAP_BASE_BRIGHTNESS,
            ),
            [GLSLX_NAME_BASE_COLOR]: createUniform("vec3", OPT_BASE_COLOR),
            [GLSLX_NAME_MARKER_COLOR]: createUniform("vec3", OPT_MARKER_COLOR),
            [GLSLX_NAME_DIFFUSE]: createUniform("float", OPT_DIFFUSE),
            [GLSLX_NAME_GLOW_COLOR]: createUniform("vec3", OPT_GLOW_COLOR),
            [GLSLX_NAME_DARK]: createUniform("float", OPT_DARK),
            [GLSLX_NAME_MARKERS]: {
                type: "vec4",
                value: mapMarkers(opts[OPT_MARKERS], opts[OPT_DOTS]),
            },
            [GLSLX_NAME_MARKERS_NUM]: {
                type: "float",
                value: opts[OPT_MARKERS].length * 2,
            },
            [GLSLX_NAME_OFFSET]: createUniform("vec2", OPT_OFFSET, [0, 0]),
            [GLSLX_NAME_SCALE]: createUniform("float", OPT_SCALE, 1),
            [GLSLX_NAME_OPACITY]: createUniform("float", OPT_OPACITY, 1),
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
            let state = {};
            if (opts.onRender) {
                state = opts.onRender(state) || state;
                for (const k in OPT_MAPPING) {
                    if (state[k] !== undefined) {
                        uniforms[OPT_MAPPING[k]].value = state[k];
                    }
                }
                if (state[OPT_MARKERS] !== undefined) {
                    // Get current dots value from state or existing uniform
                    const currentDots = state[OPT_DOTS] !== undefined ? state[OPT_DOTS] : uniforms[GLSLX_NAME_DOTS].value;
                    uniforms[GLSLX_NAME_MARKERS].value = mapMarkers(
                        state[OPT_MARKERS],
                        currentDots
                    );
                    uniforms[GLSLX_NAME_MARKERS_NUM].value =
                        state[OPT_MARKERS].length;
                }
                if (state.width && state.height) {
                    uniforms[GLSLX_NAME_U_RESOLUTION].value = [
                        state.width,
                        state.height,
                    ];
                }
                if (state[OPT_DOTS] !== undefined) {
                    // Remap markers when dots change
                    uniforms[GLSLX_NAME_MARKERS].value = mapMarkers(
                        state[OPT_MARKERS] || opts[OPT_MARKERS],
                        state[OPT_DOTS]
                    );
                }
            }
        },
    });

    return p;
};
