import { CANVAS_WIDTH, PLAYER_WIDTH, ACCELERATION, MAX_SPEED } from './constants.js';

let playerX = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
let playerVelocityX = 0;
let facingLeft = false;

/**
 * Updates the player's position based on its velocity and the elapsed time (dt).
 * @param {number} dt - Delta time in seconds since the last frame.
 */
export function updatePlayerPosition(dt) {
  playerX += playerVelocityX * dt;
  if (playerX < 0) {
    playerX = 0;
  } else if (playerX > CANVAS_WIDTH - PLAYER_WIDTH) {
    playerX = CANVAS_WIDTH - PLAYER_WIDTH;
  }
}

/**
 * Smoothly updates the player's velocity based on input and elapsed time.
 * This function accelerates the player's velocity toward a target velocity.
 * @param {boolean} isLeftPressed - True if left key is pressed.
 * @param {boolean} isRightPressed - True if right key is pressed.
 * @param {boolean} alive - Whether the player is alive.
 * @param {boolean} dashActive - Whether dash is active (doubles target speed).
 * @param {number} dt - Delta time in seconds since the last frame.
 */
export function updatePlayerVelocity(isLeftPressed, isRightPressed, alive, dashActive, dt) {
  if (!alive) {
    playerVelocityX = 0;
    return;
  }
  
  let targetVelocity = 0;
  if (isLeftPressed && !isRightPressed) {
    targetVelocity = -MAX_SPEED;
    facingLeft = true;
  } else if (!isLeftPressed && isRightPressed) {
    targetVelocity = MAX_SPEED;
    facingLeft = false;
  }
  
  if (dashActive) {
    targetVelocity *= 2;
  }
  
  // Smoothly accelerate toward the target velocity.
  // ACCELERATION is in pixels per second squared.
  if (playerVelocityX < targetVelocity) {
    playerVelocityX = Math.min(targetVelocity, playerVelocityX + ACCELERATION * dt);
  } else if (playerVelocityX > targetVelocity) {
    playerVelocityX = Math.max(targetVelocity, playerVelocityX - ACCELERATION * dt);
  }
}

export function getPlayerX() {
  return playerX;
}

export function setPlayerX(newX) {
  playerX = newX;
}

export function isFacingLeft() {
  return facingLeft;
}

export function resetPlayer() {
  playerX = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
  playerVelocityX = 0;
  facingLeft = false;
}
