import { useRef, useCallback, useEffect, useState, useReducer } from 'react';
import Matter from 'matter-js';
import { PinballEngine } from '../../engine/PinballEngine.js';
import { BossManager } from '../../engine/BossManager.js';
import { PowerUpManager } from '../../engine/PowerUpManager.js';
import { ComboTracker } from '../../engine/ComboTracker.js';
import { FrenzyManager } from '../../engine/FrenzyManager.js';
import { useGameLoop } from '../../hooks/useGameLoop.js';
import { useInput } from '../../hooks/useInput.js';
import { renderTable } from '../../rendering/TableRenderer.js';
import { BallTrailRenderer } from '../../rendering/BallRenderer.js';
import { renderFlippers } from '../../rendering/FlipperRenderer.js';
import { ParticleSystem } from '../../rendering/ParticleRenderer.js';
import { renderBoss } from '../../rendering/BossRenderer.js';
import { renderSpawnedPowerUp } from '../../rendering/PowerUpRenderer.js';
import { SFX, startMusic, stopMusic } from '../../audio/AudioManager.js';
import { TABLE } from '../../data/tableLayout.js';
import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  INITIAL_HP,
  MAX_HP,
  MAX_TILTS,
  TILT_PENALTY_DURATION,
  COLORS,
} from '../../utils/constants.js';
import { distance } from '../../utils/mathHelpers.js';
import GameHUD from './GameHUD.jsx';

const initialState = {
  phase: 'waiting', // waiting | exploration | boss_fight | frenzy | game_over
  score: 0,
  hp: INITIAL_HP,
  maxHp: INITIAL_HP,
  level: 1,
  comboLetters: [false, false, false, false, false],
  comboCount: 0,
  streakCount: 0,
  multiplier: 1,
  currentBoss: null,
  bossHp: 0,
  bossMaxHp: 0,
  targetsHit: [false, false, false],
  activePowerUp: null,
  powerUpTimer: 0,
  spawnedPowerUp: null,
  kickbackActive: { left: false, right: false },
  frenzyTimer: 0,
  bossesDefeated: 0,
  tiltsRemaining: MAX_TILTS,
  tiltPenalty: false,
  plungerCharge: 0,
  shieldActive: false,
  bumperFlash: {},
  isPaused: false,
  startTime: 0,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.phase };
    case 'ADD_SCORE':
      return { ...state, score: state.score + action.points };
    case 'SET_HP':
      return { ...state, hp: Math.max(0, Math.min(action.hp, state.maxHp)) };
    case 'SET_LEVEL':
      return { ...state, level: action.level };
    case 'SET_COMBO_LETTERS':
      return { ...state, comboLetters: action.letters };
    case 'SET_COMBO_COUNT':
      return { ...state, comboCount: action.count };
    case 'SET_MULTIPLIER':
      return {
        ...state,
        multiplier: action.multiplier,
        streakCount: action.streakCount,
      };
    case 'SET_BOSS':
      return {
        ...state,
        currentBoss: action.boss,
        bossHp: action.hp,
        bossMaxHp: action.maxHp,
        targetsHit: [false, false, false],
      };
    case 'SET_BOSS_HP':
      return { ...state, bossHp: action.hp };
    case 'SET_TARGETS_HIT':
      return { ...state, targetsHit: action.targetsHit };
    case 'CLEAR_BOSS':
      return {
        ...state,
        currentBoss: null,
        bossHp: 0,
        bossMaxHp: 0,
        targetsHit: [false, false, false],
        bossesDefeated: state.bossesDefeated + 1,
      };
    case 'SET_ACTIVE_POWERUP':
      return { ...state, activePowerUp: action.powerUp };
    case 'SET_SPAWNED_POWERUP':
      return { ...state, spawnedPowerUp: action.spawned };
    case 'SET_KICKBACK':
      return { ...state, kickbackActive: action.kickback };
    case 'SET_SHIELD':
      return { ...state, shieldActive: action.active };
    case 'SET_PLUNGER':
      return { ...state, plungerCharge: action.charge };
    case 'USE_TILT':
      return { ...state, tiltsRemaining: state.tiltsRemaining - 1 };
    case 'SET_TILT_PENALTY':
      return { ...state, tiltPenalty: action.penalty };
    case 'BUMPER_FLASH':
      return {
        ...state,
        bumperFlash: { ...state.bumperFlash, [action.index]: Date.now() },
      };
    case 'TOGGLE_PAUSE':
      return { ...state, isPaused: !state.isPaused };
    case 'RESET':
      return { ...initialState, startTime: Date.now() };
    default:
      return state;
  }
}

export default function PinballGame({ onGameOver, onPause }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const bossManagerRef = useRef(null);
  const powerUpManagerRef = useRef(null);
  const comboTrackerRef = useRef(null);
  const frenzyManagerRef = useRef(null);
  const particlesRef = useRef(new ParticleSystem());
  const ballRendererRef = useRef(new BallTrailRenderer());
  const screenShakeRef = useRef({ intensity: 0, duration: 0 });
  const rampCooldownRef = useRef({});
  const relaunchPendingRef = useRef(false);

  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    startTime: Date.now(),
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  // Handle game events from the engine
  const handleEngineEvent = useCallback((event) => {
    const s = stateRef.current;

    switch (event.type) {
      case 'drain': {
        if (s.phase === 'frenzy') return; // No drain during frenzy
        if (s.shieldActive) return; // Shield blocks drain

        const newHp = s.hp - 1;
        dispatch({ type: 'SET_HP', hp: newHp });
        SFX.drain();
        particlesRef.current.emitText(
          TABLE_WIDTH / 2 - 15,
          TABLE_HEIGHT - 60,
          '-1 HP',
          COLORS.BLOOD,
          12
        );
        screenShakeRef.current = { intensity: 5, duration: 300 };

        if (newHp <= 0) {
          dispatch({ type: 'SET_PHASE', phase: 'game_over' });
          SFX.gameOver();
          stopMusic();
        }
        break;
      }

      case 'bumperHit': {
        if (s.phase === 'waiting' || s.phase === 'game_over') return;
        const mult = comboTrackerRef.current?.getMultiplier() || 1;
        const scoreBoost =
          powerUpManagerRef.current?.isActive('scoreboost') ? 3 : 1;
        const frenzyMult = s.phase === 'frenzy' ? 5 : 1;
        const totalPoints =
          event.points * mult * scoreBoost * frenzyMult;

        dispatch({ type: 'ADD_SCORE', points: totalPoints });
        dispatch({ type: 'BUMPER_FLASH', index: event.bumperIndex });
        comboTrackerRef.current?.registerHit(Date.now());

        if (event.isActive) {
          SFX.bumperActiveHit();
        } else {
          SFX.bumperHit();
        }

        particlesRef.current.emit(
          event.x,
          event.y,
          event.isActive ? COLORS.FIRE : COLORS.EMERALD,
          6,
          3,
          20
        );
        particlesRef.current.emitText(
          event.x,
          event.y - 20,
          `+${totalPoints}`,
          COLORS.SCORE,
          totalPoints >= 1000 ? 11 : 9
        );
        break;
      }

      case 'bossTargetHit': {
        if (s.phase !== 'boss_fight') return;
        bossManagerRef.current?.hitTarget(event.targetIndex);
        SFX.bossTargetHit();

        const mult = comboTrackerRef.current?.getMultiplier() || 1;
        const totalPoints = event.points * mult;
        dispatch({ type: 'ADD_SCORE', points: totalPoints });
        comboTrackerRef.current?.registerHit(Date.now());

        particlesRef.current.emit(event.x, event.y, COLORS.GOLD, 12, 4, 25);
        particlesRef.current.emitText(
          event.x,
          event.y - 20,
          `+${totalPoints}`,
          COLORS.GOLD,
          12
        );
        screenShakeRef.current = { intensity: 3, duration: 200 };
        break;
      }

      case 'comboLaneHit': {
        if (s.phase === 'waiting' || s.phase === 'game_over') return;
        comboTrackerRef.current?.hitLane(event.laneIndex);
        SFX.comboLetter(event.laneIndex);
        particlesRef.current.emit(event.x, event.y, COLORS.ARCANE, 5, 2, 15);
        break;
      }

      case 'slingshotHit': {
        if (s.phase === 'waiting' || s.phase === 'game_over') return;
        dispatch({ type: 'ADD_SCORE', points: event.points });
        comboTrackerRef.current?.registerHit(Date.now());
        SFX.slingshot();
        particlesRef.current.emit(event.x, event.y, COLORS.BORDER, 4, 2, 15);
        break;
      }

      case 'spinnerHit': {
        if (s.phase === 'waiting' || s.phase === 'game_over') return;
        dispatch({ type: 'ADD_SCORE', points: event.points });
        SFX.spinner();
        break;
      }

      case 'rampHit': {
        if (s.phase === 'waiting' || s.phase === 'game_over') return;
        const now = Date.now();
        const cooldownKey = event.side;
        if (
          rampCooldownRef.current[cooldownKey] &&
          now - rampCooldownRef.current[cooldownKey] < 2000
        ) {
          return;
        }
        rampCooldownRef.current[cooldownKey] = now;

        const mult = comboTrackerRef.current?.getMultiplier() || 1;
        const totalPoints = event.points * mult;
        dispatch({ type: 'ADD_SCORE', points: totalPoints });
        comboTrackerRef.current?.registerHit(Date.now());
        SFX.ramp();
        particlesRef.current.emitText(
          event.x,
          event.y - 30,
          `RAMP +${totalPoints}`,
          COLORS.ICE,
          10
        );
        break;
      }

      case 'outlaneHit': {
        const { side } = event;
        if (powerUpManagerRef.current?.useKickback(side)) {
          // Kickback saved the ball — apply upward force
          const balls = engineRef.current?.getBalls();
          if (balls?.length > 0) {
            Matter.Body.applyForce(balls[0], balls[0].position, {
              x: side === 'left' ? 0.005 : -0.005,
              y: -0.02,
            });
          }
        }
        break;
      }

      case 'ballLaunched':
        if (s.phase === 'waiting') {
          dispatch({ type: 'SET_PHASE', phase: 'exploration' });
          startMusic('exploration');
        }
        SFX.launch();
        break;
    }
  }, []);

  // Handle game system events (boss, powerup, combo, frenzy)
  const handleSystemEvent = useCallback((event) => {
    const s = stateRef.current;

    switch (event.type) {
      case 'bossSpawn':
        dispatch({
          type: 'SET_BOSS',
          boss: event.boss,
          hp: event.boss.hp,
          maxHp: event.boss.hp,
        });
        dispatch({ type: 'SET_PHASE', phase: 'boss_fight' });
        startMusic('boss_fight');
        SFX.bossSpawn();
        // Activate bumpers during boss fight
        engineRef.current?.getTableElements().bumpers.forEach((b) => {
          if (b.plugin) b.plugin.isActive = true;
        });
        break;

      case 'bossHit': {
        dispatch({ type: 'SET_BOSS_HP', hp: event.hp });
        const hits = [...(stateRef.current.targetsHit || [false, false, false])];
        hits[event.targetIndex] = true;
        dispatch({ type: 'SET_TARGETS_HIT', targetsHit: hits });
        screenShakeRef.current = { intensity: 4, duration: 200 };
        break;
      }

      case 'bossTargetsReset':
        dispatch({ type: 'SET_TARGETS_HIT', targetsHit: [false, false, false] });
        break;

      case 'bossDefeated':
        dispatch({ type: 'CLEAR_BOSS' });
        dispatch({ type: 'ADD_SCORE', points: event.boss.points });
        SFX.bossDefeated();
        screenShakeRef.current = { intensity: 8, duration: 500 };
        particlesRef.current.emitText(
          TABLE_WIDTH / 2 - 15,
          100,
          'BOSS SCONFITTO!',
          COLORS.GOLD,
          11
        );
        // Start frenzy
        frenzyManagerRef.current?.start();
        // Deactivate bumpers
        engineRef.current?.getTableElements().bumpers.forEach((b) => {
          if (b.plugin) b.plugin.isActive = false;
        });
        // Set level
        dispatch({ type: 'SET_LEVEL', level: s.level + 1 });
        break;

      case 'bossAttack':
        particlesRef.current.emitText(
          TABLE_WIDTH / 2 - 15,
          140,
          event.boss.attackName || 'Attacco!',
          COLORS.FIRE,
          10
        );
        // Handle attack effects
        if (event.attack === 'slowBall') {
          engineRef.current?.setSlowMo(true);
          setTimeout(() => engineRef.current?.setSlowMo(false), 3000);
        }
        break;

      case 'frenzyStart':
        dispatch({ type: 'SET_PHASE', phase: 'frenzy' });
        startMusic('frenzy');
        SFX.frenzyStart();
        engineRef.current?.addExtraBalls(2);
        engineRef.current?.setShield(true);
        dispatch({ type: 'SET_SHIELD', active: true });
        particlesRef.current.emitText(
          TABLE_WIDTH / 2 - 15,
          200,
          'FRENZY!',
          '#FF00FF',
          14
        );
        break;

      case 'frenzyEnd':
        dispatch({ type: 'SET_PHASE', phase: 'exploration' });
        startMusic('exploration');
        SFX.frenzyEnd();
        engineRef.current?.removeExtraBalls();
        engineRef.current?.setShield(false);
        dispatch({ type: 'SET_SHIELD', active: false });
        bossManagerRef.current?.setLastBossScore(stateRef.current.score);
        break;

      case 'comboLetterLit':
        dispatch({ type: 'SET_COMBO_LETTERS', letters: event.letters });
        break;

      case 'comboComplete':
        dispatch({ type: 'SET_COMBO_COUNT', count: event.comboCount });
        dispatch({ type: 'SET_COMBO_LETTERS', letters: [false, false, false, false, false] });
        dispatch({ type: 'ADD_SCORE', points: event.bonus });
        SFX.comboComplete();
        screenShakeRef.current = { intensity: 5, duration: 300 };
        particlesRef.current.emitText(
          TABLE_WIDTH / 2 - 15,
          TABLE_HEIGHT / 2,
          `COMBO x${event.comboCount}!`,
          COLORS.ARCANE,
          14
        );
        // Combo rewards
        if (event.comboCount === 2) {
          dispatch({ type: 'SET_KICKBACK', kickback: { left: true, right: true } });
          powerUpManagerRef.current.kickbackActive = { left: true, right: true };
        } else if (event.comboCount === 4) {
          engineRef.current?.addExtraBalls(1);
        } else if (event.comboCount >= 5) {
          frenzyManagerRef.current?.start();
        }
        break;

      case 'multiplierChanged':
        dispatch({
          type: 'SET_MULTIPLIER',
          multiplier: event.multiplier,
          streakCount: event.streakCount,
        });
        if (event.multiplier >= 10) {
          SFX.legendary();
          particlesRef.current.emitText(
            TABLE_WIDTH / 2 - 15,
            TABLE_HEIGHT / 2 - 40,
            'LEGENDARY!',
            COLORS.GOLD,
            14
          );
          screenShakeRef.current = { intensity: 6, duration: 400 };
        }
        break;

      case 'powerUpSpawned':
        dispatch({
          type: 'SET_SPAWNED_POWERUP',
          spawned: { powerUp: event.powerUp, x: event.x, y: event.y, spawnTime: Date.now() },
        });
        break;

      case 'powerUpExpired':
        dispatch({ type: 'SET_SPAWNED_POWERUP', spawned: null });
        break;

      case 'powerUpCollected':
        dispatch({ type: 'SET_SPAWNED_POWERUP', spawned: null });
        SFX.powerUpCollect();

        if (event.powerUp.id === 'heal' && event.newHp !== undefined) {
          dispatch({ type: 'SET_HP', hp: event.newHp });
          SFX.heal();
          particlesRef.current.emitText(
            TABLE_WIDTH / 2 - 15,
            TABLE_HEIGHT / 2,
            '+1 HP',
            COLORS.EMERALD,
            12
          );
        } else if (event.powerUp.id === 'kickback') {
          dispatch({ type: 'SET_KICKBACK', kickback: { left: true, right: true } });
        } else if (event.powerUp.id === 'multiball') {
          dispatch({ type: 'SET_ACTIVE_POWERUP', powerUp: event.powerUp });
          engineRef.current?.addExtraBalls(2);
        } else if (event.powerUp.id === 'fireball') {
          dispatch({ type: 'SET_ACTIVE_POWERUP', powerUp: event.powerUp });
        } else if (event.powerUp.id === 'shield') {
          dispatch({ type: 'SET_ACTIVE_POWERUP', powerUp: event.powerUp });
          dispatch({ type: 'SET_SHIELD', active: true });
          engineRef.current?.setShield(true);
        } else if (event.powerUp.id === 'slowmo') {
          dispatch({ type: 'SET_ACTIVE_POWERUP', powerUp: event.powerUp });
          engineRef.current?.setSlowMo(true);
        } else if (event.powerUp.id === 'giant') {
          dispatch({ type: 'SET_ACTIVE_POWERUP', powerUp: event.powerUp });
          engineRef.current?.setGiantBall(true);
        } else if (event.powerUp.id === 'scoreboost') {
          dispatch({ type: 'SET_ACTIVE_POWERUP', powerUp: event.powerUp });
        } else if (event.powerUp.id === 'magnet') {
          dispatch({ type: 'SET_ACTIVE_POWERUP', powerUp: event.powerUp });
        } else {
          dispatch({ type: 'SET_ACTIVE_POWERUP', powerUp: event.powerUp });
        }

        particlesRef.current.emitText(
          TABLE_WIDTH / 2 - 15,
          TABLE_HEIGHT / 2 + 30,
          `${event.powerUp.icon} ${event.powerUp.name}`,
          event.powerUp.color,
          10
        );
        break;

      case 'powerUpDeactivated':
        dispatch({ type: 'SET_ACTIVE_POWERUP', powerUp: null });
        SFX.powerUpEnd();
        // Clean up power-up effects
        if (event.powerUp.id === 'shield') {
          dispatch({ type: 'SET_SHIELD', active: false });
          engineRef.current?.setShield(false);
        } else if (event.powerUp.id === 'slowmo') {
          engineRef.current?.setSlowMo(false);
        } else if (event.powerUp.id === 'giant') {
          engineRef.current?.setGiantBall(false);
        } else if (event.powerUp.id === 'multiball') {
          engineRef.current?.removeExtraBalls();
        }
        break;

      case 'kickbackUsed':
        const kb = { ...stateRef.current.kickbackActive };
        kb[event.side] = false;
        dispatch({ type: 'SET_KICKBACK', kickback: kb });
        break;
    }
  }, []);

  // Initialize engine
  useEffect(() => {
    const engine = new PinballEngine(handleEngineEvent);
    engineRef.current = engine;

    const bossManager = new BossManager(handleSystemEvent);
    bossManagerRef.current = bossManager;

    const powerUpManager = new PowerUpManager(handleSystemEvent);
    powerUpManagerRef.current = powerUpManager;
    powerUpManager.init();

    const comboTracker = new ComboTracker(handleSystemEvent);
    comboTrackerRef.current = comboTracker;

    const frenzyManager = new FrenzyManager(handleSystemEvent);
    frenzyManagerRef.current = frenzyManager;

    engine.start();

    return () => {
      engine.destroy();
      stopMusic();
    };
  }, [handleEngineEvent, handleSystemEvent]);

  // Handle input
  const handleInput = useCallback(
    (action) => {
      const s = stateRef.current;
      if (s.phase === 'game_over') return;

      switch (action.type) {
        case 'flipper':
          if (!s.tiltPenalty) {
            SFX.flipper();
            engineRef.current?.setFlipperState(action.side, action.active);
          }
          break;

        case 'launch':
          if (!engineRef.current?.hasBall()) {
            engineRef.current?.launchBall(action.force);
          }
          dispatch({ type: 'SET_PLUNGER', charge: 0 });
          break;

        case 'plungerCharge':
          dispatch({ type: 'SET_PLUNGER', charge: action.charge });
          break;

        case 'tilt':
          if (s.tiltsRemaining > 0) {
            dispatch({ type: 'USE_TILT' });
            engineRef.current?.applyTilt();
            SFX.tilt();
          }
          if (s.tiltsRemaining <= 1) {
            // Tilt penalty
            dispatch({ type: 'SET_TILT_PENALTY', penalty: true });
            engineRef.current?.flipperController?.setDisabled(true);
            setTimeout(() => {
              dispatch({ type: 'SET_TILT_PENALTY', penalty: false });
              engineRef.current?.flipperController?.setDisabled(false);
            }, TILT_PENALTY_DURATION);
          }
          break;

        case 'pause':
          dispatch({ type: 'TOGGLE_PAUSE' });
          if (onPause) onPause();
          break;
      }
    },
    [onPause]
  );

  useInput(handleInput);

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e) => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const mid = rect.width / 2;

        if (x < mid) {
          handleInput({ type: 'flipper', side: 'left', active: true });
        } else {
          handleInput({ type: 'flipper', side: 'right', active: true });
        }
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      handleInput({ type: 'flipper', side: 'left', active: false });
      handleInput({ type: 'flipper', side: 'right', active: false });
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleInput]);

  // Main game loop
  const gameLoop = useCallback(
    (timestamp) => {
      const s = stateRef.current;
      if (s.isPaused || s.phase === 'game_over') return;

      const now = Date.now();

      // Update physics
      engineRef.current?.update(timestamp);

      // Update managers
      comboTrackerRef.current?.update(now);
      frenzyManagerRef.current?.update(now);
      powerUpManagerRef.current?.update(
        now,
        frenzyManagerRef.current?.isActive(),
        s.phase === 'boss_fight'
      );

      // Boss spawn check
      if (
        s.phase === 'exploration' &&
        bossManagerRef.current?.shouldSpawnBoss(s.score, now)
      ) {
        bossManagerRef.current.spawnBoss();
      }

      // Boss attack check
      if (s.phase === 'boss_fight') {
        bossManagerRef.current?.checkBossAttack(now);
      }

      // Check if ball touches power-up
      const spawned = powerUpManagerRef.current?.getSpawned();
      if (spawned && engineRef.current) {
        const balls = engineRef.current.getBalls();
        for (const ball of balls) {
          const d = distance(
            ball.position.x,
            ball.position.y,
            spawned.x,
            spawned.y
          );
          if (d < 25) {
            powerUpManagerRef.current.collect(s.hp);
            break;
          }
        }
      }

      // Auto-relaunch ball if lost during gameplay
      if (
        !engineRef.current?.hasBall() &&
        s.phase !== 'waiting' &&
        s.phase !== 'game_over' &&
        s.hp > 0 &&
        !relaunchPendingRef.current
      ) {
        relaunchPendingRef.current = true;
        setTimeout(() => {
          relaunchPendingRef.current = false;
          if (stateRef.current.hp > 0 && stateRef.current.phase !== 'game_over') {
            engineRef.current?.launchBall(0.5);
          }
        }, 1000);
      }

      // Update particles
      particlesRef.current.update();

      // Render
      render(timestamp);
    },
    []
  );

  const render = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    // Screen shake
    ctx.save();
    const shake = screenShakeRef.current;
    if (shake.intensity > 0) {
      const elapsed = Date.now();
      const dx = (Math.random() - 0.5) * shake.intensity;
      const dy = (Math.random() - 0.5) * shake.intensity;
      ctx.translate(dx, dy);
      shake.intensity *= 0.95;
      if (shake.intensity < 0.5) shake.intensity = 0;
    }

    // Clear
    ctx.clearRect(-10, -10, TABLE_WIDTH + 20, TABLE_HEIGHT + 20);

    // Render table
    renderTable(ctx, engineRef.current?.getTableElements(), s);

    // Render flippers
    const flippers = engineRef.current?.getFlippers();
    if (flippers) {
      renderFlippers(ctx, flippers);
    }

    // Render boss
    if (s.currentBoss) {
      renderBoss(ctx, s.currentBoss, s.bossHp, s.bossMaxHp, timestamp);
    }

    // Render spawned power-up
    if (s.spawnedPowerUp) {
      renderSpawnedPowerUp(ctx, s.spawnedPowerUp);
    }

    // Render balls
    const balls = engineRef.current?.getBalls() || [];
    ballRendererRef.current.update(balls);
    ballRendererRef.current.render(
      ctx,
      balls,
      powerUpManagerRef.current?.getActive(),
      s.phase === 'frenzy'
    );

    // Render particles
    particlesRef.current.render(ctx);

    ctx.restore();
  }, []);

  const { start: startLoop, stop: stopLoop } = useGameLoop(gameLoop);

  // Start/stop game loop
  useEffect(() => {
    startLoop();
    return () => stopLoop();
  }, [startLoop, stopLoop]);

  // Game over callback
  useEffect(() => {
    if (state.phase === 'game_over' && onGameOver) {
      setTimeout(() => {
        onGameOver({
          score: state.score,
          level: state.level,
          bossesDefeated: state.bossesDefeated,
        });
      }, 2000);
    }
  }, [state.phase, state.score, state.level, state.bossesDefeated, onGameOver]);

  // Responsive scaling
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calcScale = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const gameH = TABLE_HEIGHT + 90; // canvas + HUD + controls
      const gameW = TABLE_WIDTH;
      const scaleH = (vh - 20) / gameH;
      const scaleW = (vw - 20) / gameW;
      setScale(Math.min(scaleH, scaleW, 2.0));
    };
    calcScale();
    window.addEventListener('resize', calcScale);
    return () => window.removeEventListener('resize', calcScale);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-screen"
      style={{ background: '#0F0F1A' }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <div className="flex flex-col items-center">
          <GameHUD state={state} />
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={TABLE_WIDTH}
              height={TABLE_HEIGHT}
              className="border-2 border-[#8B7355] rounded-lg shadow-2xl"
              style={{ display: 'block' }}
            />
            {state.phase === 'waiting' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <div className="text-center">
                  <p
                    className="text-amber-400 text-sm mb-2"
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    PREMI SPAZIO
                  </p>
                  <p
                    className="text-gray-400 text-xs"
                    style={{ fontFamily: '"Rajdhani", sans-serif' }}
                  >
                    Tieni premuto per caricare
                  </p>
                </div>
              </div>
            )}
            {state.isPaused && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                <div className="text-center">
                  <p
                    className="text-amber-400 text-lg mb-2"
                    style={{ fontFamily: '"Cinzel Decorative", serif' }}
                  >
                    PAUSA
                  </p>
                  <p
                    className="text-gray-400 text-xs"
                    style={{ fontFamily: '"Rajdhani", sans-serif' }}
                  >
                    Premi P per continuare
                  </p>
                </div>
              </div>
            )}
          </div>
          <div
            className="mt-2 text-gray-500 text-xs text-center"
            style={{ fontFamily: '"Rajdhani", sans-serif' }}
          >
            {'A/\u2190 Flipper SX | D/\u2192 Flipper DX | SPAZIO Lancio | P Pausa | \u2191 Tilt'}
          </div>
        </div>
      </div>
    </div>
  );
}
