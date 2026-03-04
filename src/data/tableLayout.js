import { TABLE_WIDTH, TABLE_HEIGHT } from '../utils/constants.js';

const W = TABLE_WIDTH;
const H = TABLE_HEIGHT;
const T = 10; // Wall thickness

export const TABLE = {
  width: W,
  height: H,
  wallThickness: T,

  // Outer walls — full box around the playing field
  walls: [
    // Top wall
    { x: W / 2, y: T / 2, w: W, h: T, label: 'wall_top' },
    // Left wall
    { x: T / 2, y: H / 2, w: T, h: H, label: 'wall_left' },
    // Right wall
    { x: W - T / 2, y: H / 2, w: T, h: H, label: 'wall_right' },
    // Bottom wall (catches the ball below drain)
    { x: W / 2, y: H - T / 2, w: W, h: T, label: 'wall_bottom' },
  ],

  // Drain guides (angled walls funneling to drain)
  drainGuides: [
    // Left guide — starts away from wall to avoid trapping ball
    { x1: 50, y1: H - 220, x2: 95, y2: H - 95, label: 'guide_left' },
    // Right guide
    { x1: W - 50, y1: H - 220, x2: W - 95, y2: H - 95, label: 'guide_right' },
  ],

  // Flipper positions (pivot points)
  flippers: {
    left: { x: 125, y: H - 80, side: 'left' },
    right: { x: W - 125, y: H - 80, side: 'right' },
  },

  // Drain sensor (between flippers, at bottom)
  drain: { x: W / 2, y: H - 30, w: 120, h: 10 },

  // Ball launch position (above right flipper area)
  ballLaunch: { x: W - 50, y: H - 130 },

  // Bumpers (central area)
  bumpers: [
    { x: 130, y: 230, label: 'bumper_0' },
    { x: 210, y: 200, label: 'bumper_1' },
    { x: 280, y: 240, label: 'bumper_2' },
    { x: 160, y: 310, label: 'bumper_3' },
    { x: 240, y: 300, label: 'bumper_4' },
    { x: 200, y: 380, label: 'bumper_5' },
  ],

  // Boss targets (top area)
  bossTargets: [
    { x: 100, y: 80, w: 35, h: 18, label: 'boss_target_0' },
    { x: 200, y: 60, w: 35, h: 18, label: 'boss_target_1' },
    { x: 300, y: 80, w: 35, h: 18, label: 'boss_target_2' },
  ],

  // Ramps (sensor zones on sides)
  ramps: {
    left: { x: 30, y: 300, w: 25, h: 180, label: 'ramp_left' },
    right: { x: W - 30, y: 300, w: 25, h: 180, label: 'ramp_right' },
  },

  // COMBO lanes (above flippers)
  comboLanes: [
    { x: 100, y: H - 190, w: 20, h: 28, letter: 'C', label: 'combo_0' },
    { x: 150, y: H - 190, w: 20, h: 28, letter: 'O', label: 'combo_1' },
    { x: 200, y: H - 190, w: 20, h: 28, letter: 'M', label: 'combo_2' },
    { x: 250, y: H - 190, w: 20, h: 28, letter: 'B', label: 'combo_3' },
    { x: 300, y: H - 190, w: 20, h: 28, letter: 'O', label: 'combo_4' },
  ],

  // Slingshots (triangular bumpers — positioned inside drain guides, no wall pockets)
  slingshots: {
    left: {
      vertices: [
        { x: 95, y: H - 170 },
        { x: 95, y: H - 110 },
        { x: 130, y: H - 110 },
      ],
      label: 'slingshot_left',
    },
    right: {
      vertices: [
        { x: W - 95, y: H - 170 },
        { x: W - 95, y: H - 110 },
        { x: W - 130, y: H - 110 },
      ],
      label: 'slingshot_right',
    },
  },

  // Spinner
  spinner: { x: 200, y: 140, w: 40, h: 8, label: 'spinner' },

  // Outlane sensors (between wall and drain guide)
  outlanes: {
    left: { x: 40, y: H - 150, w: 20, h: 40, label: 'outlane_left' },
    right: { x: W - 40, y: H - 150, w: 20, h: 40, label: 'outlane_right' },
  },

  // Power-up spawn positions
  powerUpSpawns: [
    { x: 100, y: 420 },
    { x: 200, y: 400 },
    { x: 300, y: 420 },
    { x: 150, y: 320 },
    { x: 250, y: 320 },
    { x: 200, y: 480 },
  ],
};
