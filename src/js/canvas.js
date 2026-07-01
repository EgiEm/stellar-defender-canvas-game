import platform from '../../img/platform.png'
import hills from '../../img/hills.png'
import background from '../../img/background.png'
import platformSmallTall from '../../img/platformSmallTall.png'

import spriteRunLeft from '../../img/spriteRunLeft.png'
import spriteRunRight from '../../img/spriteRunRight.png'
import spriteStandLeft from '../../img/spriteStandLeft.png'
import spriteStandRight from '../../img/spriteStandRight.png'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const gravity = 0.5
const totalMissions = 13
const targetFPS = 60
const frameDelay = 1000 / targetFPS

let lastFrameTime = 0
let gameState = 'start'
let selectedMission = 1
let selectedDifficulty = 'easy'
let unlockedMissionCount = Number(localStorage.getItem('unlockedMissionCount')) || 1

if (unlockedMissionCount < 1) unlockedMissionCount = 1
if (unlockedMissionCount > totalMissions) unlockedMissionCount = totalMissions

const colors = {
  blue: '#1d4ed8',
  blueDark: '#0f2f78',
  locked: '#334155',
  white: '#ffffff',
  overlay: 'rgba(3, 7, 18, 0.58)'
}

const buttons = {
  start: { x: 412, y: 250, width: 200, height: 58, text: 'START' },
  help: { x: 412, y: 325, width: 200, height: 58, text: 'HELP' },
  back: { x: 32, y: 32, width: 130, height: 48, text: 'BACK' },
  easy: { x: 337, y: 215, width: 350, height: 58, text: 'EASY' },
  normal: { x: 337, y: 295, width: 350, height: 58, text: 'NORMAL' },
  hard: { x: 337, y: 375, width: 350, height: 58, text: 'HARD' },
  restart: { x: 312, y: 345, width: 190, height: 54, text: 'RESTART' },
  menu: { x: 522, y: 345, width: 190, height: 54, text: 'MENU' }
}

const difficulties = {
  easy: { label: 'EASY', speedBonus: 0, gapBonus: 0, enemyBonus: 0 },
  normal: { label: 'NORMAL', speedBonus: 1, gapBonus: 70, enemyBonus: 1 },
  hard: { label: 'HARD', speedBonus: 2, gapBonus: 130, enemyBonus: 2 }
}

const missionButtons = []

for (let i = 1; i <= totalMissions; i++) {
  const column = (i - 1) % 4
  const row = Math.floor((i - 1) / 4)

  missionButtons.push({
    missionNumber: i,
    x: 128 + column * 195,
    y: 180 + row * 78,
    width: 165,
    height: 56,
    text: `MISSION ${i}`
  })
}

const missionNames = [
  'First Steps',
  'Broken Road',
  'Hill Runner',
  'Sky Training',
  'Long Jump',
  'Enemy Patrol',
  'Tall Towers',
  'Fast Fighters',
  'Danger Valley',
  'Hard Climb',
  'Last Bridge',
  'Weapon Path',
  'Final War'
]

class Player {
  constructor() {
    this.speed = 8
    this.position = { x: 100, y: 100 }
    this.previousPosition = { x: 100, y: 100 }
    this.velocity = { x: 0, y: 0 }
    this.width = 66
    this.height = 150
    this.frames = 0
    this.canJump = false
    this.lives = 3
    this.hasWeapon = false
    this.ammo = 30
    this.maxAmmo = 30
    this.reloadTimer = 0
    this.shootTimer = 0

    this.sprites = {
      stand: {
        right: createImage(spriteStandRight),
        left: createImage(spriteStandLeft),
        cropWidth: 177,
        width: 66
      },
      run: {
        right: createImage(spriteRunRight),
        left: createImage(spriteRunLeft),
        cropWidth: 341,
        width: 127.875
      }
    }

    this.currentSprite = this.sprites.stand.right
    this.currentCropWidth = 177
  }

  draw() {
    c.drawImage(
      this.currentSprite,
      this.currentCropWidth * this.frames,
      0,
      this.currentCropWidth,
      400,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )

    if (this.hasWeapon) drawPlayerWeapon()
  }

  update() {
    this.previousPosition.x = this.position.x
    this.previousPosition.y = this.position.y

    this.frames++

    if (this.frames > 28) this.frames = 0

    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity
      this.canJump = false
    } else {
      this.velocity.y = 0
      this.canJump = true
    }

    if (this.reloadTimer > 0) {
      this.reloadTimer--
      if (this.reloadTimer === 0) this.ammo = this.maxAmmo
    }

    if (this.shootTimer > 0) this.shootTimer--
  }
}

class Platform {
  constructor({ x, y, image }) {
    this.position = { x, y }
    this.image = image
    this.width = image.width
    this.height = image.height
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }
}

class GenericObject {
  constructor({ x, y, image }) {
    this.position = { x, y }
    this.image = image
    this.width = image.width
    this.height = image.height
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }
}

class Enemy {
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
    drawRoundedRect(this.position.x, this.position.y, this.width, this.height, 10)
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

class WeaponPickup {
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
    drawRoundedRect(this.position.x, this.position.y + 10, 68, 12, 3)
    c.fill()

    c.fillStyle = '#374151'
    c.fillRect(this.position.x + 20, this.position.y + 22, 14, 20)
    c.fillRect(this.position.x + 52, this.position.y + 7, 32, 6)

    c.fillStyle = '#e5e7eb'
    c.fillRect(this.position.x + 6, this.position.y + 13, 12, 6)
  }
}

class Bullet {
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

class Boss {
  constructor({ x, y }) {
    this.name = 'Commander Rexon'
    this.position = { x, y }
    this.width = 135
    this.height = 165
    this.maxHealth = 150
    this.health = this.maxHealth
    this.shootTimer = 90
    this.alive = true
  }

  draw() {
    if (!this.alive) return

    c.fillStyle = '#312e81'
    drawRoundedRect(this.position.x, this.position.y, this.width, this.height, 18)
    c.fill()

    c.fillStyle = '#f8fafc'
    c.fillRect(this.position.x + 30, this.position.y + 35, 18, 18)
    c.fillRect(this.position.x + 87, this.position.y + 35, 18, 18)

    c.fillStyle = '#dc2626'
    c.fillRect(this.position.x + 35, this.position.y + 95, 65, 12)

    drawBossHealth()
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

class Door {
  constructor({ x, y }) {
    this.position = { x, y }
    this.width = 78
    this.height = 118
    this.open = false
  }

  draw() {
    c.fillStyle = this.open ? '#22c55e' : '#475569'
    drawRoundedRect(this.position.x, this.position.y, this.width, this.height, 10)
    c.fill()

    c.strokeStyle = '#f8fafc'
    c.lineWidth = 4
    drawRoundedRect(this.position.x, this.position.y, this.width, this.height, 10)
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

function createImage(imageSrc) {
  const image = new Image()
  image.src = imageSrc
  return image
}

function drawRoundedRect(x, y, width, height, radius) {
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

function drawButton(button) {
  const locked = button.locked

  c.fillStyle = locked ? colors.locked : colors.blue
  drawRoundedRect(button.x, button.y, button.width, button.height, 14)
  c.fill()

  c.strokeStyle = locked ? '#64748b' : colors.white
  c.lineWidth = 3
  drawRoundedRect(button.x, button.y, button.width, button.height, 14)
  c.stroke()

  c.fillStyle = colors.white
  c.font = 'bold 20px Arial'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillText(
    button.text,
    button.x + button.width / 2,
    button.y + button.height / 2 - (locked ? 8 : 0)
  )

  if (locked) {
    c.font = '14px Arial'
    c.fillStyle = '#cbd5e1'
    c.fillText('LOCKED', button.x + button.width / 2, button.y + button.height / 2 + 15)
  }

  c.textAlign = 'left'
  c.textBaseline = 'alphabetic'
}

function isInsideButton(mouse, button) {
  return (
    mouse.x >= button.x &&
    mouse.x <= button.x + button.width &&
    mouse.y >= button.y &&
    mouse.y <= button.y + button.height
  )
}

function rectanglesTouch(a, b) {
  return (
    a.position.x < b.position.x + b.width &&
    a.position.x + a.width > b.position.x &&
    a.position.y < b.position.y + b.height &&
    a.position.y + a.height > b.position.y
  )
}

function unlockNextMission() {
  if (selectedMission === unlockedMissionCount && unlockedMissionCount < totalMissions) {
    unlockedMissionCount++
    localStorage.setItem('unlockedMissionCount', unlockedMissionCount)
  }
}

function drawBackgroundOnly() {
  c.fillStyle = 'white'
  c.fillRect(0, 0, canvas.width, canvas.height)

  const bg = createImage(background)
  const hill = createImage(hills)

  c.drawImage(bg, -1, -1)
  c.drawImage(hill, -1, -1)
}

function drawTitle(text, y) {
  c.fillStyle = colors.white
  c.font = 'bold 52px Arial'
  c.textAlign = 'center'
  c.fillText(text, canvas.width / 2, y)
  c.textAlign = 'left'
}

function drawStartScreen() {
  drawBackgroundOnly()

  c.fillStyle = colors.overlay
  c.fillRect(0, 0, canvas.width, canvas.height)

  drawTitle('MARIO MISSION', 165)

  c.fillStyle = colors.white
  c.font = '24px Arial'
  c.textAlign = 'center'
  c.fillText('Point A to Point B', canvas.width / 2, 205)
  c.textAlign = 'left'

  drawButton(buttons.start)
  drawButton(buttons.help)
}

function drawHelpScreen() {
  drawBackgroundOnly()

  c.fillStyle = colors.overlay
  c.fillRect(0, 0, canvas.width, canvas.height)

  drawButton(buttons.back)
  drawTitle('HELP', 145)

  c.fillStyle = colors.white
  c.font = '28px Arial'
  c.textAlign = 'center'
  c.fillText('A - Move Left', canvas.width / 2, 235)
  c.fillText('D - Move Right', canvas.width / 2, 280)
  c.fillText('W / SPACE - Jump', canvas.width / 2, 325)
  c.fillText('Stomp enemies. Mission 13 has the final boss.', canvas.width / 2, 390)
  c.textAlign = 'left'
}

function drawMissionScreen() {
  drawBackgroundOnly()

  c.fillStyle = colors.overlay
  c.fillRect(0, 0, canvas.width, canvas.height)

  drawButton(buttons.back)
  drawTitle('SELECT MISSION', 125)

  missionButtons.forEach(button => {
    drawButton({
      ...button,
      text: `${button.missionNumber}. ${missionNames[button.missionNumber - 1]}`,
      locked: button.missionNumber > unlockedMissionCount
    })
  })

  c.fillStyle = colors.white
  c.font = '18px Arial'
  c.textAlign = 'center'
  c.fillText(
    `${unlockedMissionCount} / ${totalMissions} missions unlocked`,
    canvas.width / 2,
    520
  )
  c.textAlign = 'left'
}

function drawDifficultyScreen() {
  drawBackgroundOnly()

  c.fillStyle = colors.overlay
  c.fillRect(0, 0, canvas.width, canvas.height)

  drawButton(buttons.back)
  drawTitle('SELECT DIFFICULTY', 150)

  c.fillStyle = colors.white
  c.font = '22px Arial'
  c.textAlign = 'center'
  c.fillText(`Mission ${selectedMission}: ${missionNames[selectedMission - 1]}`, canvas.width / 2, 185)
  c.textAlign = 'left'

  drawButton(buttons.easy)
  drawButton(buttons.normal)
  drawButton(buttons.hard)
}

function drawWinScreen() {
  c.fillStyle = 'rgba(0, 0, 0, 0.58)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  c.fillStyle = colors.white
  c.font = 'bold 60px Arial'
  c.textAlign = 'center'
  c.fillText(selectedMission === 13 ? 'YOU WINNN!' : 'YOU WIN!', canvas.width / 2, canvas.height / 2 - 60)

  c.font = 'bold 34px Arial'
  c.fillText(
    selectedMission === 13 ? 'CONGRATSS!' : `MISSION ${selectedMission} COMPLETE`,
    canvas.width / 2,
    canvas.height / 2
  )

  if (selectedMission < totalMissions) {
    c.font = '22px Arial'
    c.fillText(
      `MISSION ${selectedMission + 1} UNLOCKED`,
      canvas.width / 2,
      canvas.height / 2 + 50
    )
  }

  drawButton(buttons.restart)
  drawButton(buttons.menu)

  c.textAlign = 'left'
}

let platformImage = createImage(platform)
let platformSmallTallImage = createImage(platformSmallTall)

let player
let platforms = []
let enemies = []
let genericObjects = []
let bullets = []
let bossBullets = []
let weaponPickup = null
let boss = null
let exitDoor = null
let currentKey
let scrollOffset = 0
let missionWinOffset = 7600

const keys = {
  right: { pressed: false },
  left: { pressed: false }
}

function createMissionPlatforms() {
  const diff = difficulties[selectedDifficulty]
  const mission = selectedMission
  const length = mission === 13 ? 24 : 8 + mission
  const platformsList = []

  let x = -1

  for (let i = 0; i < length; i++) {
    const isTall = i > 2 && (i + mission) % 5 === 0
    const baseGap =
      mission === 13
        ? 135 + diff.gapBonus * 0.45
        : 120 + mission * 18 + diff.gapBonus
    const gap = i < 2 ? -3 : baseGap + (i % 3) * 45
    const yPattern = [470, 430, 390, 350, 470, 410, 320]
    const y = i < 2 ? 470 : yPattern[(i + mission) % yPattern.length]

    platformsList.push(
      new Platform({
        x,
        y: isTall ? y - 70 : y,
        image: isTall ? platformSmallTallImage : platformImage
      })
    )

    x += platformImage.width + gap
  }

  if (mission === 13) {
    platformsList.push(new Platform({ x: x + 250, y: 470, image: platformImage }))
    platformsList.push(new Platform({ x: x + 720, y: 430, image: platformImage }))
    platformsList.push(new Platform({ x: x + 1190, y: 470, image: platformImage }))
    platformsList.push(new Platform({ x: x + 1660, y: 470, image: platformImage }))
  }

  missionWinOffset = mission === 13 ? x + 1700 : 4300 + mission * 700 + diff.gapBonus * 4
  return platformsList
}

function createEnemies() {
  const diff = difficulties[selectedDifficulty]
  const mission = selectedMission
  const enemiesList = []
  const enemyCount = Math.min(2 + Math.floor(mission / 2) + diff.enemyBonus, mission === 13 ? 12 : 9)

  for (let i = 0; i < enemyCount; i++) {
    const platformIndex = 2 + i * 2

    if (!platforms[platformIndex]) continue

    const platformItem = platforms[platformIndex]
    const enemyX = platformItem.position.x + 120

    enemiesList.push(
      new Enemy({
        x: enemyX,
        y: platformItem.position.y - 52,
        startX: platformItem.position.x + 20,
        endX: platformItem.position.x + platformItem.width - 20,
        speed: 1.4 + mission * 0.12 + diff.speedBonus * 0.35
      })
    )
  }

  return enemiesList
}

function init() {
  platformImage = createImage(platform)
  platformSmallTallImage = createImage(platformSmallTall)

  player = new Player()
  scrollOffset = 0

  keys.right.pressed = false
  keys.left.pressed = false
  currentKey = null

  platforms = createMissionPlatforms()
  enemies = createEnemies()
  bullets = []
  bossBullets = []

  const weaponPlatform = selectedMission === 13 ? platforms[platforms.length - 4] : null
  const bossPlatform = selectedMission === 13 ? platforms[platforms.length - 2] : null
  const doorPlatform = selectedMission === 13 ? platforms[platforms.length - 1] : null

  weaponPickup =
    selectedMission === 13 && weaponPlatform
      ? new WeaponPickup({
        x: weaponPlatform.position.x + 180,
        y: weaponPlatform.position.y - 58
      })
      : null

  boss =
    selectedMission === 13 && bossPlatform
      ? new Boss({
        x: bossPlatform.position.x + 215,
        y: bossPlatform.position.y - 165
      })
      : null

  exitDoor =
    selectedMission === 13 && doorPlatform
      ? new Door({
        x: doorPlatform.position.x + 270,
        y: doorPlatform.position.y - 118
      })
      : null

  genericObjects = [
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(background)
    }),
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(hills)
    })
  ]
}

function drawGameHud() {
  const difficulty = difficulties[selectedDifficulty]

  c.fillStyle = 'rgba(15, 47, 120, 0.82)'
  drawRoundedRect(20, 20, 355, 100, 14)
  c.fill()

  c.strokeStyle = colors.white
  c.lineWidth = 2
  drawRoundedRect(20, 20, 355, 100, 14)
  c.stroke()

  c.fillStyle = colors.white
  c.font = 'bold 18px Arial'
  c.fillText(`MISSION ${selectedMission} - ${missionNames[selectedMission - 1]}`, 38, 50)

  c.font = '15px Arial'
  c.fillText(`Difficulty: ${difficulty.label}`, 38, 76)
  c.fillText(`Lives: ${player.lives}`, 38, 100)

  if (player.hasWeapon) {
    c.fillText(
      player.reloadTimer > 0 ? 'Reloading...' : `M4 Ammo: ${player.ammo} / ${player.maxAmmo}`,
      190,
      100
    )
  }
}

function drawPlayerWeapon() {
  c.fillStyle = '#111827'
  c.fillRect(player.position.x + player.width - 10, player.position.y + 74, 58, 8)

  c.fillStyle = '#374151'
  c.fillRect(player.position.x + player.width + 10, player.position.y + 82, 12, 18)
}

function drawBossHealth() {
  if (!boss || !boss.alive) return

  c.fillStyle = 'rgba(0, 0, 0, 0.65)'
  drawRoundedRect(612, 24, 370, 72, 12)
  c.fill()

  c.fillStyle = colors.white
  c.font = 'bold 18px Arial'
  c.fillText(`${boss.name}`, 632, 50)

  c.fillStyle = '#7f1d1d'
  c.fillRect(632, 65, 315, 16)

  c.fillStyle = '#22c55e'
  c.fillRect(632, 65, 315 * (boss.health / boss.maxHealth), 16)

  c.strokeStyle = colors.white
  c.strokeRect(632, 65, 315, 16)
}

function shootPlayerBullet() {
  if (!player.hasWeapon || player.reloadTimer > 0 || player.shootTimer > 0) return

  if (player.ammo <= 0) {
    player.reloadTimer = 90
    return
  }

  bullets.push(
    new Bullet({
      x: player.position.x + player.width + 40,
      y: player.position.y + 78,
      speed: 14
    })
  )

  player.ammo--
  player.shootTimer = 7

  if (player.ammo <= 0) player.reloadTimer = 90
}

function moveWorld(amount) {
  platforms.forEach(platformItem => {
    platformItem.position.x += amount
  })

  enemies.forEach(enemy => {
    enemy.position.x += amount
    enemy.startX += amount
    enemy.endX += amount
  })

  genericObjects.forEach(genericObject => {
    genericObject.position.x += amount * 0.66
  })

  if (weaponPickup) weaponPickup.position.x += amount
  if (boss) boss.position.x += amount
  if (exitDoor) exitDoor.position.x += amount

  bullets.forEach(bullet => {
    bullet.position.x += amount
  })

  bossBullets.forEach(bullet => {
    bullet.position.x += amount
  })
}

function handlePlayerMovement() {
  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = player.speed
  } else if (
    (keys.left.pressed && player.position.x > 100) ||
    (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)
  ) {
    player.velocity.x = -player.speed
  } else {
    player.velocity.x = 0

    if (keys.right.pressed) {
      scrollOffset += player.speed
      moveWorld(-player.speed)
    } else if (keys.left.pressed && scrollOffset > 0) {
      scrollOffset -= player.speed
      moveWorld(player.speed)
    }
  }
}

function handlePlatformCollisions() {
  player.canJump = false

  platforms.forEach(platformItem => {
    if (
      player.position.y + player.height <= platformItem.position.y &&
      player.position.y + player.height + player.velocity.y >= platformItem.position.y &&
      player.position.x + player.width >= platformItem.position.x &&
      player.position.x <= platformItem.position.x + platformItem.width
    ) {
      player.velocity.y = 0
      player.position.y = platformItem.position.y - player.height
      player.canJump = true
    }
  })
}

function handleEnemyCollisions() {
  enemies.forEach(enemy => {
    if (!enemy.alive) return
    if (!rectanglesTouch(player, enemy)) return

    const wasAboveEnemy = player.previousPosition.y + player.height <= enemy.position.y + 12

    if (wasAboveEnemy && player.velocity.y >= 0) {
      enemy.alive = false
      player.velocity.y = -10
    } else {
      init()
    }
  })
}

function handleWeaponBossAndDoor() {
  if (weaponPickup && !weaponPickup.collected && rectanglesTouch(player, weaponPickup)) {
    weaponPickup.collected = true
    player.hasWeapon = true
  }

  if (player.hasWeapon && boss && boss.alive) {
    shootPlayerBullet()
  }

  bullets.forEach(bullet => {
    bullet.update()

    if (boss && boss.alive && rectanglesTouch(bullet, boss)) {
      boss.health -= 15
      bullet.active = false

      if (boss.health <= 0) {
        boss.alive = false
        bossBullets = []
        if (exitDoor) exitDoor.open = true
      }
    }
  })

  bossBullets.forEach(bullet => {
    bullet.update()

    if (rectanglesTouch(player, bullet)) {
      bullet.active = false
      player.lives--

      if (player.lives <= 0) {
        init()
      }
    }
  })

  if (exitDoor && exitDoor.open && rectanglesTouch(player, exitDoor)) {
    unlockNextMission()
    gameState = 'won'
  }

  bullets = bullets.filter(bullet => bullet.active)
  bossBullets = bossBullets.filter(bullet => bullet.active)
}

function updateSprites() {
  if (
    keys.right.pressed &&
    currentKey === 'right' &&
    player.currentSprite !== player.sprites.run.right
  ) {
    player.frames = 1
    player.currentSprite = player.sprites.run.right
    player.currentCropWidth = player.sprites.run.cropWidth
    player.width = player.sprites.run.width
  } else if (
    keys.left.pressed &&
    currentKey === 'left' &&
    player.currentSprite !== player.sprites.run.left
  ) {
    player.frames = 1
    player.currentSprite = player.sprites.run.left
    player.currentCropWidth = player.sprites.run.cropWidth
    player.width = player.sprites.run.width
  } else if (
    !keys.left.pressed &&
    currentKey === 'left' &&
    player.currentSprite !== player.sprites.stand.left
  ) {
    player.frames = 1
    player.currentSprite = player.sprites.stand.left
    player.currentCropWidth = player.sprites.stand.cropWidth
    player.width = player.sprites.stand.width
  } else if (
    !keys.right.pressed &&
    currentKey === 'right' &&
    player.currentSprite !== player.sprites.stand.right
  ) {
    player.frames = 1
    player.currentSprite = player.sprites.stand.right
    player.currentCropWidth = player.sprites.stand.cropWidth
    player.width = player.sprites.stand.width
  }
}

function playMission() {
  genericObjects.forEach(genericObject => {
    genericObject.draw()
  })

  platforms.forEach(platformItem => {
    platformItem.draw()
  })

  enemies.forEach(enemy => {
    enemy.update()
  })

  if (weaponPickup) weaponPickup.draw()
  if (boss) boss.update()
  if (exitDoor && (!boss || !boss.alive)) exitDoor.draw()

  player.update()
  drawGameHud()

  handlePlayerMovement()
  handlePlatformCollisions()
  handleEnemyCollisions()
  handleWeaponBossAndDoor()
  updateSprites()

  if (selectedMission !== 13 && scrollOffset > missionWinOffset) {
    unlockNextMission()
    gameState = 'won'
  }

  const deathLine = 470

  if (player.position.y + player.height >= deathLine && !player.canJump) {
    init()
  }
}

function animate(currentTime = 0) {
  requestAnimationFrame(animate)

  const elapsed = currentTime - lastFrameTime

  if (elapsed < frameDelay) {
    return
  }

  lastFrameTime = currentTime - (elapsed % frameDelay)

  c.fillStyle = 'white'
  c.fillRect(0, 0, canvas.width, canvas.height)

  if (gameState === 'start') {
    drawStartScreen()
    return
  }

  if (gameState === 'help') {
    drawHelpScreen()
    return
  }

  if (gameState === 'missions') {
    drawMissionScreen()
    return
  }

  if (gameState === 'difficulty') {
    drawDifficultyScreen()
    return
  }

  if (gameState === 'playing') {
    playMission()
    return
  }

  if (gameState === 'won') {
    genericObjects.forEach(genericObject => {
      genericObject.draw()
    })

    platforms.forEach(platformItem => {
      platformItem.draw()
    })

    enemies.forEach(enemy => {
      enemy.draw()
    })

    if (weaponPickup) weaponPickup.draw()
    if (boss) boss.draw()
    if (exitDoor) exitDoor.draw()

    player.draw()
    drawGameHud()
    drawWinScreen()
  }
}

init()
animate()

addEventListener('click', event => {
  const rect = canvas.getBoundingClientRect()
  const mouse = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  if (gameState === 'start') {
    if (isInsideButton(mouse, buttons.start)) {
      gameState = 'missions'
    } else if (isInsideButton(mouse, buttons.help)) {
      gameState = 'help'
    }
  } else if (gameState === 'help') {
    if (isInsideButton(mouse, buttons.back)) {
      gameState = 'start'
    }
  } else if (gameState === 'missions') {
    if (isInsideButton(mouse, buttons.back)) {
      gameState = 'start'
    }

    missionButtons.forEach(button => {
      const locked = button.missionNumber > unlockedMissionCount

      if (!locked && isInsideButton(mouse, button)) {
        selectedMission = button.missionNumber
        gameState = 'difficulty'
      }
    })
  } else if (gameState === 'difficulty') {
    if (isInsideButton(mouse, buttons.back)) {
      gameState = 'missions'
    } else if (isInsideButton(mouse, buttons.easy)) {
      selectedDifficulty = 'easy'
      init()
      gameState = 'playing'
    } else if (isInsideButton(mouse, buttons.normal)) {
      selectedDifficulty = 'normal'
      init()
      gameState = 'playing'
    } else if (isInsideButton(mouse, buttons.hard)) {
      selectedDifficulty = 'hard'
      init()
      gameState = 'playing'
    }
  } else if (gameState === 'won') {
    if (isInsideButton(mouse, buttons.restart)) {
      init()
      gameState = 'playing'
    } else if (isInsideButton(mouse, buttons.menu)) {
      init()
      gameState = 'start'
    }
  }
})

addEventListener('keydown', ({ keyCode, repeat }) => {
  if (repeat) return

  switch (keyCode) {
    case 65:
      if (gameState === 'playing') {
        keys.left.pressed = true
        currentKey = 'left'
      }
      break

    case 68:
      if (gameState === 'playing') {
        keys.right.pressed = true
        currentKey = 'right'
      }
      break

    case 87:
    case 32:
      if (gameState === 'playing' && player.canJump) {
        player.velocity.y = -15
        player.canJump = false
      }
      break

    case 82:
      if (gameState === 'won') {
        init()
        gameState = 'playing'
      }
      break

    case 27:
      if (gameState === 'help' || gameState === 'missions') {
        gameState = 'start'
      } else if (gameState === 'difficulty') {
        gameState = 'missions'
      }
      break
  }
})

addEventListener('keyup', ({ keyCode }) => {
  switch (keyCode) {
    case 65:
      keys.left.pressed = false
      break

    case 68:
      keys.right.pressed = false
      break
  }
})