import { TABLE_WIDTH, TABLE_HEIGHT } from '../utils/constants.js';

const W = TABLE_WIDTH;
const H = TABLE_HEIGHT;

// Wall thickness
const T = 12;

// Plunger lane width
const PLUNGER_LANE = 30;

export const TABLE = {
  width: W,
  height: H,
  wallThickness: T,
  plungerLaneWidth: PLUNGER_LANE,

  // Outer walls
  walls: [
    // Top wall
    { x: W / 2, y: T / 2, w: W, h: T, label: 'wall_top' },
    // Left wall
    { x: T / 2, y: H / 2, w: T, h: H, label: 'wall_left' },
    // Right wall (above plunger lane)
    { x: W - T / 2, y: H / 2 - 80, w: T, h: H - 160, label: 'wall_right' },
    // Plunger lane right wall
    { x: W - PLUNGER_LANE + T / 2, y: H / 2, w: T, h: H, label: 'wall_plunger_left' },
    // Plunger lane bottom
    // Far right wall for plunger
    { x: W - T / 2, y: H / 2, w: T, h: H, label: 'wall_plunger_right' },
  ],

  // Drain walls (angled guides toward drain)
  drainGuides: [
    // Left guide
    { x1: T, y1: H - 140, x2: 90, y2: H - 75, label: 'guide_left' },
    // Right guide
    { x1: W - PLUNGER_LANE - T, y1: H - 140, x2: W - PLUNGER_LANE - 90, y2: H - 75, label: 'guide_right' },
  ],

  // Flipper positions
  flippers: {
    left: { x: 130, y: H - 85, side: 'left' },
    right: { x: W - PLUNGER_LANE - 130, y: H - 85, side: 'right' },
  },

  // Drain sensor
  drain: { x: W / 2 - PLUNGER_LANE / 2, y: H - 10, w: W - PLUNGER_LANE - T * 2, h: 10 },

  // Plunger
  plunger: { x: W - PLUNGER_LANE / 2, y: H - 40 },

  // Ball launch position
  ballLaunch: { x: W - PLUNGER_LANE / 2, y: H - 70 },

  // Bumpers
  bumpers: [
    { x: 140, y: 220, label: 'bumper_0' },
    { x: 220, y: 190, label: 'bumper_1' },
    { x: 190, y: 280, label: 'bumper_2' },
    { x: 260, y: 250, label: 'bumper_3' },
    { x: 150, y: 350, label: 'bumper_4' },
    { x: 240, y: 340, label: 'bumper_5' },
  ],

  // Boss targets (top area)
  bossTargets: [
    { x: 100, y: 80, w: 30, h: 15, label: 'boss_target_0' },
    { x: 185, y: 60, w: 30, h: 15, label: 'boss_target_1' },
    { x: 270, y: 80, w: 30, h: 15, label: 'boss_target_2' },
  ],

  // Ramps (simplified as sensor zones that give points)
  ramps: {
    left: { x: 40, y: 300, w: 30, h: 200, label: 'ramp_left' },
    right: { x: W - PLUNGER_LANE - 40, y: 300, w: 30, h: 200, label: 'ramp_right' },
  },

  // COMBO lanes (5 lanes near bottom)
  comboLanes: [
    { x: 80, y: H - 175, w: 18, h: 30, letter: 'C', label: 'combo_0' },
    { x: 120, y: H - 175, w: 18, h: 30, letter: 'O', label: 'combo_1' },
    { x: 160, y: H - 175, w: 18, h: 30, letter: 'M', label: 'combo_2' },
    { x: 200, y: H - 175, w: 18, h: 30, letter: 'B', label: 'combo_3' },
    { x: 240, y: H - 175, w: 18, h: 30, letter: 'O', label: 'combo_4' },
  ],

  // Slingshots
  slingshots: {
    left: {
      vertices: [
        { x: 75, y: H - 170 },
        { x: 75, y: H - 110 },
        { x: 105, y: H - 110 },
      ],
      label: 'slingshot_left',
    },
    right: {
      vertices: [
        { x: W - PLUNGER_LANE - 75, y: H - 170 },
        { x: W - PLUNGER_LANE - 75, y: H - 110 },
        { x: W - PLUNGER_LANE - 105, y: H - 110 },
      ],
      label: 'slingshot_right',
    },
  },

  // Spinner (between bumper area and top)
  spinner: { x: 185, y: 140, w: 40, h: 6, label: 'spinner' },

  // Outlane sensors (sides at bottom)
  outlanes: {
    left: { x: 25, y: H - 105, w: 20, h: 40, label: 'outlane_left' },
    right: { x: W - PLUNGER_LANE - 25, y: H - 105, w: 20, h: 40, label: 'outlane_right' },
  },

  // Kickback positions (same as outlanes)
  kickbacks: {
    left: { x: 20, y: H - 105 },
    right: { x: W - PLUNGER_LANE - 20, y: H - 105 },
  },

  // Power-up possible spawn positions
  powerUpSpawns: [
    { x: 100, y: 400 },
    { x: 200, y: 380 },
    { x: 280, y: 400 },
    { x: 150, y: 300 },
    { x: 250, y: 300 },
    { x: 180, y: 450 },
  ],

  // Curve at top-right to guide ball from plunger lane into play
  plungerCurve: [
    { x: W - PLUNGER_LANE, y: 50 },
    { x: W - PLUNGER_LANE - 10, y: 30 },
    { x: W - PLUNGER_LANE - 30, y: 18 },
  ],
};
