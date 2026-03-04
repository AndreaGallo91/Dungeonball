import { useState, useEffect } from 'react';
import { getLeaderboard } from '../../utils/storage.js';

export default function MainMenu({ onStart, onLeaderboard, onHowToPlay }) {
  const [bestScore, setBestScore] = useState(0);
  const [torchFlicker, setTorchFlicker] = useState(0);

  useEffect(() => {
    const board = getLeaderboard();
    if (board.length > 0) {
      setBestScore(board[0].score);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTorchFlicker(Math.random());
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #1A1A2E 0%, #0F0F1A 70%)',
        minHeight: '100vh',
      }}
    >
      {/* Torch effects */}
      <div
        className="absolute top-20 left-10 w-8 h-8 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(255,215,0,${0.3 + torchFlicker * 0.2}) 0%, transparent 70%)`,
          filter: 'blur(8px)',
        }}
      />
      <div
        className="absolute top-20 right-10 w-8 h-8 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(255,215,0,${0.2 + torchFlicker * 0.3}) 0%, transparent 70%)`,
          filter: 'blur(8px)',
        }}
      />

      {/* Rune decorations */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-amber-900/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-amber-900/30 to-transparent" />

      {/* Title */}
      <div className="text-center mb-12 relative">
        <div className="absolute -inset-10 bg-purple-900/10 blur-3xl rounded-full" />
        <h1
          className="text-4xl md:text-5xl text-amber-400 mb-3 relative"
          style={{
            fontFamily: '"Cinzel Decorative", serif',
            textShadow: '0 0 20px rgba(255,215,0,0.3), 0 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          DungeonBall
        </h1>
        <p
          className="text-purple-300/80 text-sm italic relative"
          style={{ fontFamily: '"Rajdhani", sans-serif' }}
        >
          {'Il flipper incontra il dungeon. Ogni combo \u00E8 un incantesimo.'}
        </p>
      </div>

      {/* Menu buttons */}
      <div className="flex flex-col gap-4 items-center relative z-10">
        <button
          onClick={onStart}
          className="px-10 py-3 text-lg font-bold text-black bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg hover:from-amber-300 hover:to-yellow-400 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-900/30"
          style={{
            fontFamily: '"Cinzel Decorative", serif',
          }}
        >
          GIOCA
        </button>

        <button
          onClick={onHowToPlay}
          className="px-8 py-2 text-sm font-semibold text-amber-300 border border-amber-700 rounded-lg hover:bg-amber-900/20 transition-all"
          style={{ fontFamily: '"Rajdhani", sans-serif' }}
        >
          Come si Gioca
        </button>

        <button
          onClick={onLeaderboard}
          className="px-8 py-2 text-sm font-semibold text-purple-300 border border-purple-700 rounded-lg hover:bg-purple-900/20 transition-all"
          style={{ fontFamily: '"Rajdhani", sans-serif' }}
        >
          Classifica
        </button>
      </div>

      {/* Best score */}
      {bestScore > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
            Miglior Punteggio
          </p>
          <p
            className="text-amber-400 text-sm"
            style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '11px' }}
          >
            {bestScore.toLocaleString()}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-4 text-center">
        <p className="text-gray-600 text-xs" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
          {'A/\u2190 \u2192/D = Flipper | SPAZIO = Lancio | \u2191 = Tilt'}
        </p>
      </div>
    </div>
  );
}
