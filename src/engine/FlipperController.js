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
      this.flippers.left.active = false;
      this.flippers.right.active = false;
    }
  }

  update() {
    ['left', 'right'].forEach((side) => {
      const f = this.flippers[side];
      if (!f) return;

      const sign = f.isLeft ? 1 : -1;
      const rest = FLIPPER_CONFIG.restAngle * sign;
      const active = FLIPPER_CONFIG.activeAngle * sign;
      const target = f.active ? active : rest;
      const current = f.body.angle;

      // Faster snap up, slower return down
      const speed = f.active ? FLIPPER_CONFIG.speed : FLIPPER_CONFIG.speed * 0.6;
      const diff = target - current;

      let newAngle;
      if (Math.abs(diff) < 0.01) {
        newAngle = target;
      } else {
        newAngle = current + diff * speed;
      }

      // Clamp to valid range
      const minA = Math.min(rest, active);
      const maxA = Math.max(rest, active);
      newAngle = Math.max(minA, Math.min(maxA, newAngle));

      // Set both angle and angular velocity for proper energy transfer to ball
      const angVel = newAngle - current;
      Body.setAngularVelocity(f.body, angVel);
      Body.setAngle(f.body, newAngle);
    });
  }
}
