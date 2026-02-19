import Matter from 'matter-js';
import { BALL_CONFIG, PLUNGER_CONFIG, TABLE_HEIGHT } from '../utils/constants.js';
import { TABLE } from '../data/tableLayout.js';

const { Bodies, Composite, Body } = Matter;

export class BallManager {
  constructor(world, onEvent) {
    this.world = world;
    this.onEvent = onEvent;
    this.balls = [];
    this.mainBall = null;
    this.isGiant = false;
  }

  createBall(x, y) {
    const r = this.isGiant ? BALL_CONFIG.radius * 2 : BALL_CONFIG.radius;
    const ball = Bodies.circle(x, y, r, {
      label: 'ball',
      mass: BALL_CONFIG.mass,
      restitution: BALL_CONFIG.restitution,
      friction: BALL_CONFIG.friction,
      frictionAir: BALL_CONFIG.frictionAir,
      density: 0.004,
    });
    Composite.add(this.world, ball);
    this.balls.push(ball);
    return ball;
  }

  launch(force) {
    if (this.mainBall) return this.mainBall;

    const pos = TABLE.ballLaunch;
    const ball = this.createBall(pos.x, pos.y);
    this.mainBall = ball;

    const launchForce = force * PLUNGER_CONFIG.maxForce;
    Body.applyForce(ball, ball.position, { x: 0, y: -launchForce });

    this.onEvent({ type: 'ballLaunched' });
    return ball;
  }

  addExtra(count) {
    for (let i = 0; i < count; i++) {
      const x = 100 + Math.random() * 200;
      const y = 200 + Math.random() * 100;
      this.createBall(x, y);
    }
  }

  removeExtras() {
    // Keep only the main ball
    const toRemove = this.balls.filter((b) => b !== this.mainBall);
    toRemove.forEach((b) => {
      Composite.remove(this.world, b);
    });
    this.balls = this.mainBall ? [this.mainBall] : [];
  }

  removeBall(ball) {
    Composite.remove(this.world, ball);
    this.balls = this.balls.filter((b) => b !== ball);
    if (ball === this.mainBall) {
      this.mainBall = this.balls.length > 0 ? this.balls[0] : null;
    }
  }

  checkDrain(tableHeight) {
    const drainY = tableHeight + 20;
    const drained = this.balls.filter((b) => b.position.y > drainY);
    drained.forEach((ball) => {
      const isMain = ball === this.mainBall;
      this.removeBall(ball);
      if (isMain) {
        this.onEvent({ type: 'drain' });
      }
    });
  }

  setGiant(active) {
    this.isGiant = active;
    const targetRadius = active ? BALL_CONFIG.radius * 2 : BALL_CONFIG.radius;
    this.balls.forEach((ball) => {
      const scale = targetRadius / ball.circleRadius;
      Body.scale(ball, scale, scale);
    });
  }

  reset() {
    this.balls.forEach((b) => Composite.remove(this.world, b));
    this.balls = [];
    this.mainBall = null;
    this.isGiant = false;
  }
}
