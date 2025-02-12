(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const CANVAS_WIDTH = canvas.width;
  const CANVAS_HEIGHT = canvas.height;
  const PLAYER_WIDTH = 50;
  const PLAYER_HEIGHT = 27.5;
  const ENEMY_DEFAULT_HEIGHT = 31;
  const ENEMY_DEFAULT_WIDTH = 42;
  const ENEMY_SPECIAL_SIZE = 60;
  const baseEnemyFallSpeed = 7.0;
  const maxEnemyFallSpeed = 40.0;
  const acceleration = 4.0;
  const maxSpeed = 10.0;

  let playerX = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
  const playerY = CANVAS_HEIGHT;
  let playerVelocityX = 0;
  let score = 0;
  let bestScore = Number(localStorage.getItem('bestScore')) || 0;
  let alive = true;
  let facingLeft = false;

  const snailImage = new Image();
  snailImage.src = 'assets/snail-default.png';

  const birdImage = new Image();
  birdImage.src = 'assets/bird1.png';
  const birdImage2 = new Image();
  birdImage2.src = 'assets/bird2.png';

  const enemies = [];
  let animationId;
  let lastSpawnTime = Date.now();

  let isLeftPressed = false;
  let isRightPressed = false;

  let dashReady = true;
  let dashActive = false;
  let shieldReady = true;
  let shieldActive = false;
  const dashCooldown = 10000;
  const shieldCooldown = 30000;
  const dashDuration = 200;
  const shieldDuration = 1000;

  function spawnEnemy() {
    const enemyFallSpeed = Math.min(baseEnemyFallSpeed + score * 0.05, maxEnemyFallSpeed);
    let enemy;
    if (score > 20 && score % 10 === 0) {
      enemy = {
        x: Math.random() * (CANVAS_WIDTH - ENEMY_SPECIAL_SIZE) - (0.5 * ENEMY_SPECIAL_SIZE),
        y: 0,
        width: ENEMY_SPECIAL_SIZE,
        height: ENEMY_SPECIAL_SIZE,
        velocityY: enemyFallSpeed,
        image: birdImage2
      };
    } else {
      enemy = {
        x: Math.random() * (CANVAS_WIDTH - ENEMY_DEFAULT_WIDTH) - (0.5 * ENEMY_DEFAULT_WIDTH),
        y: 0,
        width: ENEMY_DEFAULT_WIDTH,
        height: ENEMY_DEFAULT_HEIGHT,
        velocityY: enemyFallSpeed,
        image: birdImage
      };
    }
    enemies.push(enemy);
  }

  function updateEnemies() {
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      enemy.y += enemy.velocityY;
      if (enemy.y > CANVAS_HEIGHT) {
        enemies.splice(i, 1);
        i--;
        score++;
      }
      if (
        alive &&
        !shieldActive &&
        checkCollision(
          playerX,
          playerY - PLAYER_HEIGHT,
          PLAYER_WIDTH,
          PLAYER_HEIGHT,
          enemy.x,
          enemy.y,
          enemy.width,
          enemy.height
        )
      ) {
        alive = false;
        gameOver();
        return;
      }
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
    if (playerX < 0) {
      playerX = 0;
    } else if (playerX > CANVAS_WIDTH - PLAYER_WIDTH) {
      playerX = CANVAS_WIDTH - PLAYER_WIDTH;
    }
  }

  function updatePlayerVelocity() {
    if (!alive) {
      playerVelocityX = 0;
      return;
    }
    if (isLeftPressed && !isRightPressed) {
      playerVelocityX = -acceleration;
      facingLeft = true;
    } else if (!isLeftPressed && isRightPressed) {
      playerVelocityX = acceleration;
      facingLeft = false;
    } else {
      playerVelocityX = 0;
    }
    playerVelocityX = Math.max(-maxSpeed, Math.min(maxSpeed, playerVelocityX));
  }

  function gameOver() {
    cancelAnimationFrame(animationId);
    const gameOverElement = document.getElementById('gameOver');
    gameOverElement.style.display = 'block';
    const scoreElement = document.getElementById('score');
    scoreElement.innerHTML = 'Score: ' + score;
    bestScore = Math.max(bestScore, score);
    localStorage.setItem('bestScore', bestScore);
  }

  function resetGame() {
    playerX = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    playerVelocityX = 0;
    enemies.length = 0;
    score = 0;
    alive = true;
    lastSpawnTime = Date.now();
    const gameOverElement = document.getElementById('gameOver');
    gameOverElement.style.display = 'none';
    animationId = requestAnimationFrame(draw);
  }

  function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = 'white';
    ctx.font = '42px Warmonger';
    ctx.fillText('' + score, 10, 45);
    let now = Date.now();
    let spawnDelay = Math.max(170, 400 - score * 1.9);
    if (now - lastSpawnTime > spawnDelay) {
      spawnEnemy();
      lastSpawnTime = now;
    }
    if (alive) {
      for (const enemy of enemies) {
        ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
      }
      if (facingLeft) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(snailImage, -playerX - PLAYER_WIDTH, playerY - PLAYER_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT);
        ctx.restore();
      } else {
        ctx.drawImage(snailImage, playerX, playerY - PLAYER_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT);
      }
      if (shieldActive) {
        ctx.beginPath();
        ctx.arc(playerX + PLAYER_WIDTH / 2, playerY - PLAYER_HEIGHT / 2, PLAYER_WIDTH, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      updatePlayerPosition();
      updateEnemies();
      animationId = requestAnimationFrame(draw);
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      isLeftPressed = true;
    } else if (event.key === 'ArrowRight') {
      isRightPressed = true;
    } else if (event.code === 'KeyZ' && dashReady) {
      dashReady = false;
      const dashDistance = 100;
      if (isLeftPressed) {
        playerX -= dashDistance;
      } else if (isRightPressed) {
        playerX += dashDistance;
      } else {
        playerX += dashDistance;
      }
      if (playerX < 0) playerX = 0;
      if (playerX > CANVAS_WIDTH - PLAYER_WIDTH) playerX = CANVAS_WIDTH - PLAYER_WIDTH;
      dashActive = true;
      setTimeout(() => { dashActive = false; }, dashDuration);
      setTimeout(() => { dashReady = true; }, dashCooldown);
    } else if (event.code === 'KeyX' && shieldReady) {
      shieldReady = false;
      shieldActive = true;
      setTimeout(() => { shieldActive = false; }, shieldDuration);
      setTimeout(() => { shieldReady = true; }, shieldCooldown);
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

  animationId = requestAnimationFrame(draw);
})();
