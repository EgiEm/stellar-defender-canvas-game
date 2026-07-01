import { c } from '../canvas.js'
import { drawRoundedRect } from '../utils.js'

export class Door {
  constructor({ x, y }) {
    this.position = { x, y }
    this.width = 78
    this.height = 118
    this.open = false
  }

  draw() {
    c.fillStyle = this.open ? '#22c55e' : '#475569'
    drawRoundedRect(c, this.position.x, this.position.y, this.width, this.height, 10)
    c.fill()

    c.strokeStyle = '#f8fafc'
    c.lineWidth = 4
    drawRoundedRect(c, this.position.x, this.position.y, this.width, this.height, 10)
    c.stroke()

    c.fillStyle = '#facc15'
    c.beginPath()
    c.arc(this.position.x + 58, this.position.y + 62, 5, 0, Math.PI * 2)
    c.fill()

    c.fillStyle = '#ffffff'
    c.font = 'bold 14px Arial'
    c.fillText(this.open ? 'ENTER' : 'LOCKED', this.position.x + 9, this.position.y - 10)
  }
}
