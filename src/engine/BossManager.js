import { getBoss } from '../data/bosses.js';
import { BOSS_SPAWN_SCORE_THRESHOLD, BOSS_SPAWN_TIME_THRESHOLD } from '../utils/constants.js';

export class BossManager {
  constructor(onEvent) {
    this.onEvent = onEvent;
    this.currentBoss = null;
    this.bossHp = 0;
    this.bossMaxHp = 0;
    this.bossIndex = 0;
    this.bossesDefeated = 0;
    this.lastBossTime = 0;
    this.lastBossScore = 0;
    this.bossAttackTimer = 0;
    this.bossAttackInterval = 5000;
    this.targetsHit = [false, false, false];
  }

  shouldSpawnBoss(score, now) {
    if (this.currentBoss) return false;
    const scoreThreshold =
      this.lastBossScore + BOSS_SPAWN_SCORE_THRESHOLD * (this.bossIndex + 1);
    const timeThreshold = this.lastBossTime + BOSS_SPAWN_TIME_THRESHOLD;
    return score >= scoreThreshold || now >= timeThreshold;
  }

  spawnBoss() {
    this.currentBoss = getBoss(this.bossIndex);
    this.bossHp = this.currentBoss.hp;
    this.bossMaxHp = this.currentBoss.hp;
    this.bossAttackTimer = Date.now() + this.bossAttackInterval;
    this.targetsHit = [false, false, false];
    this.onEvent({ type: 'bossSpawn', boss: this.currentBoss });
    return this.currentBoss;
  }

  hitTarget(targetIndex) {
    if (!this.currentBoss) return;
    if (this.targetsHit[targetIndex]) return;

    this.targetsHit[targetIndex] = true;
    this.bossHp--;

    this.onEvent({
      type: 'bossHit',
      boss: this.currentBoss,
      hp: this.bossHp,
      maxHp: this.bossMaxHp,
      targetIndex,
    });

    if (this.bossHp <= 0) {
      this._defeatBoss();
    } else if (this.targetsHit.every(Boolean)) {
      // All 3 targets hit, reset them
      this.targetsHit = [false, false, false];
      this.onEvent({ type: 'bossTargetsReset' });
    }
  }

  _defeatBoss() {
    const boss = this.currentBoss;
    this.bossesDefeated++;
    this.bossIndex++;
    this.lastBossTime = Date.now();
    this.currentBoss = null;
    this.bossHp = 0;
    this.onEvent({
      type: 'bossDefeated',
      boss,
      bossesDefeated: this.bossesDefeated,
    });
  }

  checkBossAttack(now) {
    if (!this.currentBoss) return null;
    if (now >= this.bossAttackTimer && this.currentBoss.attack) {
      this.bossAttackTimer = now + this.bossAttackInterval;
      this.onEvent({
        type: 'bossAttack',
        attack: this.currentBoss.attack,
        boss: this.currentBoss,
      });
      return this.currentBoss.attack;
    }
    return null;
  }

  setLastBossScore(score) {
    this.lastBossScore = score;
  }

  reset() {
    this.currentBoss = null;
    this.bossHp = 0;
    this.bossMaxHp = 0;
    this.bossIndex = 0;
    this.bossesDefeated = 0;
    this.lastBossTime = Date.now();
    this.lastBossScore = 0;
    this.targetsHit = [false, false, false];
  }
}
