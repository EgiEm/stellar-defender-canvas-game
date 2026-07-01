import { c, canvas } from '../canvas.js'

export class Bullet {
  constructor({ x, y, speed, fromBoss = false }) {
    this.position = { x, y }
    this.width = fromBoss ? 22 : 14
    this.height = fromBoss ? 22 : 6
    this.speed = speed
    this.fromBoss = fromBoss
    this.active = true
  }

  update() {
    this.position.x += this.speed

    if (this.position.x < -100 || this.position.x > canvas.width + 100) {
      this.active = false
    }

    c.fillStyle = this.fromBoss ? '#ef4444' : '#facc15'

    if (this.fromBoss) {
      c.beginPath()
      c.arc(this.position.x, this.position.y, this.width / 2, 0, Math.PI * 2)
      c.fill()
    } else {
      c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
  }
}
