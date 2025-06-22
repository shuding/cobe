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

// New options
const OPT_DRAG_X = "dragX";
const OPT_DRAG_Y = "dragY";
const OPT_DRAG_SENSITIVITY_X = "dragSensitivityX";
const OPT_DRAG_SENSITIVITY_Y = "dragSensitivityY";
const OPT_RETURN_X_TO_DEFAULT = "returnXToDefault";
const OPT_RETURN_Y_TO_DEFAULT = "returnYToDefault";
const OPT_RETURN_SPEED = "returnSpeed";
const OPT_AUTO_ROTATE_SPEED = "autoRotateSpeed";

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

const { PI, sin, cos } = Math;

const mapMarkers = (markers) => {
    return [].concat(
        ...markers.map((m) => {
            let [a, b] = m.location;
            a = (a * PI) / 180;
            b = (b * PI) / 180 - PI;
            const cx = cos(a);

            // Position and size data
            const posData = [-cx * cos(b), sin(a), cx * sin(b), m.size];

            // Color data (use marker color if provided, otherwise [0,0,0] to indicate default)
            const colorData = m.color ? [...m.color, 1] : [0, 0, 0, 0];

            return [...posData, ...colorData];
        }),
        // Make sure to fill zeros for both position and color data
        [0, 0, 0, 0, 0, 0, 0, 0],
    );
};

export default (canvas, opts) => {
    const createUniform = (type, name, fallback) => {
        return {
            type,
            value: typeof opts[name] === "undefined" ? fallback : opts[name],
        };
    };

    // Initialize interaction state
    const interaction = {
        isDragging: false,
        isPaused: false,
        dragOffset: { x: 0, y: 0 },
        autoRotateOffset: 0,
        lastPointerPosition: { x: 0, y: 0 },
        eventListeners: {
            mousedown: null,
            mousemove: null,
            mouseup: null,
            mouseleave: null,
            touchstart: null,
            touchmove: null,
            touchend: null,
            touchcancel: null
        }
    };

    // Set default values for new options
    opts = {
        dragX: false,
        dragY: false,
        dragSensitivityX: 0.005,
        dragSensitivityY: 0.005,
        returnXToDefault: false,
        returnYToDefault: true,
        returnSpeed: 0.05,
        autoRotateSpeed: 0.0,
        ...opts
    };
    
    // Event handler functions
    const handleDragStart = (e) => {
        if (!(opts.dragX || opts.dragY)) return;
        
        interaction.isDragging = true;
        interaction.lastPointerPosition = { 
            x: e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0),
            y: e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0)
        };
        if (canvas) {
            canvas.style.cursor = 'grabbing';
        }
    };

    const handleDragMove = (e) => {
        if (!interaction.isDragging) return;
        if (!(opts.dragX || opts.dragY)) return;

        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        
        const deltaX = clientX - interaction.lastPointerPosition.x;
        const deltaY = clientY - interaction.lastPointerPosition.y;
        
        interaction.lastPointerPosition = { x: clientX, y: clientY };

        // Only apply the drag to the enabled axes
        if (opts.dragX) {
            interaction.dragOffset.x += deltaX * opts.dragSensitivityX;
        }
        
        if (opts.dragY) {
            interaction.dragOffset.y += deltaY * opts.dragSensitivityY;

            // Clamp drag offset to prevent over-dragging and delay
            const y_limit = Math.PI / 2 - 0.01;
            const theta = opts.theta || 0;
            interaction.dragOffset.y = Math.max(
                -y_limit - theta, 
                Math.min(y_limit - theta, interaction.dragOffset.y)
            );
        }
    };

    const handleDragEnd = () => {
        if (!interaction.isDragging) return;
        
        interaction.isDragging = false;
        if (canvas) {
            canvas.style.cursor = (opts.dragX || opts.dragY) ? 'grab' : 'default';
        }
    };

    // Function to update event listeners based on current options
    const updateEventListeners = () => {
        if (!canvas) return;
        
        // Clean up old event listeners if they exist
        if (interaction.eventListeners.mousedown) {
            canvas.removeEventListener('mousedown', interaction.eventListeners.mousedown);
            canvas.removeEventListener('mousemove', interaction.eventListeners.mousemove);
            canvas.removeEventListener('mouseup', interaction.eventListeners.mouseup);
            canvas.removeEventListener('mouseleave', interaction.eventListeners.mouseleave);
            
            canvas.removeEventListener('touchstart', interaction.eventListeners.touchstart);
            canvas.removeEventListener('touchmove', interaction.eventListeners.touchmove);
            canvas.removeEventListener('touchend', interaction.eventListeners.touchend);
            canvas.removeEventListener('touchcancel', interaction.eventListeners.touchcancel);
        }
        
        // Add event listeners if dragging is enabled
        if (opts.dragX || opts.dragY) {
            interaction.eventListeners = {
                mousedown: handleDragStart,
                mousemove: handleDragMove,
                mouseup: handleDragEnd,
                mouseleave: handleDragEnd,
                touchstart: handleDragStart,
                touchmove: handleDragMove,
                touchend: handleDragEnd,
                touchcancel: handleDragEnd
            };
            
            canvas.addEventListener('mousedown', interaction.eventListeners.mousedown);
            canvas.addEventListener('mousemove', interaction.eventListeners.mousemove);
            canvas.addEventListener('mouseup', interaction.eventListeners.mouseup);
            canvas.addEventListener('mouseleave', interaction.eventListeners.mouseleave);
            
            canvas.addEventListener('touchstart', interaction.eventListeners.touchstart);
            canvas.addEventListener('touchmove', interaction.eventListeners.touchmove);
            canvas.addEventListener('touchend', interaction.eventListeners.touchend);
            canvas.addEventListener('touchcancel', interaction.eventListeners.touchcancel);

            // Set initial cursor style
            canvas.style.cursor = 'grab';
        } else {
            // Reset cursor style if dragging is disabled
            canvas.style.cursor = 'default';
            
            // Also make sure we don't have leftover event listeners
            if (interaction.eventListeners.mousedown) {
                canvas.removeEventListener('mousedown', interaction.eventListeners.mousedown);
                canvas.removeEventListener('mousemove', interaction.eventListeners.mousemove);
                canvas.removeEventListener('mouseup', interaction.eventListeners.mouseup);
                canvas.removeEventListener('mouseleave', interaction.eventListeners.mouseleave);
                
                canvas.removeEventListener('touchstart', interaction.eventListeners.touchstart);
                canvas.removeEventListener('touchmove', interaction.eventListeners.touchmove);
                canvas.removeEventListener('touchend', interaction.eventListeners.touchend);
                canvas.removeEventListener('touchcancel', interaction.eventListeners.touchcancel);
                
                // Clear event listeners
                interaction.eventListeners = {
                    mousedown: null,
                    mousemove: null,
                    mouseup: null,
                    mouseleave: null,
                    touchstart: null,
                    touchmove: null,
                    touchend: null,
                    touchcancel: null
                };
            }
        }
        
        // Always set touch-action to none to prevent scrolling while touching the canvas
        canvas.style.touchAction = 'none';
    };

    // Initialize event listeners
    updateEventListeners();

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
                value: mapMarkers(opts[OPT_MARKERS]),
            },
            [GLSLX_NAME_MARKERS_NUM]: {
                type: "float",
                value: opts[OPT_MARKERS].length,
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
            }
            
            // Track if any interactive options have changed
            let interactiveOptionsChanged = false;
            
            // Update settings from onRender callback if they were changed
            const oldDragX = opts.dragX;
            const oldDragY = opts.dragY;
            
            if (state[OPT_DRAG_X] !== undefined && opts.dragX !== state[OPT_DRAG_X]) {
                opts.dragX = state[OPT_DRAG_X];
                interactiveOptionsChanged = true;
            }
            
            if (state[OPT_DRAG_Y] !== undefined && opts.dragY !== state[OPT_DRAG_Y]) {
                opts.dragY = state[OPT_DRAG_Y];
                interactiveOptionsChanged = true;
            }
            
            // Update cursor immediately if drag options were toggled off
            if (!interactiveOptionsChanged && canvas && 
                ((oldDragX || oldDragY) && !(opts.dragX || opts.dragY))) {
                canvas.style.cursor = 'default';
            }
            
            if (state[OPT_DRAG_SENSITIVITY_X] !== undefined) {
                opts.dragSensitivityX = state[OPT_DRAG_SENSITIVITY_X];
            }
            
            if (state[OPT_DRAG_SENSITIVITY_Y] !== undefined) {
                opts.dragSensitivityY = state[OPT_DRAG_SENSITIVITY_Y];
            }
            
            if (state[OPT_RETURN_X_TO_DEFAULT] !== undefined) {
                opts.returnXToDefault = state[OPT_RETURN_X_TO_DEFAULT];
            }
            
            if (state[OPT_RETURN_Y_TO_DEFAULT] !== undefined) {
                opts.returnYToDefault = state[OPT_RETURN_Y_TO_DEFAULT];
            }
            
            if (state[OPT_RETURN_SPEED] !== undefined) {
                opts.returnSpeed = state[OPT_RETURN_SPEED];
            }
            
            if (state[OPT_AUTO_ROTATE_SPEED] !== undefined) {
                opts.autoRotateSpeed = state[OPT_AUTO_ROTATE_SPEED];
            }
            
            // Update event listeners if drag options changed
            if (interactiveOptionsChanged) {
                updateEventListeners();
            }

            // Handle auto-rotation
            if (!interaction.isPaused && !interaction.isDragging && !opts.returnXToDefault) {
                interaction.autoRotateOffset += opts.autoRotateSpeed || 0;
            }
            
            // Handle X axis smooth return to default when not dragging
            if (!interaction.isDragging && opts.returnXToDefault) {
                const deltaX = 0 - interaction.dragOffset.x;
                const deltaAutoX = 0 - interaction.autoRotateOffset;
                interaction.dragOffset.x += deltaX * (opts.returnSpeed || 0.05);
                interaction.autoRotateOffset += deltaAutoX * (opts.returnSpeed || 0.05);
            }

            // Handle Y axis smooth return to default when not dragging
            if (!interaction.isDragging && opts.returnYToDefault) {
                const deltaY = 0 - interaction.dragOffset.y;
                interaction.dragOffset.y += deltaY * (opts.returnSpeed || 0.05);
            }

            // Apply rotation from all sources
            if (state.phi !== undefined) {
                opts.phi = state.phi;
            }
            if (state.theta !== undefined) {
                opts.theta = state.theta;
            }

            uniforms[GLSLX_NAME_PHI].value = (opts.phi || 0) + interaction.autoRotateOffset + interaction.dragOffset.x;
            uniforms[GLSLX_NAME_THETA].value = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, (opts.theta || 0) + interaction.dragOffset.y));

            // Apply other state updates to uniforms
            for (const k in OPT_MAPPING) {
                if (k !== OPT_PHI && k !== OPT_THETA && state[k] !== undefined) {
                    uniforms[OPT_MAPPING[k]].value = state[k];
                }
            }
            if (state[OPT_MARKERS] !== undefined) {
                uniforms[GLSLX_NAME_MARKERS].value = mapMarkers(
                    state[OPT_MARKERS],
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
        },
    });
    
    // Return the globe object with additional control methods
    const globe = p;
    
    // Add method to toggle rotation
    globe.toggleRotation = () => {
        interaction.isPaused = !interaction.isPaused;
        return interaction.isPaused;
    };
    
    // Add method to get current rotation state
    globe.isRotating = () => !interaction.isPaused;
    
    // Add method to reset position
    globe.resetPosition = () => {
        interaction.dragOffset = { x: 0, y: 0 };
        interaction.autoRotateOffset = 0;
    };

    return globe;
};
