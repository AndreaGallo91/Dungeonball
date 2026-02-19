import { useState } from 'react';
import { getRank } from '../../data/scoring.js';
import { saveToLeaderboard } from '../../utils/storage.js';

export default function GameOverScreen({ stats, onRestart, onMenu }) {
  const { score, level, bossesDefeated } = stats;
  const rank = getRank(score);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (name.trim()) {
      saveToLeaderboard({
        name: name.trim().slice(0, 16),
        score,
        level,
        bossesDefeated,
      });
      setSaved(true);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #1A1A2E 0%, #0F0F1A 70%)',
        minHeight: '100vh',
      }}
    >
      {/* Game Over Title */}
      <h1
        className="text-3xl text-red-500 mb-2"
        style={{
          fontFamily: '"Cinzel Decorative", serif',
          textShadow: '0 0 15px rgba(231,76,60,0.4)',
        }}
      >
        Game Over
      </h1>

      {/* Rank */}
      <div className="my-4 text-center">
        <div
          className="text-6xl font-bold mb-1"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            color:
              rank.rank === 'S'
                ? '#FFD700'
                : rank.rank === 'A'
                ? '#E74C3C'
                : rank.rank === 'B'
                ? '#F39C12'
                : '#9B59B6',
            textShadow: '0 0 20px currentColor',
          }}
        >
          {rank.rank}
        </div>
        <p
          className="text-amber-400 text-sm"
          style={{ fontFamily: '"Cinzel Decorative", serif' }}
        >
          {rank.title}
        </p>
      </div>

      {/* Stats */}
      <div
        className="bg-gray-900/50 rounded-lg p-4 mb-4 w-72 border border-gray-700"
        style={{ fontFamily: '"Rajdhani", sans-serif' }}
      >
        <div className="flex justify-between text-gray-400 mb-2">
          <span>Punteggio</span>
          <span
            className="text-amber-400 font-bold"
            style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '11px' }}
          >
            {score.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-gray-400 mb-2">
          <span>Livello</span>
          <span className="text-white font-bold">{level}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Boss Sconfitti</span>
          <span className="text-white font-bold">{bossesDefeated}</span>
        </div>
      </div>

      {/* Name input */}
      {!saved ? (
        <div className="flex flex-col items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Il tuo nome..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded text-center w-48 focus:border-amber-500 focus:outline-none"
            style={{ fontFamily: '"Rajdhani", sans-serif' }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-6 py-1.5 text-sm bg-amber-600 text-black rounded hover:bg-amber-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold"
            style={{ fontFamily: '"Rajdhani", sans-serif' }}
          >
            Salva Punteggio
          </button>
        </div>
      ) : (
        <p className="text-green-400 text-sm mb-4" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
          \u2714 Punteggio salvato!
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onRestart}
          className="px-8 py-2 text-sm font-bold text-black bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg hover:from-amber-300 hover:to-yellow-400 transition-all"
          style={{ fontFamily: '"Cinzel Decorative", serif' }}
        >
          Rigioca
        </button>
        <button
          onClick={onMenu}
          className="px-8 py-2 text-sm font-semibold text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800 transition-all"
          style={{ fontFamily: '"Rajdhani", sans-serif' }}
        >
          Menu
        </button>
      </div>
    </div>
  );
}
