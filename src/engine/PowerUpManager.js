import { getRandomPowerUp } from '../data/powerups.js';
import {
  POWERUP_SPAWN_INTERVAL,
  POWERUP_VISIBLE_DURATION,
  MAX_HP,
} from '../utils/constants.js';
import { TABLE } from '../data/tableLayout.js';
import { randomRange, randomInt } from '../utils/mathHelpers.js';

export class PowerUpManager {
  constructor(onEvent) {
    this.onEvent = onEvent;
    this.spawnedPowerUp = null; // { powerUp, x, y, spawnTime }
    this.activePowerUp = null; // { powerUp, endTime }
    this.nextSpawnTime = 0;
    this.kickbackActive = { left: false, right: false };
  }

  init() {
    this.scheduleNextSpawn();
  }

  scheduleNextSpawn(isBossFight = false) {
    const delay = isBossFight
      ? 15000
      : randomRange(POWERUP_SPAWN_INTERVAL[0], POWERUP_SPAWN_INTERVAL[1]);
    this.nextSpawnTime = Date.now() + delay;
  }

  update(now, isFrenzy, isBossFight) {
    // Don't spawn during frenzy
    if (isFrenzy) return;

    // Check if spawned power-up expired
    if (this.spawnedPowerUp) {
      if (now - this.spawnedPowerUp.spawnTime > POWERUP_VISIBLE_DURATION) {
        this.spawnedPowerUp = null;
        this.onEvent({ type: 'powerUpExpired' });
        this.scheduleNextSpawn(isBossFight);
      }
    }

    // Check if active power-up expired
    if (this.activePowerUp && !this.activePowerUp.powerUp.instant) {
      if (now >= this.activePowerUp.endTime) {
        const expired = this.activePowerUp;
        this.activePowerUp = null;
        this.onEvent({ type: 'powerUpDeactivated', powerUp: expired.powerUp });
      }
    }

    // Spawn new power-up
    if (!this.spawnedPowerUp && now >= this.nextSpawnTime) {
      this._spawn();
    }
  }

  _spawn() {
    const spots = TABLE.powerUpSpawns;
    const spot = spots[randomInt(0, spots.length - 1)];
    const powerUp = getRandomPowerUp();
    this.spawnedPowerUp = {
      powerUp,
      x: spot.x,
      y: spot.y,
      spawnTime: Date.now(),
    };
    this.onEvent({ type: 'powerUpSpawned', powerUp, x: spot.x, y: spot.y });
  }

  collect(hp) {
    if (!this.spawnedPowerUp) return null;
    const { powerUp } = this.spawnedPowerUp;
    this.spawnedPowerUp = null;

    if (powerUp.instant) {
      if (powerUp.id === 'heal') {
        const newHp = Math.min(hp + 1, MAX_HP);
        this.onEvent({ type: 'powerUpCollected', powerUp, newHp });
        return { powerUp, newHp };
      }
      if (powerUp.id === 'kickback') {
        this.kickbackActive = { left: true, right: true };
        this.onEvent({ type: 'powerUpCollected', powerUp, kickback: true });
        return { powerUp, kickback: true };
      }
    }

    // Deactivate previous non-instant power-up
    if (this.activePowerUp) {
      this.onEvent({
        type: 'powerUpDeactivated',
        powerUp: this.activePowerUp.powerUp,
      });
    }

    this.activePowerUp = {
      powerUp,
      endTime: Date.now() + powerUp.duration,
    };
    this.onEvent({ type: 'powerUpCollected', powerUp });
    this.scheduleNextSpawn();
    return { powerUp };
  }

  useKickback(side) {
    if (this.kickbackActive[side]) {
      this.kickbackActive[side] = false;
      this.onEvent({ type: 'kickbackUsed', side });
      return true;
    }
    return false;
  }

  isActive(id) {
    return this.activePowerUp?.powerUp.id === id;
  }

  getActive() {
    return this.activePowerUp;
  }

  getSpawned() {
    return this.spawnedPowerUp;
  }

  reset() {
    this.spawnedPowerUp = null;
    this.activePowerUp = null;
    this.kickbackActive = { left: false, right: false };
    this.nextSpawnTime = 0;
    this.scheduleNextSpawn();
  }
}
