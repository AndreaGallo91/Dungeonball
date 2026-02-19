import { COLORS, TABLE_WIDTH } from '../utils/constants.js';

export function renderBoss(ctx, boss, hp, maxHp, animTime) {
  if (!boss) return;

  const centerX = TABLE_WIDTH / 2 - 15; // Offset from plunger lane
  const y = 35;

  // Boss glow
  const pulse = Math.sin(animTime / 300) * 0.2 + 0.8;
  ctx.beginPath();
  ctx.arc(centerX, y, 30, 0, Math.PI * 2);
  ctx.fillStyle = `${boss.color}${Math.floor(pulse * 40).toString(16).padStart(2, '0')}`;
  ctx.fill();

  // Boss emoji
  ctx.font = '32px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(boss.emoji, centerX, y);

  // Boss name
  ctx.fillStyle = COLORS.GOLD;
  ctx.font = 'bold 10px "Rajdhani", sans-serif';
  ctx.fillText(boss.name, centerX, y + 28);

  // HP Bar
  const barW = 80;
  const barH = 6;
  const barX = centerX - barW / 2;
  const barY = y + 36;

  // Background
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, barY, barW, barH);

  // HP fill
  const hpPct = hp / maxHp;
  const hpColor =
    hpPct > 0.5 ? COLORS.EMERALD : hpPct > 0.25 ? COLORS.SCORE : COLORS.FIRE;
  ctx.fillStyle = hpColor;
  ctx.fillRect(barX, barY, barW * hpPct, barH);

  // Border
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barH);

  // HP text
  ctx.fillStyle = '#FFF';
  ctx.font = '8px "Rajdhani", sans-serif';
  ctx.fillText(`${hp}/${maxHp}`, centerX, barY + barH + 8);
}
