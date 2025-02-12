// js/ui.js
import { ICON_SIZE, ICON_MARGIN } from './constants.js';

export function drawIconWithRecharge(ctx, x, y, icon, progress) {
  let centerX = x + ICON_SIZE / 2;
  let centerY = y + ICON_SIZE / 2;
  let radius = ICON_SIZE / 2 + 12;
  ctx.beginPath();
  ctx.arc(centerX - 1, centerY, radius, -Math.PI / 2, -Math.PI / 2 + progress * 2 * Math.PI, false);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "lightgray";
  ctx.stroke();
  ctx.drawImage(icon, centerX - ICON_SIZE / 2, centerY - ICON_SIZE / 2, ICON_SIZE, ICON_SIZE);
}

export function drawScore(ctx, score) {
  ctx.fillStyle = 'white';
  ctx.font = '42px Warmonger';
  ctx.fillText('' + score, 10, 45);
}
