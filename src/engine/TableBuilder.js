import Matter from 'matter-js';
import { TABLE } from '../data/tableLayout.js';
import { BUMPER_CONFIG, FLIPPER_CONFIG, TABLE_WIDTH, TABLE_HEIGHT } from '../utils/constants.js';

const { Bodies, Body, Composite, Constraint } = Matter;

export class TableBuilder {
  constructor(world) {
    this.world = world;
    this.shieldBody = null;
  }

  build() {
    const elements = {
      walls: [],
      bumpers: [],
      bossTargets: [],
      comboLanes: [],
      slingshots: [],
      flippers: {},
      drain: null,
      outlanes: [],
      spinner: null,
      ramps: [],
    };

    // Build walls
    this._buildWalls(elements);
    // Build plunger curve
    this._buildPlungerCurve(elements);
    // Build drain guides
    this._buildDrainGuides(elements);
    // Build bumpers
    this._buildBumpers(elements);
    // Build boss targets
    this._buildBossTargets(elements);
    // Build combo lanes
    this._buildComboLanes(elements);
    // Build slingshots
    this._buildSlingshots(elements);
    // Build flippers
    this._buildFlippers(elements);
    // Build drain
    this._buildDrain(elements);
    // Build outlanes
    this._buildOutlanes(elements);
    // Build spinner
    this._buildSpinner(elements);
    // Build ramp sensors
    this._buildRamps(elements);

    return elements;
  }

  _buildWalls(elements) {
    TABLE.walls.forEach((w) => {
      const wall = Bodies.rectangle(w.x, w.y, w.w, w.h, {
        isStatic: true,
        label: w.label,
        render: { fillStyle: '#8B7355' },
        friction: 0.1,
        restitution: 0.3,
      });
      elements.walls.push(wall);
      Composite.add(this.world, wall);
    });
  }

  _buildPlungerCurve(elements) {
    // Curved wall at top of plunger lane to guide ball left
    const points = TABLE.plungerCurve;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const cx = (p1.x + p2.x) / 2;
      const cy = (p1.y + p2.y) / 2;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const wall = Bodies.rectangle(cx, cy, len + 4, 8, {
        isStatic: true,
        angle,
        label: 'plunger_curve',
        friction: 0.05,
        restitution: 0.4,
      });
      elements.walls.push(wall);
      Composite.add(this.world, wall);
    }
    // Add a final curved piece connecting to top wall area
    const topCurve = Bodies.circle(TABLE.width - TABLE.plungerLaneWidth - 15, 22, 12, {
      isStatic: true,
      label: 'plunger_curve_end',
      restitution: 0.5,
    });
    elements.walls.push(topCurve);
    Composite.add(this.world, topCurve);
  }

  _buildDrainGuides(elements) {
    TABLE.drainGuides.forEach((g) => {
      const dx = g.x2 - g.x1;
      const dy = g.y2 - g.y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const cx = (g.x1 + g.x2) / 2;
      const cy = (g.y1 + g.y2) / 2;
      const wall = Bodies.rectangle(cx, cy, len, 8, {
        isStatic: true,
        angle,
        label: g.label,
        friction: 0.05,
        restitution: 0.3,
      });
      elements.walls.push(wall);
      Composite.add(this.world, wall);
    });
  }

  _buildBumpers(elements) {
    TABLE.bumpers.forEach((b, i) => {
      const bumper = Bodies.circle(b.x, b.y, BUMPER_CONFIG.radius, {
        isStatic: true,
        label: b.label,
        restitution: BUMPER_CONFIG.restitution,
        plugin: { bumperIndex: i, isActive: false },
      });
      elements.bumpers.push(bumper);
      Composite.add(this.world, bumper);
    });
  }

  _buildBossTargets(elements) {
    TABLE.bossTargets.forEach((t, i) => {
      const target = Bodies.rectangle(t.x, t.y, t.w, t.h, {
        isStatic: true,
        isSensor: true,
        label: t.label,
        plugin: { targetIndex: i, isLit: false },
      });
      elements.bossTargets.push(target);
      Composite.add(this.world, target);
    });
  }

  _buildComboLanes(elements) {
    TABLE.comboLanes.forEach((c, i) => {
      const lane = Bodies.rectangle(c.x, c.y, c.w, c.h, {
        isStatic: true,
        isSensor: true,
        label: c.label,
        plugin: { laneIndex: i, letter: c.letter, isLit: false },
      });
      elements.comboLanes.push(lane);
      Composite.add(this.world, lane);
    });
  }

  _buildSlingshots(elements) {
    ['left', 'right'].forEach((side) => {
      const s = TABLE.slingshots[side];
      const sling = Bodies.fromVertices(
        s.vertices.reduce((a, v) => a + v.x, 0) / s.vertices.length,
        s.vertices.reduce((a, v) => a + v.y, 0) / s.vertices.length,
        s.vertices,
        {
          isStatic: true,
          label: s.label,
          restitution: 1.1,
          friction: 0.05,
        }
      );
      if (sling) {
        elements.slingshots.push(sling);
        Composite.add(this.world, sling);
      }
    });
  }

  _buildFlippers(elements) {
    ['left', 'right'].forEach((side) => {
      const f = TABLE.flippers[side];
      const isLeft = side === 'left';
      const flipperLen = FLIPPER_CONFIG.length;
      const flipperW = FLIPPER_CONFIG.width;

      // Flipper body - positioned so pivot is at one end
      const flipper = Bodies.rectangle(
        f.x + (isLeft ? flipperLen / 2 - 10 : -(flipperLen / 2 - 10)),
        f.y,
        flipperLen,
        flipperW,
        {
          label: `flipper_${side}`,
          density: 0.02,
          restitution: FLIPPER_CONFIG.restitution,
          friction: 0.1,
          chamfer: { radius: flipperW / 2 },
        }
      );

      // Pin the flipper at one end
      const pivot = { x: f.x, y: f.y };
      const constraint = Constraint.create({
        pointA: pivot,
        bodyB: flipper,
        pointB: {
          x: isLeft ? -(flipperLen / 2 - 10) : flipperLen / 2 - 10,
          y: 0,
        },
        stiffness: 1,
        length: 0,
      });

      elements.flippers[side] = {
        body: flipper,
        constraint,
        pivot,
        isLeft,
        active: false,
      };

      Composite.add(this.world, [flipper, constraint]);
    });
  }

  _buildDrain(elements) {
    const d = TABLE.drain;
    const drain = Bodies.rectangle(d.x, d.y, d.w, d.h, {
      isStatic: true,
      isSensor: true,
      label: 'drain',
    });
    elements.drain = drain;
    Composite.add(this.world, drain);
  }

  _buildOutlanes(elements) {
    ['left', 'right'].forEach((side) => {
      const o = TABLE.outlanes[side];
      const outlane = Bodies.rectangle(o.x, o.y, o.w, o.h, {
        isStatic: true,
        isSensor: true,
        label: o.label,
      });
      elements.outlanes.push(outlane);
      Composite.add(this.world, outlane);
    });
  }

  _buildSpinner(elements) {
    const s = TABLE.spinner;
    const spinner = Bodies.rectangle(s.x, s.y, s.w, s.h, {
      isStatic: true,
      isSensor: true,
      label: s.label,
    });
    elements.spinner = spinner;
    Composite.add(this.world, spinner);
  }

  _buildRamps(elements) {
    ['left', 'right'].forEach((side) => {
      const r = TABLE.ramps[side];
      const ramp = Bodies.rectangle(r.x, r.y, r.w, r.h, {
        isStatic: true,
        isSensor: true,
        label: r.label,
      });
      elements.ramps.push(ramp);
      Composite.add(this.world, ramp);
    });
  }

  setShield(active) {
    const d = TABLE.drain;
    if (active && !this.shieldBody) {
      this.shieldBody = Bodies.rectangle(d.x, d.y - 15, d.w, 6, {
        isStatic: true,
        label: 'shield',
        restitution: 0.8,
      });
      Composite.add(this.world, this.shieldBody);
    } else if (!active && this.shieldBody) {
      Composite.remove(this.world, this.shieldBody);
      this.shieldBody = null;
    }
  }
}
