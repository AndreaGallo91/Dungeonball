import { COLORS, FLIPPER_CONFIG } from '../utils/constants.js';

export function renderFlippers(ctx, flippers) {
  ['left', 'right'].forEach((side) => {
    const f = flippers[side];
    if (!f) return;

    const body = f.body;
    const verts = body.vertices;

    ctx.save();

    // Flipper body
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) {
      ctx.lineTo(verts[i].x, verts[i].y);
    }
    ctx.closePath();

    // Gradient
    const grad = ctx.createLinearGradient(
      body.position.x - 30,
      body.position.y,
      body.position.x + 30,
      body.position.y
    );
    grad.addColorStop(0, '#A0845C');
    grad.addColorStop(0.5, COLORS.BORDER);
    grad.addColorStop(1, '#6B5B45');
    ctx.fillStyle = grad;
    ctx.fill();

    // Border
    ctx.strokeStyle = '#D4A96A';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pivot point
    ctx.beginPath();
    ctx.arc(f.pivot.x, f.pivot.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.GOLD;
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  });
}
