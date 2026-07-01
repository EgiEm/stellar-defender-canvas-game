/**
 * Helper to create an HTML Image object and set its source.
 */
export function createImage(imageSrc) {
  const image = new Image()
  image.src = imageSrc
  return image
}

/**
 * Helper to draw a path of a rounded rectangle on a 2D canvas context.
 */
export function drawRoundedRect(c, x, y, width, height, radius) {
  c.beginPath()
  c.moveTo(x + radius, y)
  c.lineTo(x + width - radius, y)
  c.quadraticCurveTo(x + width, y, x + width, y + radius)
  c.lineTo(x + width, y + height - radius)
  c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  c.lineTo(x + radius, y + height)
  c.quadraticCurveTo(x, y + height, x, y + height - radius)
  c.lineTo(x, y + radius)
  c.quadraticCurveTo(x, y, x + radius, y)
  c.closePath()
}

/**
 * Checks if a coordinate (mouse) is inside a button rectangle.
 */
export function isInsideButton(mouse, button) {
  return (
    mouse.x >= button.x &&
    mouse.x <= button.x + button.width &&
    mouse.y >= button.y &&
    mouse.y <= button.y + button.height
  )
}

/**
 * Simple AABB collision check between two rectangular objects.
 */
export function rectanglesTouch(a, b) {
  return (
    a.position.x < b.position.x + b.width &&
    a.position.x + a.width > b.position.x &&
    a.position.y < b.position.y + b.height &&
    a.position.y + a.height > b.position.y
  )
}
