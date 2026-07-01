import { c, canvas } from '../canvas.js'

export class GenericObject {
  constructor({ x, y, image }) {
    this.position = { x, y }
    this.image = image
    this.width = image.width
    this.height = image.height
  }

  draw() {
    const startX = ((this.position.x % this.width) + this.width) % this.width - this.width

    for (let x = startX; x < canvas.width + this.width; x += this.width) {
      c.drawImage(this.image, x, this.position.y)
    }
  }
}
