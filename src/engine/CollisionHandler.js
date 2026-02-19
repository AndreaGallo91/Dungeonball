import Matter from 'matter-js';
import { POINTS } from '../utils/constants.js';

const { Body } = Matter;

export class CollisionHandler {
  constructor(tableElements, onEvent) {
    this.elements = tableElements;
    this.onEvent = onEvent;
    this.spinnerHitTime = 0;
  }

  handle(event, ballManager) {
    const pairs = event.pairs;

    for (const pair of pairs) {
      const { bodyA, bodyB } = pair;

      // Determine which is the ball
      let ball, other;
      if (bodyA.label === 'ball') {
        ball = bodyA;
        other = bodyB;
      } else if (bodyB.label === 'ball') {
        ball = bodyB;
        other = bodyA;
      } else {
        continue;
      }

      this._handleCollision(ball, other, ballManager);
    }
  }

  _handleCollision(ball, other, ballManager) {
    const label = other.label;

    // Bumper hit
    if (label.startsWith('bumper_')) {
      const isActive = other.plugin?.isActive;
      const points = isActive ? POINTS.BUMPER_ACTIVE : POINTS.BUMPER;
      // Apply impulse away from bumper
      const dx = ball.position.x - other.position.x;
      const dy = ball.position.y - other.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = 0.008;
      Body.applyForce(ball, ball.position, {
        x: (dx / dist) * force,
        y: (dy / dist) * force,
      });
      this.onEvent({
        type: 'bumperHit',
        points,
        x: other.position.x,
        y: other.position.y,
        bumperIndex: other.plugin?.bumperIndex,
        isActive,
      });
    }

    // Boss target
    if (label.startsWith('boss_target_')) {
      this.onEvent({
        type: 'bossTargetHit',
        points: POINTS.BOSS_TARGET,
        x: other.position.x,
        y: other.position.y,
        targetIndex: other.plugin?.targetIndex,
      });
    }

    // Combo lane
    if (label.startsWith('combo_')) {
      this.onEvent({
        type: 'comboLaneHit',
        laneIndex: other.plugin?.laneIndex,
        x: other.position.x,
        y: other.position.y,
      });
    }

    // Slingshot
    if (label.startsWith('slingshot_')) {
      const dx = ball.position.x - other.position.x;
      const dy = ball.position.y - other.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      Body.applyForce(ball, ball.position, {
        x: (dx / dist) * 0.006,
        y: (dy / dist) * 0.006,
      });
      this.onEvent({
        type: 'slingshotHit',
        points: POINTS.SLINGSHOT,
        x: other.position.x,
        y: other.position.y,
      });
    }

    // Spinner
    if (label === 'spinner') {
      const now = Date.now();
      if (now - this.spinnerHitTime > 100) {
        this.spinnerHitTime = now;
        this.onEvent({
          type: 'spinnerHit',
          points: POINTS.SPINNER,
          x: other.position.x,
          y: other.position.y,
        });
      }
    }

    // Ramp
    if (label.startsWith('ramp_')) {
      this.onEvent({
        type: 'rampHit',
        points: POINTS.RAMP,
        x: other.position.x,
        y: other.position.y,
        side: label.includes('left') ? 'left' : 'right',
      });
    }

    // Drain
    if (label === 'drain') {
      // The BallManager handles drain detection by position
    }

    // Outlane
    if (label.startsWith('outlane_')) {
      const side = label.includes('left') ? 'left' : 'right';
      this.onEvent({
        type: 'outlaneHit',
        side,
        x: other.position.x,
        y: other.position.y,
      });
    }

    // Shield
    if (label === 'shield') {
      this.onEvent({ type: 'shieldBounce' });
    }
  }
}
