import { COLORS } from '../utils/constants.js';

const TRAIL_LENGTH = 8;

export class BallTrailRenderer {
  constructor() {
    this.trails = new Map(); // ballId -> [{x, y}]
  }

  update(balls) {
    const currentIds = new Set();
    balls.forEach((ball) => {
      const id = ball.id;
      currentIds.add(id);
      if (!this.trails.has(id)) {
        this.trails.set(id, []);
      }
      const trail = this.trails.get(id);
      trail.push({ x: ball.position.x, y: ball.position.y });
      if (trail.length > TRAIL_LENGTH) {
        trail.shift();
      }
    });
    // Clean up trails for removed balls
    for (const id of this.trails.keys()) {
      if (!currentIds.has(id)) {
        this.trails.delete(id);
      }
    }
  }

  render(ctx, balls, activePowerUp, isFrenzy) {
    const powerUpId = activePowerUp?.powerUp?.id;

    balls.forEach((ball) => {
      const { x, y } = ball.position;
      const r = ball.circleRadius || 8;

      // Trail
      const trail = this.trails.get(ball.id) || [];
      trail.forEach((pos, i) => {
        const alpha = (i / trail.length) * 0.4;
        const trailR = r * (0.3 + (i / trail.length) * 0.7);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, trailR, 0, Math.PI * 2);
        if (powerUpId === 'fireball') {
          ctx.fillStyle = `rgba(231, 76, 60, ${alpha})`;
        } else if (isFrenzy) {
          const hue = (Date.now() / 10 + i * 30) % 360;
          ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(236, 240, 241, ${alpha})`;
        }
        ctx.fill();
      });

      // Outer glow
      ctx.beginPath();
      ctx.arc(x, y, r + 4, 0, Math.PI * 2);
      if (powerUpId === 'fireball') {
        ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
      } else if (isFrenzy) {
        const hue = (Date.now() / 5) % 360;
        ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.3)`;
      } else {
        ctx.fillStyle = 'rgba(236, 240, 241, 0.2)';
      }
      ctx.fill();

      // Ball body
      const gradient = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, r);
      if (powerUpId === 'fireball') {
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FF6B35');
        gradient.addColorStop(1, '#E74C3C');
      } else if (powerUpId === 'giant') {
        gradient.addColorStop(0, '#E8A0FF');
        gradient.addColorStop(0.5, '#9B59B6');
        gradient.addColorStop(1, '#6C3483');
      } else if (isFrenzy) {
        const hue = (Date.now() / 5) % 360;
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.5, `hsl(${hue}, 100%, 60%)`);
        gradient.addColorStop(1, `hsl(${hue}, 100%, 40%)`);
      } else {
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.5, COLORS.GLOW);
        gradient.addColorStop(1, '#AAB7C4');
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Highlight
      ctx.beginPath();
      ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();
    });
  }
}
