import { TABLE } from '../data/tableLayout.js';
import { COLORS, TABLE_WIDTH, TABLE_HEIGHT, BUMPER_CONFIG } from '../utils/constants.js';

export function renderTable(ctx, tableElements, gameState) {
  const { phase } = gameState;
  const isFrenzy = phase === 'frenzy';

  // Background
  ctx.fillStyle = COLORS.SURFACE;
  ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

  // Playing field background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, TABLE_HEIGHT);
  grad.addColorStop(0, '#16213E');
  grad.addColorStop(0.5, '#1A1A2E');
  grad.addColorStop(1, '#0F0F1A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

  // Grid pattern (subtle dungeon floor)
  ctx.strokeStyle = 'rgba(139, 115, 85, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < TABLE_WIDTH; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, TABLE_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < TABLE_HEIGHT; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(TABLE_WIDTH, y);
    ctx.stroke();
  }

  // Walls
  renderWalls(ctx, tableElements.walls);

  // Ramps
  renderRamps(ctx, tableElements.ramps);

  // Slingshots
  renderSlingshots(ctx, tableElements.slingshots);

  // COMBO lanes
  renderComboLanes(ctx, tableElements.comboLanes, gameState.comboLetters);

  // Bumpers
  renderBumpers(ctx, tableElements.bumpers, isFrenzy, gameState.bumperFlash);

  // Boss targets
  renderBossTargets(ctx, tableElements.bossTargets, gameState);

  // Outlanes
  renderOutlanes(ctx, tableElements.outlanes, gameState.kickbackActive);

  // Spinner
  renderSpinner(ctx, tableElements.spinner);

  // Drain area
  renderDrain(ctx, gameState.shieldActive);

  // Plunger lane
  renderPlungerLane(ctx, gameState.plungerCharge);

  // Frenzy overlay
  if (isFrenzy) {
    renderFrenzyOverlay(ctx);
  }
}

function renderWalls(ctx, walls) {
  ctx.fillStyle = COLORS.BORDER;
  walls.forEach((wall) => {
    const { position, angle } = wall;
    const w = wall.bounds.max.x - wall.bounds.min.x;
    const h = wall.bounds.max.y - wall.bounds.min.y;
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(angle);

    // Stone texture effect
    ctx.fillStyle = '#6B5B45';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2);

    // Rune-like details on longer walls
    if (w > 50 || h > 50) {
      ctx.strokeStyle = 'rgba(155, 89, 182, 0.3)';
      ctx.lineWidth = 1;
      const len = Math.max(w, h);
      for (let i = 10; i < len - 10; i += 25) {
        ctx.beginPath();
        if (w > h) {
          ctx.arc(-w / 2 + i, 0, 3, 0, Math.PI * 2);
        } else {
          ctx.arc(0, -h / 2 + i, 3, 0, Math.PI * 2);
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  });
}

function renderBumpers(ctx, bumpers, isFrenzy, bumperFlash) {
  bumpers.forEach((bumper, i) => {
    const { x, y } = bumper.position;
    const r = BUMPER_CONFIG.radius;
    const isActive = bumper.plugin?.isActive;
    const flashing = bumperFlash?.[i] > 0;

    // Outer glow
    const glowColor = isActive ? COLORS.FIRE : COLORS.EMERALD;
    ctx.beginPath();
    ctx.arc(x, y, r + 6, 0, Math.PI * 2);
    ctx.fillStyle = flashing
      ? 'rgba(255, 255, 255, 0.4)'
      : `${glowColor}33`;
    ctx.fill();

    // Main body
    const gradient = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, r);
    if (isActive || isFrenzy) {
      gradient.addColorStop(0, '#FF6B6B');
      gradient.addColorStop(0.7, COLORS.FIRE);
      gradient.addColorStop(1, '#8B0000');
    } else {
      gradient.addColorStop(0, '#5DFFBA');
      gradient.addColorStop(0.7, COLORS.EMERALD);
      gradient.addColorStop(1, '#1A6B3C');
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Gem/skull highlight
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    // Skull face on bumper
    ctx.fillStyle = isActive ? '#FFD700' : '#FFFFFF';
    ctx.font = `${r * 0.9}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isActive ? '\u{1F525}' : '\u{1F48E}', x + 1, y + 1);
  });
}

function renderBossTargets(ctx, targets, gameState) {
  const hasBoss = gameState.phase === 'boss_fight';
  targets.forEach((target, i) => {
    const { x, y } = target.position;
    const w = 30;
    const h = 15;
    const isLit = hasBoss && !gameState.targetsHit?.[i];

    // Target background
    ctx.fillStyle = isLit ? COLORS.GOLD : '#333';
    ctx.fillRect(x - w / 2, y - h / 2, w, h);

    // Border
    ctx.strokeStyle = isLit ? COLORS.FIRE : '#555';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);

    // Glow if lit
    if (isLit) {
      ctx.shadowColor = COLORS.GOLD;
      ctx.shadowBlur = 10;
      ctx.fillStyle = COLORS.GOLD;
      ctx.fillRect(x - w / 2, y - h / 2, w, h);
      ctx.shadowBlur = 0;
    }

    // Shield icon
    ctx.fillStyle = isLit ? '#000' : '#666';
    ctx.font = '10px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u{1F6E1}', x, y);
  });
}

function renderComboLanes(ctx, lanes, comboLetters) {
  const letters = ['C', 'O', 'M', 'B', 'O'];
  lanes.forEach((lane, i) => {
    const { x, y } = lane.position;
    const isLit = comboLetters?.[i];

    // Lane background
    ctx.fillStyle = isLit ? COLORS.ARCANE : '#222';
    ctx.fillRect(x - 9, y - 15, 18, 30);

    // Border
    ctx.strokeStyle = isLit ? COLORS.GOLD : '#444';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 9, y - 15, 18, 30);

    // Glow if lit
    if (isLit) {
      ctx.shadowColor = COLORS.ARCANE;
      ctx.shadowBlur = 8;
      ctx.fillStyle = COLORS.ARCANE;
      ctx.fillRect(x - 9, y - 15, 18, 30);
      ctx.shadowBlur = 0;
    }

    // Letter
    ctx.fillStyle = isLit ? COLORS.GOLD : '#666';
    ctx.font = 'bold 12px "Rajdhani", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letters[i], x, y);
  });
}

function renderSlingshots(ctx, slingshots) {
  slingshots.forEach((sling) => {
    if (!sling.vertices) return;
    ctx.beginPath();
    ctx.moveTo(sling.vertices[0].x, sling.vertices[0].y);
    for (let i = 1; i < sling.vertices.length; i++) {
      ctx.lineTo(sling.vertices[i].x, sling.vertices[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = '#4A3728';
    ctx.fill();
    ctx.strokeStyle = COLORS.BORDER;
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function renderRamps(ctx, ramps) {
  ramps.forEach((ramp) => {
    const { x, y } = ramp.position;
    const w = 30;
    const h = 200;

    // Ramp visual
    const grad = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2);
    grad.addColorStop(0, 'rgba(52, 152, 219, 0.3)');
    grad.addColorStop(1, 'rgba(52, 152, 219, 0.1)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - w / 2, y - h / 2, w, h);

    // Ramp border
    ctx.strokeStyle = COLORS.ICE;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);
    ctx.setLineDash([]);

    // Arrow indicators
    ctx.fillStyle = COLORS.ICE;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    for (let ay = y - h / 2 + 30; ay < y + h / 2 - 10; ay += 40) {
      ctx.fillText('\u25B2', x, ay);
    }
  });
}

function renderOutlanes(ctx, outlanes, kickbackActive) {
  outlanes.forEach((outlane) => {
    const { x, y } = outlane.position;
    const side = outlane.label.includes('left') ? 'left' : 'right';
    const hasKickback = kickbackActive?.[side];

    // Danger zone
    ctx.fillStyle = hasKickback
      ? 'rgba(52, 152, 219, 0.3)'
      : 'rgba(231, 76, 60, 0.2)';
    ctx.fillRect(x - 10, y - 20, 20, 40);

    if (hasKickback) {
      ctx.strokeStyle = COLORS.ICE;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 10, y - 20, 20, 40);
      ctx.fillStyle = COLORS.ICE;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u{1F3F0}', x, y);
    }
  });
}

function renderSpinner(ctx, spinner) {
  if (!spinner) return;
  const { x, y } = spinner.position;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((Date.now() / 200) % (Math.PI * 2));

  ctx.fillStyle = COLORS.BORDER;
  ctx.fillRect(-20, -3, 40, 6);
  ctx.strokeStyle = COLORS.GOLD;
  ctx.lineWidth = 1;
  ctx.strokeRect(-20, -3, 40, 6);
  ctx.restore();
}

function renderDrain(ctx, shieldActive) {
  const d = TABLE.drain;

  // Drain glow
  ctx.fillStyle = shieldActive
    ? 'rgba(52, 152, 219, 0.3)'
    : 'rgba(192, 57, 43, 0.3)';
  ctx.fillRect(d.x - d.w / 2, d.y - 5, d.w, 10);

  if (shieldActive) {
    // Shield bar
    ctx.fillStyle = COLORS.ICE;
    ctx.fillRect(d.x - d.w / 2, d.y - 17, d.w, 4);
    ctx.shadowColor = COLORS.ICE;
    ctx.shadowBlur = 10;
    ctx.fillRect(d.x - d.w / 2, d.y - 17, d.w, 4);
    ctx.shadowBlur = 0;
  }

  // Skull icon
  ctx.fillStyle = '#666';
  ctx.font = '14px serif';
  ctx.textAlign = 'center';
  ctx.fillText('\u{1F480}', d.x, d.y + 15);
}

function renderPlungerLane(ctx, charge) {
  const pl = TABLE.plunger;
  const laneX = TABLE_WIDTH - TABLE.plungerLaneWidth;

  // Lane background
  ctx.fillStyle = 'rgba(22, 33, 62, 0.8)';
  ctx.fillRect(laneX, 0, TABLE.plungerLaneWidth, TABLE_HEIGHT);

  // Plunger
  const maxPull = 50;
  const pullDist = (charge || 0) * maxPull;

  ctx.fillStyle = COLORS.BORDER;
  ctx.fillRect(pl.x - 8, pl.y + pullDist, 16, 20);

  // Plunger spring
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  for (let sy = pl.y + pullDist + 20; sy < TABLE_HEIGHT - 10; sy += 8) {
    ctx.beginPath();
    ctx.moveTo(pl.x - 6, sy);
    ctx.lineTo(pl.x + 6, sy + 4);
    ctx.stroke();
  }

  // Charge indicator
  if (charge > 0) {
    const barH = pullDist;
    ctx.fillStyle = `hsl(${(1 - charge) * 120}, 100%, 50%)`;
    ctx.fillRect(pl.x - 12, pl.y + 25, 24, barH);
  }
}

function renderFrenzyOverlay(ctx) {
  const t = Date.now() / 100;
  const alpha = 0.05 + Math.sin(t) * 0.03;

  // Shifting color overlay
  const hue = (t * 10) % 360;
  ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
  ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

  // Border glow
  ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.5)`;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, TABLE_WIDTH - 4, TABLE_HEIGHT - 4);
}
