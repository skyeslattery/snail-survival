const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let playerX = canvas.width / 2 - 10; 
const playerY = canvas.height; 
let playerVelocityX = 0; 
let alive = true;  
const acceleration = 4.0;
const maxSpeed = 10.0; 
let score = 0;
let bestScore = 0;

const snailLeft = new Image();
snailLeft.src = 'assets/snailLeft.png';

const snailRight = new Image();
snailRight.src = 'assets/snailRight.png';

const birdImage = new Image();
birdImage.src = 'assets/bird1.png'; 

let currentImage = snailRight; 

const enemies = [];

const baseEnemyFallSpeed = 8.0;  
const maxEnemyFallSpeed = 15.0;   

function spawnEnemy() {
  const enemyFallSpeed = Math.min(baseEnemyFallSpeed + score * 0.1, maxEnemyFallSpeed);

  const enemy = {
    x: Math.random() * (canvas.width - 20),
    y: 0,
    width: 20,
    height: 20,
    velocityY: enemyFallSpeed,
  };

  if (score >= 10 && score % 10 === 0) {
    const birdImage = new Image();
    birdImage.src = 'assets/bird2.png'; 

    enemy.image = birdImage;
    enemy.width = 60; 
    enemy.height = 60; 
  }

  enemies.push(enemy);
}


function updateEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    enemy.y += enemy.velocityY;

    if (enemy.y > canvas.height) {
      enemies.splice(i, 1);
      i--;
      score++;
    }

    // Check for collision with player
    if (
      alive &&
      checkCollision(playerX, playerY, 40, 30, enemy.x, enemy.y, enemy.width, enemy.height)
    ) {
      alive = false;
      gameOver();
      return;
    }
  }
}

let spawnInterval; 

function resetGame() {
    playerX = canvas.width / 2 - 10;
    playerVelocityX = 0;
  
    enemies.length = 0;

    score = 0;
  
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnEnemy, 1000);
  
    alive = true;
    const gameOverElement = document.getElementById('gameOver');
    gameOverElement.style.display = 'none';  
    animationId = requestAnimationFrame(draw);
  }
  
  function gameOver() {
    cancelAnimationFrame(animationId);
  
    const gameOverElement = document.getElementById('gameOver');
    gameOverElement.style.display = 'block';
  
    const scoreElement = document.getElementById('score');
    scoreElement.innerHTML = 'Score: ' + score;
  
    bestScore = Math.max(bestScore, score); 
  }
  
  
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
  
    if (bestScore !== null) {
      ctx.fillText('Best Score: ' + bestScore, 10, 60);
    }
  
    if (alive) {
      for (const enemy of enemies) {
        let imageWidth, imageHeight;
        if (enemy.image) {
          imageWidth = enemy.width;
          imageHeight = enemy.height;
        } else {
          imageWidth = 35;
          imageHeight = 35;
        }
        ctx.drawImage(enemy.image || birdImage, enemy.x, enemy.y, imageWidth, imageHeight);
      }
  
      const playerImageWidth = 40; 
      const playerImageHeight = 30; 
      ctx.drawImage(currentImage, playerX, playerY - playerImageHeight, playerImageWidth, playerImageHeight);
  
      updatePlayerPosition();
      updateEnemies();
      animationId = requestAnimationFrame(draw);
    }
  }
  
function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return (
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    y1 + h1 > y2
  );
}

function updatePlayerPosition() {
  playerX += playerVelocityX;

  // Keep the player in bounds
  if (playerX < 0) {
    playerX = 0;
  } else if (playerX > canvas.width - 40) {
    playerX = canvas.width - 40;
  }
}

let isLeftPressed = false;
let isRightPressed = false;

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    isLeftPressed = true;
  } else if (event.key === 'ArrowRight') {
    isRightPressed = true;
  }

  updatePlayerVelocity();
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft') {
    isLeftPressed = false;
  } else if (event.key === 'ArrowRight') {
    isRightPressed = false;
  }

  updatePlayerVelocity();
});

const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', resetGame);

function updatePlayerVelocity() {
    if (!alive) {
      playerVelocityX = 0;
      return;
    }
  
    if (isLeftPressed && !isRightPressed) {
      playerVelocityX = -acceleration;
      currentImage = snailLeft;
    } else if (!isLeftPressed && isRightPressed) {
      playerVelocityX = acceleration;
      currentImage = snailRight;
    } else {
      playerVelocityX = 0;
    }
  
    playerVelocityX = Math.max(-maxSpeed, Math.min(maxSpeed, playerVelocityX));
  }

animationId = requestAnimationFrame(draw);

let interval = Math.max(300, 700 - score*2)
spawnInterval = setInterval(spawnEnemy, interval);
