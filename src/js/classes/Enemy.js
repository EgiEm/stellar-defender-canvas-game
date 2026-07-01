import { c } from '../canvas.js'
import { drawRoundedRect } from '../utils.js'

export class Enemy {
  constructor({ x, y, startX, endX, speed }) {
    this.position = { x, y }
    this.width = 52
    this.height = 52
    this.startX = startX
    this.endX = endX
    this.speed = speed
    this.velocity = { x: speed }
    this.alive = true
  }

  draw() {
    if (!this.alive) return

    c.fillStyle = '#7f1d1d'
    drawRoundedRect(c, this.position.x, this.position.y, this.width, this.height, 10)
    c.fill()

    c.fillStyle = '#ffffff'
    c.beginPath()
    c.arc(this.position.x + 16, this.position.y + 18, 5, 0, Math.PI * 2)
    c.arc(this.position.x + 36, this.position.y + 18, 5, 0, Math.PI * 2)
    c.fill()
  }

  update() {
    if (!this.alive) return

    this.position.x += this.velocity.x

    if (this.position.x <= this.startX || this.position.x + this.width >= this.endX) {
      this.velocity.x *= -1
    }

    this.draw()
  }
}
