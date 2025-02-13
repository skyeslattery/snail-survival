import { CANVAS_WIDTH, PLAYER_WIDTH, ACCELERATION, MAX_SPEED } from './constants.js';

let playerX = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
let playerVelocityX = 0;
let facingLeft = false;

export function updatePlayerPosition(dt) {
  playerX += playerVelocityX * dt;
  if (playerX < 0) {
    playerX = 0;
  } else if (playerX > CANVAS_WIDTH - PLAYER_WIDTH) {
    playerX = CANVAS_WIDTH - PLAYER_WIDTH;
  }
}

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
