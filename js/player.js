import { CANVAS_WIDTH, PLAYER_WIDTH, ACCELERATION, MAX_SPEED } from './constants.js';

let playerX = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
let playerVelocityX = 0;
let facingLeft = false;

export function updatePlayerPosition() {
  playerX += playerVelocityX;
  if (playerX < 0) playerX = 0;
  else if (playerX > CANVAS_WIDTH - PLAYER_WIDTH) playerX = CANVAS_WIDTH - PLAYER_WIDTH;
}

export function updatePlayerVelocity(isLeftPressed, isRightPressed, alive, dashActive) {
  if (!alive) {
    playerVelocityX = 0;
    return;
  }
  let baseVelocity = 0;
  if (isLeftPressed && !isRightPressed) {
    baseVelocity = -ACCELERATION;
    facingLeft = true;
  } else if (!isLeftPressed && isRightPressed) {
    baseVelocity = ACCELERATION;
    facingLeft = false;
  } else {
    baseVelocity = 0;
  }
  baseVelocity = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, baseVelocity));
  if (dashActive) {
    baseVelocity *= 2;
  }
  playerVelocityX = baseVelocity;
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
