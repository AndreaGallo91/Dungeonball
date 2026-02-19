export const TABLE_WIDTH = 400;
export const TABLE_HEIGHT = 720;

export const GRAVITY = { x: 0, y: 0.8 };

export const BALL_CONFIG = {
  radius: 8,
  mass: 1,
  restitution: 0.5,
  friction: 0.005,
  frictionAir: 0.0005,
};

export const FLIPPER_CONFIG = {
  length: 70,
  width: 12,
  angularSpeed: 0.28,
  restAngle: 0.5,
  activeAngle: -0.6,
  restitution: 0.9,
};

export const BUMPER_CONFIG = {
  radius: 18,
  restitution: 1.3,
};

export const PLUNGER_CONFIG = {
  maxForce: 0.06,
  chargeRate: 0.0008,
};

export const INITIAL_HP = 5;
export const MAX_HP = 7;
export const FRENZY_DURATION = 15000;
export const POWERUP_SPAWN_INTERVAL = [20000, 30000];
export const POWERUP_VISIBLE_DURATION = 10000;
export const BOSS_SPAWN_SCORE_THRESHOLD = 15000;
export const BOSS_SPAWN_TIME_THRESHOLD = 60000;
export const STREAK_TIMEOUT = 3000;
export const STREAK_WINDOW = 2000;
export const MAX_TILTS = 3;
export const TILT_PENALTY_DURATION = 3000;

export const POINTS = {
  BUMPER: 100,
  BUMPER_ACTIVE: 250,
  RAMP: 500,
  SPINNER: 25,
  SLINGSHOT: 50,
  BOSS_TARGET: 1000,
  CHEST: 2000,
};

export const COLORS = {
  BG: '#1A1A2E',
  SURFACE: '#16213E',
  BORDER: '#8B7355',
  GOLD: '#FFD700',
  ARCANE: '#9B59B6',
  FIRE: '#E74C3C',
  EMERALD: '#2ECC71',
  ICE: '#3498DB',
  GLOW: '#ECF0F1',
  SCORE: '#F39C12',
  BLOOD: '#C0392B',
  DARK: '#0F0F1A',
};

export const STREAK_MULTIPLIERS = [
  { hits: 12, mult: 10 },
  { hits: 8, mult: 5 },
  { hits: 5, mult: 3 },
  { hits: 3, mult: 2 },
];

export const COMBO_BONUSES = [5000, 10000, 20000, 40000, 50000];

export const RANKS = [
  { min: 1500001, rank: 'S', title: 'Signore del Dungeon' },
  { min: 800001, rank: 'A', title: 'Eroe Leggendario' },
  { min: 400001, rank: 'B', title: 'Campione' },
  { min: 150001, rank: 'C', title: 'Avventuriero' },
  { min: 50001, rank: 'D', title: 'Esploratore' },
  { min: 0, rank: 'F', title: 'Principiante del Dungeon' },
];
