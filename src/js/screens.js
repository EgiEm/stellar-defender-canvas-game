import background from '../../img/background.png'
import hills from '../../img/hills.png'

import { state } from './gameState.js'
import { createImage, drawRoundedRect } from './utils.js'

/**
 * Draws a customized UI button.
 */
export function drawButton(button) {
  const locked = button.locked

  state.c.fillStyle = locked ? state.colors.locked : state.colors.blue
  drawRoundedRect(state.c, button.x, button.y, button.width, button.height, 14)
  state.c.fill()

  state.c.strokeStyle = locked ? '#64748b' : state.colors.white
  state.c.lineWidth = 3
  drawRoundedRect(state.c, button.x, button.y, button.width, button.height, 14)
  state.c.stroke()

  state.c.fillStyle = state.colors.white
  state.c.font = 'bold 20px Arial'
  state.c.textAlign = 'center'
  state.c.textBaseline = 'middle'
  state.c.fillText(
    button.text,
    button.x + button.width / 2,
    button.y + button.height / 2 - (locked ? 8 : 0)
  )

  if (locked) {
    state.c.font = '14px Arial'
    state.c.fillStyle = '#cbd5e1'
    state.c.fillText('LOCKED', button.x + button.width / 2, button.y + button.height / 2 + 15)
  }

  state.c.textAlign = 'left'
  state.c.textBaseline = 'alphabetic'
}

/**
 * Draws the base scrolling background assets.
 */
export function drawBackgroundOnly() {
  state.c.fillStyle = 'white'
  state.c.fillRect(0, 0, state.canvas.width, state.canvas.height)

  const bg = createImage(background)
  const hill = createImage(hills)

  state.c.drawImage(bg, -1, -1)
  state.c.drawImage(hill, -1, -1)
}

/**
 * Draws text titles centered on canvas.
 */
export function drawTitle(text, y) {
  state.c.fillStyle = state.colors.white
  state.c.font = 'bold 52px Arial'
  state.c.textAlign = 'center'
  state.c.fillText(text, state.canvas.width / 2, y)
  state.c.textAlign = 'left'
}

/**
 * Renders the start game menu screen.
 */
export function drawStartScreen() {
  drawBackgroundOnly()

  state.c.fillStyle = state.colors.overlay
  state.c.fillRect(0, 0, state.canvas.width, state.canvas.height)

  drawTitle('STELLAR DEFENDER', 165)

  state.c.fillStyle = state.colors.white
  state.c.font = '24px Arial'
  state.c.textAlign = 'center'
  state.c.fillText('Defend the Galaxy', state.canvas.width / 2, 205)
  state.c.textAlign = 'left'

  drawButton(state.buttons.start)
  drawButton(state.buttons.help)
}

/**
 * Renders the instructions and controls help screen.
 */
export function drawHelpScreen() {
  drawBackgroundOnly()

  state.c.fillStyle = state.colors.overlay
  state.c.fillRect(0, 0, state.canvas.width, state.canvas.height)

  drawButton(state.buttons.back)
  drawTitle('HELP', 145)

  state.c.fillStyle = state.colors.white
  state.c.font = '28px Arial'
  state.c.textAlign = 'center'
  state.c.fillText('A - Move Left', state.canvas.width / 2, 235)
  state.c.fillText('D - Move Right', state.canvas.width / 2, 280)
  state.c.fillText('W / SPACE - Jump', state.canvas.width / 2, 325)
  state.c.fillText('Stomp enemies. Mission 13 has the final boss.', state.canvas.width / 2, 390)
  state.c.textAlign = 'left'
}

/**
 * Renders the mission selection catalog grid.
 */
export function drawMissionScreen() {
  drawBackgroundOnly()

  state.c.fillStyle = state.colors.overlay
  state.c.fillRect(0, 0, state.canvas.width, state.canvas.height)

  drawButton(state.buttons.back)
  drawTitle('SELECT MISSION', 125)

  state.missionButtons.forEach(button => {
    drawButton({
      ...button,
      text: `${button.missionNumber}. ${state.missionNames[button.missionNumber - 1]}`,
      locked: button.missionNumber > state.unlockedMissionCount
    })
  })

  state.c.fillStyle = state.colors.white
  state.c.font = '18px Arial'
  state.c.textAlign = 'center'
  state.c.fillText(
    `${state.unlockedMissionCount} / ${state.totalMissions} missions unlocked`,
    state.canvas.width / 2,
    520
  )
  state.c.textAlign = 'left'
}

/**
 * Renders the difficulty levels selection screen.
 */
export function drawDifficultyScreen() {
  drawBackgroundOnly()

  state.c.fillStyle = state.colors.overlay
  state.c.fillRect(0, 0, state.canvas.width, state.canvas.height)

  drawButton(state.buttons.back)
  drawTitle('SELECT DIFFICULTY', 150)

  state.c.fillStyle = state.colors.white
  state.c.font = '22px Arial'
  state.c.textAlign = 'center'
  state.c.fillText(`Mission ${state.selectedMission}: ${state.missionNames[state.selectedMission - 1]}`, state.canvas.width / 2, 185)
  state.c.textAlign = 'left'

  drawButton(state.buttons.easy)
  drawButton(state.buttons.normal)
  drawButton(state.buttons.hard)
}

/**
 * Renders the level HUD statistics (lives, mission title, ammo).
 */
export function drawGameHud() {
  const difficulty = state.difficulties[state.selectedDifficulty]

  state.c.fillStyle = 'rgba(15, 47, 120, 0.82)'
  drawRoundedRect(state.c, 20, 20, 355, 100, 14)
  state.c.fill()

  state.c.strokeStyle = state.colors.white
  state.c.lineWidth = 2
  drawRoundedRect(state.c, 20, 20, 355, 100, 14)
  state.c.stroke()

  state.c.fillStyle = state.colors.white
  state.c.font = 'bold 18px Arial'
  state.c.fillText(`MISSION ${state.selectedMission} - ${state.missionNames[state.selectedMission - 1]}`, 38, 50)

  state.c.font = '15px Arial'
  state.c.fillText(`Difficulty: ${difficulty.label}`, 38, 76)
  state.c.fillText(`Lives: ${state.player.lives}`, 38, 100)

  if (state.player.hasWeapon) {
    state.c.fillText(
      state.player.reloadTimer > 0 ? 'Reloading...' : `M4 Ammo: ${state.player.ammo} / ${state.player.maxAmmo}`,
      190,
      100
    )
  }
}

/**
 * Renders the victory screen with restart and menu navigations.
 */
export function drawWinScreen() {
  state.c.fillStyle = 'rgba(0, 0, 0, 0.58)'
  state.c.fillRect(0, 0, state.canvas.width, state.canvas.height)

  state.c.fillStyle = state.colors.white
  state.c.font = 'bold 60px Arial'
  state.c.textAlign = 'center'
  state.c.fillText(state.selectedMission === 13 ? 'YOU WINNN!' : 'YOU WIN!', state.canvas.width / 2, state.canvas.height / 2 - 60)

  state.c.font = 'bold 34px Arial'
  state.c.fillText(
    state.selectedMission === 13 ? 'CONGRATSS!' : `MISSION ${state.selectedMission} COMPLETE`,
    state.canvas.width / 2,
    state.canvas.height / 2
  )

  if (state.selectedMission < state.totalMissions) {
    state.c.font = '22px Arial'
    state.c.fillText(
      `MISSION ${state.selectedMission + 1} UNLOCKED`,
      state.canvas.width / 2,
      state.canvas.height / 2 + 50
    )
  }

  drawButton(state.buttons.restart)
  drawButton(state.buttons.menu)

  state.c.textAlign = 'left'
}
