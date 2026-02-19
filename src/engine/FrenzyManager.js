import { FRENZY_DURATION } from '../utils/constants.js';

export class FrenzyManager {
  constructor(onEvent) {
    this.onEvent = onEvent;
    this.active = false;
    this.endTime = 0;
  }

  start() {
    this.active = true;
    this.endTime = Date.now() + FRENZY_DURATION;
    this.onEvent({ type: 'frenzyStart' });
  }

  update(now) {
    if (this.active && now >= this.endTime) {
      this.active = false;
      this.onEvent({ type: 'frenzyEnd' });
    }
  }

  isActive() {
    return this.active;
  }

  getTimeLeft() {
    if (!this.active) return 0;
    return Math.max(0, this.endTime - Date.now());
  }

  reset() {
    this.active = false;
    this.endTime = 0;
  }
}
