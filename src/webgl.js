/**
 * Create and compile a shader
 * @param {WebGLRenderingContext} gl
 * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param {string} source
 * @returns {WebGLShader | null}
 */
function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/**
 * Create a shader program from vertex and fragment shader sources
 * @param {WebGLRenderingContext} gl
 * @param {string} vertSrc
 * @param {string} fragSrc
 * @returns {WebGLProgram | null}
 */
export function createProgram(gl, vertSrc, fragSrc) {
  const vert = createShader(gl, gl.VERTEX_SHADER, vertSrc)
  const frag = createShader(gl, gl.FRAGMENT_SHADER, fragSrc)
  if (!vert || !frag) return null

  const program = gl.createProgram()
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }

  // Clean up shaders after linking
  gl.deleteShader(vert)
  gl.deleteShader(frag)

  return program
}

export function getUniformLocations(gl, program, names) {
  const locations = {}
  for (const name of names) {
    locations[name] = gl.getUniformLocation(program, name)
  }
  return locations
}

export function getAttribLocations(gl, program, names) {
  const locations = {}
  for (const name of names) {
    locations[name] = gl.getAttribLocation(program, name)
  }
  return locations
}
