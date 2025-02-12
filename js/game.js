import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  ICON_MARGIN,
  DASH_COOLDOWN,
  SHIELD_COOLDOWN,
  SHIELD_DURATION,
  TOLERANCE,
  DASH_WIDTH,
  SHIELD_WIDTH,
  DASH_HEIGHT,
  SHIELD_HEIGHT,
  BASE_ENEMY_FALL_SPEED,
  MAX_ENEMY_FALL_SPEED,
  TOMATO_HEIGHT,
  TOMATO_WIDTH
} from './constants.js';
import {
  updatePlayerPosition,
  updatePlayerVelocity,
  getPlayerX,
  setPlayerX,
  isFacingLeft,
  resetPlayer
} from './player.js';
import {
  spawnEnemy,
  updateEnemyPositions,
  enemies,
  resetEnemies,
  checkCollision
} from './enemy.js';
import { drawIconWithRecharge, drawScore } from './ui.js';
import {
  isLeftPressed,
  isRightPressed,
  dashTriggered,
  shieldTriggered,
  setupInputListeners
} from './input.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let bestScore = Number(localStorage.getItem('bestScore')) || 0;
let alive = true;
let lastSpawnTime = Date.now();

let dashReady = true;
let dashActive = false;
let shieldReady = true;
let dashLastUsed = 0;
let shieldLastUsed = 0;
let shieldActive = false;

let tomatoCount = Number(localStorage.getItem('tomatoCount')) || 0;
let tomatoes = [];

const snailImage = new Image();
snailImage.src = 'assets/snail-default.png';
const birdImage = new Image();
birdImage.src = 'assets/bird1.png';
const birdImage2 = new Image();
birdImage2.src = 'assets/bird2.png';
const dashIcon = new Image();
dashIcon.src = 'assets/dash-icon.png';
const shieldIcon = new Image();
shieldIcon.src = 'assets/shield-icon.png';
const tomatoImage = new Image();
tomatoImage.src = 'assets/tomato.png';

setupInputListeners();

function drawEnemy(enemy) {
  if (enemy.imageType === 'special') {
    ctx.drawImage(birdImage2, enemy.x, enemy.y, enemy.width, enemy.height);
  } else {
    ctx.drawImage(birdImage, enemy.x, enemy.y, enemy.width, enemy.height);
  }
}

function spawnTomato(canvasWidth) {
  const tomatoSpeed = Math.min(BASE_ENEMY_FALL_SPEED + score * 0.05, MAX_ENEMY_FALL_SPEED);
  const tomato = {
    x: Math.random() * (canvasWidth - 20),
    y: 0,
    width: TOMATO_HEIGHT,
    height: TOMATO_WIDTH,
    velocityY: tomatoSpeed
  };
  tomatoes.push(tomato);
}

function gameOver() {
  cancelAnimationFrame(animationId);
  dashLastUsed = 0;
  shieldLastUsed = 0;
  dashReady = true;
  shieldReady = true;
  alive = false;
  const gameOverElement = document.getElementById('gameOver');
  gameOverElement.style.display = 'block';
  const scoreElement = document.getElementById('score');
  scoreElement.innerHTML = 'Score: ' + score;
  bestScore = Math.max(bestScore, score);
  localStorage.setItem('bestScore', bestScore);
  const bestScoreElement = document.getElementById('bestScore');
  bestScoreElement.innerHTML = 'Best: ' + bestScore;
  document.getElementById('shopIcon').style.display = 'block';
}

function resetGame() {
  resetPlayer();
  resetEnemies();
  score = 0;
  alive = true;
  lastSpawnTime = Date.now();
  dashLastUsed = 0;
  shieldLastUsed = 0;
  dashReady = true;
  shieldReady = true;
  const gameOverElement = document.getElementById('gameOver');
  gameOverElement.style.display = 'none';
  animationId = requestAnimationFrame(gameLoop);
  document.getElementById('shopIcon').style.display = 'none';
}

document.getElementById('resetButton').addEventListener('click', resetGame);

let animationId;
function gameLoop() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawScore(ctx, score);
  let now = Date.now();
  let spawnDelay = Math.max(170, 400 - score * 1.9);
  if (now - lastSpawnTime > spawnDelay) {
    spawnEnemy(score, CANVAS_WIDTH);
    lastSpawnTime = now;
    if (Math.random() < 0.015) {
      spawnTomato(CANVAS_WIDTH);
    }
  }
  if (alive) {
    for (const enemy of enemies) {
      drawEnemy(enemy);
    }
    const removedCount = updateEnemyPositions(CANVAS_HEIGHT);
    score += removedCount;

    if (isFacingLeft()) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(snailImage, -getPlayerX() - PLAYER_WIDTH, CANVAS_HEIGHT - PLAYER_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT);
      ctx.restore();
    } else {
      ctx.drawImage(snailImage, getPlayerX(), CANVAS_HEIGHT - PLAYER_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT);
    }

    if (shieldActive) {
      ctx.beginPath();
      ctx.arc(getPlayerX() + PLAYER_WIDTH / 2, CANVAS_HEIGHT - PLAYER_HEIGHT / 2, PLAYER_WIDTH, 0, Math.PI * 2);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    for (const enemy of enemies) {
      if (
        alive &&
        !shieldActive &&
        checkCollision(getPlayerX(), CANVAS_HEIGHT - PLAYER_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, enemy.x, enemy.y, enemy.width, enemy.height, TOLERANCE)
      ) {
        gameOver();
        return;
      }
    }

    updatePlayerVelocity(isLeftPressed, isRightPressed, alive, dashActive);
    updatePlayerPosition();

    if (dashTriggered && dashReady) {
      dashReady = false;
      dashLastUsed = Date.now();
      dashActive = true;
      setTimeout(() => { dashActive = false; }, 1500);
      setTimeout(() => { dashReady = true; }, DASH_COOLDOWN);
    }

    if (shieldTriggered && shieldReady) {
      shieldReady = false;
      shieldLastUsed = Date.now();
      shieldActive = true;
      setTimeout(() => { shieldActive = false; }, SHIELD_DURATION);
      setTimeout(() => { shieldReady = true; }, SHIELD_COOLDOWN);
    }

    let dashProgress = Math.min((Date.now() - dashLastUsed) / DASH_COOLDOWN, 1);
    let shieldProgress = Math.min((Date.now() - shieldLastUsed) / SHIELD_COOLDOWN, 1);
    let dashX = CANVAS_WIDTH - DASH_WIDTH - ICON_MARGIN;
    let dashY = ICON_MARGIN;
    let shieldX = CANVAS_WIDTH - SHIELD_WIDTH - ICON_MARGIN;
    let shieldY = ICON_MARGIN + DASH_HEIGHT + ICON_MARGIN + 15;
    drawIconWithRecharge(ctx, dashX, dashY, dashIcon, dashProgress, DASH_WIDTH, DASH_HEIGHT);
    drawIconWithRecharge(ctx, shieldX, shieldY, shieldIcon, shieldProgress, SHIELD_WIDTH, SHIELD_HEIGHT);

    for (let i = 0; i < tomatoes.length; i++) {
      let tomato = tomatoes[i];
      tomato.y += tomato.velocityY;
      ctx.drawImage(tomatoImage, tomato.x, tomato.y, tomato.width, tomato.height);
      if (tomato.y > CANVAS_HEIGHT) {
        tomatoes.splice(i, 1);
        i--;
        continue;
      }
      if (checkCollision(getPlayerX(), CANVAS_HEIGHT - PLAYER_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, tomato.x, tomato.y, tomato.width, tomato.height, 0)) {
        tomatoCount++;
        localStorage.setItem('tomatoCount', tomatoCount);
        tomatoes.splice(i, 1);
        i--;
      }
    }

    const tomatoIconSize = 25;
    const tomatoIconX = 10;
    const tomatoIconY = 60;
    ctx.drawImage(tomatoImage, tomatoIconX, tomatoIconY, tomatoIconSize, tomatoIconSize);
    ctx.fillStyle = "white";
    ctx.font = "28px Warmonger";
    ctx.fillText(tomatoCount, tomatoIconX + tomatoIconSize + 5, tomatoIconY + tomatoIconSize - 5);

    animationId = requestAnimationFrame(gameLoop);
  }
}

document.getElementById('shopIcon').addEventListener('click', () => {
  document.getElementById('shopContainer').style.display = 'block';
});
document.getElementById('closeShop').addEventListener('click', () => {
  document.getElementById('shopContainer').style.display = 'none';
});

gameLoop();
