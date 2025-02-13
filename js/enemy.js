import { 
  ENEMY_SPECIAL_SIZE, 
  ENEMY_DEFAULT_WIDTH, 
  ENEMY_DEFAULT_HEIGHT, 
  BASE_ENEMY_FALL_SPEED, 
  MAX_ENEMY_FALL_SPEED 
} from './constants.js';

export let enemies = [];

// Module-level flag to track if the last enemy spawned was special.
let lastEnemyWasSpecial = false;

export function spawnEnemy(score, canvasWidth) {
  const enemyFallSpeed = Math.min(
    BASE_ENEMY_FALL_SPEED + Math.log(score / 10 + 1) * 2, MAX_ENEMY_FALL_SPEED
  );
  
  let enemy;
  
  // Only spawn a special enemy if the score qualifies and the previous enemy wasn't special.
  if (score > 20 && score % 10 === 0 && !lastEnemyWasSpecial) {
    enemy = {
      x: Math.random() * (canvasWidth - ENEMY_SPECIAL_SIZE) - (0.5 * ENEMY_SPECIAL_SIZE),
      y: 0,
      width: ENEMY_SPECIAL_SIZE,
      height: ENEMY_SPECIAL_SIZE,
      velocityY: enemyFallSpeed,
      imageType: 'special'
    };

    // Swoop effect: move horizontally toward the center.
    enemy.velocityX = enemy.x < canvasWidth / 2 ? enemyFallSpeed / 6 : -enemyFallSpeed / 6;
    
    // Mark that the last enemy was special.
    lastEnemyWasSpecial = true;
  } else {
    enemy = {
      x: Math.random() * (canvasWidth - ENEMY_DEFAULT_WIDTH) - (0.5 * ENEMY_DEFAULT_WIDTH),
      y: 0,
      width: ENEMY_DEFAULT_WIDTH,
      height: ENEMY_DEFAULT_HEIGHT,
      velocityY: enemyFallSpeed,
      imageType: 'default'
    };
    
    // Reset the flag when spawning a default enemy.
    lastEnemyWasSpecial = false;
  }
  
  enemies.push(enemy);
}

export function updateEnemyPositions(canvasHeight, dt) {
  let removedCount = 0;
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    enemy.y += enemy.velocityY * dt;
    if (enemy.velocityX) {
      enemy.x += enemy.velocityX * dt;
    }
    if (enemy.y > canvasHeight) {
      enemies.splice(i, 1);
      i--;
      removedCount++;
    }
  }
  return removedCount;
}

export function resetEnemies() {
  enemies = [];
}

export function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2, tolerance) {
  return (
    x1 + tolerance < x2 + w2 &&
    x1 + w1 - tolerance > x2 &&
    y1 + tolerance < y2 + h2 &&
    y1 + h1 - tolerance > y2
  );
}
