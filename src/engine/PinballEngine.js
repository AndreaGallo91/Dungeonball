import Matter from 'matter-js';
import { TABLE_WIDTH, TABLE_HEIGHT, GRAVITY } from '../utils/constants.js';
import { TableBuilder } from './TableBuilder.js';
import { FlipperController } from './FlipperController.js';
import { BallManager } from './BallManager.js';
import { CollisionHandler } from './CollisionHandler.js';

const { Engine, World, Runner, Events } = Matter;

export class PinballEngine {
  constructor(onEvent) {
    this.onEvent = onEvent;
    this.engine = Engine.create({
      gravity: GRAVITY,
      enableSleeping: false,
    });
    this.world = this.engine.world;

    this.tableBuilder = new TableBuilder(this.world);
    this.tableElements = this.tableBuilder.build();

    this.flipperController = new FlipperController(
      this.engine,
      this.tableElements.flippers
    );

    this.ballManager = new BallManager(this.world, this.onEvent);

    this.collisionHandler = new CollisionHandler(
      this.tableElements,
      this.onEvent
    );

    Events.on(this.engine, 'collisionStart', (event) => {
      this.collisionHandler.handle(event, this.ballManager);
    });

    this.runner = null;
    this.lastTime = 0;
  }

  start() {
    this.lastTime = performance.now();
  }

  update(timestamp) {
    const delta = Math.min(timestamp - this.lastTime, 33);
    this.lastTime = timestamp;

    this.flipperController.update();
    Engine.update(this.engine, delta);

    // Check if any ball fell below table
    this.ballManager.checkDrain(TABLE_HEIGHT);
  }

  setFlipperState(side, active) {
    this.flipperController.setActive(side, active);
  }

  launchBall(force) {
    return this.ballManager.launch(force);
  }

  addExtraBalls(count) {
    this.ballManager.addExtra(count);
  }

  removeExtraBalls() {
    this.ballManager.removeExtras();
  }

  hasBall() {
    return this.ballManager.balls.length > 0;
  }

  getBalls() {
    return this.ballManager.balls;
  }

  getFlippers() {
    return this.tableElements.flippers;
  }

  getTableElements() {
    return this.tableElements;
  }

  applyTilt() {
    this.ballManager.balls.forEach((ball) => {
      Matter.Body.applyForce(ball, ball.position, {
        x: (Math.random() - 0.5) * 0.01,
        y: -0.01,
      });
    });
  }

  setSlowMo(active) {
    if (active) {
      this.engine.timing.timeScale = 0.5;
    } else {
      this.engine.timing.timeScale = 1;
    }
  }

  setGiantBall(active) {
    this.ballManager.setGiant(active);
  }

  setShield(active) {
    this.tableBuilder.setShield(active);
  }

  destroy() {
    Events.off(this.engine, 'collisionStart');
    World.clear(this.world);
    Engine.clear(this.engine);
  }
}
