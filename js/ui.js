export function drawIconWithRecharge(ctx, x, y, icon, progress, iconWidth, iconHeight) {
  let centerX = x + iconWidth / 2;
  let centerY = y + iconHeight / 2;
  let radius = Math.max(iconWidth, iconHeight) / 2 + 12;
  ctx.beginPath();
  ctx.arc(centerX - 1, centerY, radius, -Math.PI / 2, -Math.PI / 2 + progress * 2 * Math.PI, false);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "lightgray";
  ctx.stroke();
  ctx.drawImage(icon, x, y, iconWidth, iconHeight);
}

export function drawScore(ctx, score) {
  ctx.fillStyle = 'white';
  ctx.font = '42px Warmonger';
  ctx.fillText('' + score, 10, 45);
}
