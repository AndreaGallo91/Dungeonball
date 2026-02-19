import {
  STREAK_MULTIPLIERS,
  STREAK_TIMEOUT,
  COMBO_BONUSES,
} from '../utils/constants.js';

export class ComboTracker {
  constructor(onEvent) {
    this.onEvent = onEvent;
    this.comboLetters = [false, false, false, false, false]; // C-O-M-B-O
    this.comboCount = 0;
    this.streakCount = 0;
    this.lastHitTime = 0;
    this.multiplier = 1;
  }

  hitLane(laneIndex) {
    if (this.comboLetters[laneIndex]) return;
    this.comboLetters[laneIndex] = true;
    this.onEvent({
      type: 'comboLetterLit',
      laneIndex,
      letters: [...this.comboLetters],
    });

    if (this.comboLetters.every(Boolean)) {
      this._completeCombo();
    }
  }

  _completeCombo() {
    const bonus =
      this.comboCount < COMBO_BONUSES.length
        ? COMBO_BONUSES[this.comboCount]
        : COMBO_BONUSES[COMBO_BONUSES.length - 1] + this.comboCount * 10000;

    this.comboCount++;
    this.comboLetters = [false, false, false, false, false];

    this.onEvent({
      type: 'comboComplete',
      comboCount: this.comboCount,
      bonus,
    });
  }

  registerHit(now) {
    if (now - this.lastHitTime < STREAK_TIMEOUT) {
      this.streakCount++;
    } else {
      this.streakCount = 1;
    }
    this.lastHitTime = now;
    this._updateMultiplier();
  }

  _updateMultiplier() {
    let mult = 1;
    for (const s of STREAK_MULTIPLIERS) {
      if (this.streakCount >= s.hits) {
        mult = s.mult;
        break;
      }
    }
    if (mult !== this.multiplier) {
      this.multiplier = mult;
      this.onEvent({
        type: 'multiplierChanged',
        multiplier: mult,
        streakCount: this.streakCount,
      });
    }
  }

  update(now) {
    if (
      this.streakCount > 0 &&
      now - this.lastHitTime > STREAK_TIMEOUT
    ) {
      this.streakCount = 0;
      this.multiplier = 1;
      this.onEvent({ type: 'multiplierChanged', multiplier: 1, streakCount: 0 });
    }
  }

  getMultiplier() {
    return this.multiplier;
  }

  reset() {
    this.comboLetters = [false, false, false, false, false];
    this.comboCount = 0;
    this.streakCount = 0;
    this.lastHitTime = 0;
    this.multiplier = 1;
  }
}
