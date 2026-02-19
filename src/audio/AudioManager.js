let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'square', volume = 0.15) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

function playNoise(duration, volume = 0.08) {
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch {
    // Audio not available
  }
}

export const SFX = {
  flipper() {
    playTone(800, 0.05, 'square', 0.08);
  },

  bumperHit() {
    playTone(440, 0.1, 'triangle', 0.12);
    playTone(880, 0.08, 'sine', 0.08);
  },

  bumperActiveHit() {
    playTone(660, 0.12, 'sawtooth', 0.1);
    playTone(1320, 0.1, 'sine', 0.08);
  },

  ramp() {
    playTone(523, 0.15, 'sine', 0.1);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.1), 80);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.1), 160);
  },

  comboLetter(index) {
    const notes = [262, 294, 330, 349, 392]; // C D E F G
    playTone(notes[index], 0.2, 'sine', 0.12);
  },

  comboComplete() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 0.3, 'sine', 0.15), i * 100);
    });
  },

  bossTargetHit() {
    playTone(220, 0.2, 'sawtooth', 0.12);
    playNoise(0.1, 0.1);
  },

  bossDefeated() {
    const notes = [392, 494, 587, 784];
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 0.4, 'sine', 0.18), i * 120);
    });
    setTimeout(() => playNoise(0.3, 0.1), 400);
  },

  bossSpawn() {
    playTone(110, 0.5, 'sawtooth', 0.15);
    playTone(82, 0.6, 'square', 0.1);
  },

  powerUpCollect() {
    playTone(880, 0.1, 'sine', 0.12);
    setTimeout(() => playTone(1100, 0.1, 'sine', 0.12), 60);
    setTimeout(() => playTone(1320, 0.15, 'sine', 0.12), 120);
  },

  powerUpEnd() {
    playTone(600, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(400, 0.15, 'sine', 0.1), 80);
  },

  drain() {
    playTone(150, 0.3, 'sawtooth', 0.12);
    playTone(100, 0.4, 'square', 0.08);
  },

  heal() {
    playTone(660, 0.15, 'sine', 0.1);
    setTimeout(() => playTone(880, 0.2, 'sine', 0.12), 100);
  },

  launch() {
    playNoise(0.15, 0.1);
    playTone(200, 0.1, 'sawtooth', 0.08);
  },

  slingshot() {
    playTone(600, 0.06, 'square', 0.08);
  },

  spinner() {
    playTone(1200, 0.04, 'sine', 0.05);
  },

  frenzyStart() {
    const notes = [262, 330, 392, 523, 660, 784];
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 0.2, 'sine', 0.15), i * 60);
    });
  },

  frenzyEnd() {
    playTone(400, 0.3, 'sine', 0.1);
    setTimeout(() => playTone(300, 0.3, 'sine', 0.1), 150);
    setTimeout(() => playTone(200, 0.4, 'sine', 0.1), 300);
  },

  gameOver() {
    const notes = [392, 330, 262, 196];
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 0.5, 'sine', 0.12), i * 300);
    });
  },

  tilt() {
    playTone(200, 0.3, 'square', 0.15);
    setTimeout(() => playTone(150, 0.3, 'square', 0.15), 200);
  },

  legendary() {
    const notes = [523, 659, 784, 1047, 1319, 1568];
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 0.25, 'sine', 0.18), i * 80);
    });
  },
};

// Background music using oscillators
let musicInterval = null;
let currentPhase = null;

const MUSIC_PATTERNS = {
  exploration: {
    notes: [196, 220, 262, 220, 196, 165, 196, 220],
    tempo: 300,
    type: 'triangle',
    volume: 0.04,
  },
  boss_fight: {
    notes: [147, 165, 175, 196, 175, 165, 147, 131],
    tempo: 200,
    type: 'sawtooth',
    volume: 0.04,
  },
  frenzy: {
    notes: [262, 330, 392, 523, 392, 330, 262, 392],
    tempo: 120,
    type: 'square',
    volume: 0.04,
  },
};

export function startMusic(phase) {
  if (phase === currentPhase) return;
  stopMusic();
  currentPhase = phase;
  const pattern = MUSIC_PATTERNS[phase];
  if (!pattern) return;

  let noteIndex = 0;
  musicInterval = setInterval(() => {
    playTone(
      pattern.notes[noteIndex % pattern.notes.length],
      pattern.tempo / 1000 * 0.8,
      pattern.type,
      pattern.volume
    );
    noteIndex++;
  }, pattern.tempo);
}

export function stopMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
    currentPhase = null;
  }
}
