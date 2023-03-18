export const toRgbString = (color) => {
  if (!color) {
    return `rgb(255, 255, 255)`
  }

  const { r, g, b, a } = color
  return `rgb(${r}, ${g}, ${b}, ${a})`
}
