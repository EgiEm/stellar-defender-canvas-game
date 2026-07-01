import { c, bossBullets, colors } from '../canvas.js'
import { drawRoundedRect } from '../utils.js'
import { Bullet } from './Bullet.js'

export class Boss {
  constructor({ x, y }) {
    this.name = 'Commander Rexon'
    this.position = { x, y }
    this.width = 135
    this.height = 165
    this.maxHealth = 500
    this.health = this.maxHealth
    this.shootTimer = 90
    this.alive = true
  }

  drawBossHealth() {
    if (!this.alive) return

    c.fillStyle = 'rgba(0, 0, 0, 0.65)'
    drawRoundedRect(c, 612, 24, 370, 72, 12)
    c.fill()

    c.fillStyle = colors.white
    c.font = 'bold 18px Arial'
    c.fillText(`${this.name}`, 632, 50)

    c.fillStyle = '#7f1d1d'
    c.fillRect(632, 65, 315, 16)

    c.fillStyle = '#22c55e'
    c.fillRect(632, 65, 315 * (this.health / this.maxHealth), 16)

    c.strokeStyle = colors.white
    c.strokeRect(632, 65, 315, 16)
  }

  draw() {
    if (!this.alive) return

    c.fillStyle = '#312e81'
    drawRoundedRect(c, this.position.x, this.position.y, this.width, this.height, 18)
    c.fill()

    c.fillStyle = '#f8fafc'
    c.fillRect(this.position.x + 30, this.position.y + 35, 18, 18)
    c.fillRect(this.position.x + 87, this.position.y + 35, 18, 18)

    c.fillStyle = '#dc2626'
    c.fillRect(this.position.x + 35, this.position.y + 95, 65, 12)

    this.drawBossHealth()
  }

  update() {
    if (!this.alive) return

    this.shootTimer--

    if (this.shootTimer <= 0) {
      bossBullets.push(
        new Bullet({
          x: this.position.x,
          y: this.position.y + 78,
          speed: -8,
          fromBoss: true
        })
      )

      this.shootTimer = 80
    }

    this.draw()
  }
}
