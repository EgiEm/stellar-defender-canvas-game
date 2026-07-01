import { c } from '../canvas.js'
import { drawRoundedRect } from '../utils.js'

export class WeaponPickup {
  constructor({ x, y }) {
    this.position = { x, y }
    this.width = 90
    this.height = 45
    this.collected = false
  }

  draw() {
    if (this.collected) return

    c.fillStyle = '#facc15'
    c.font = 'bold 18px Arial'
    c.fillText('M4', this.position.x + 20, this.position.y - 12)

    c.fillStyle = '#111827'
    drawRoundedRect(c, this.position.x, this.position.y + 10, 68, 12, 3)
    c.fill()

    c.fillStyle = '#374151'
    c.fillRect(this.position.x + 20, this.position.y + 22, 14, 20)
    c.fillRect(this.position.x + 52, this.position.y + 7, 32, 6)

    c.fillStyle = '#e5e7eb'
    c.fillRect(this.position.x + 6, this.position.y + 13, 12, 6)
  }
}
