export function renderSpawnedPowerUp(ctx, spawned) {
  if (!spawned) return;

  const { x, y, powerUp, spawnTime } = spawned;
  const elapsed = Date.now() - spawnTime;
  const pulse = Math.sin(elapsed / 200) * 0.2 + 1;
  const bobY = y + Math.sin(elapsed / 300) * 3;

  // Outer glow
  ctx.beginPath();
  ctx.arc(x, bobY, 18 * pulse, 0, Math.PI * 2);
  ctx.fillStyle = `${powerUp.color}33`;
  ctx.fill();

  // Inner orb
  const grad = ctx.createRadialGradient(x, bobY, 2, x, bobY, 14);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.5, powerUp.color);
  grad.addColorStop(1, `${powerUp.color}88`);
  ctx.beginPath();
  ctx.arc(x, bobY, 14, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Icon
  ctx.font = '14px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(powerUp.icon, x, bobY);
}
