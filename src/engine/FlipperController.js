import Matter from 'matter-js';
import { FLIPPER_CONFIG } from '../utils/constants.js';

const { Body } = Matter;

export class FlipperController {
  constructor(engine, flippers) {
    this.engine = engine;
    this.flippers = flippers;
    this.disabled = false;
  }

  setActive(side, active) {
    if (this.disabled) return;
    if (this.flippers[side]) {
      this.flippers[side].active = active;
    }
  }

  setDisabled(disabled) {
    this.disabled = disabled;
    if (disabled) {
      // Force both flippers to rest
      this.flippers.left.active = false;
      this.flippers.right.active = false;
    }
  }

  update() {
    ['left', 'right'].forEach((side) => {
      const f = this.flippers[side];
      if (!f) return;

      const targetAngle = f.active
        ? FLIPPER_CONFIG.activeAngle
        : FLIPPER_CONFIG.restAngle;
      const sign = f.isLeft ? 1 : -1;
      const target = targetAngle * sign;

      const currentAngle = f.body.angle;
      const diff = target - currentAngle;

      if (Math.abs(diff) > 0.02) {
        const speed = f.active
          ? FLIPPER_CONFIG.angularSpeed
          : FLIPPER_CONFIG.angularSpeed * 0.6;
        const direction = diff > 0 ? 1 : -1;
        Body.setAngularVelocity(f.body, direction * speed);
      } else {
        Body.setAngularVelocity(f.body, 0);
        Body.setAngle(f.body, target);
      }
    });
  }
}
