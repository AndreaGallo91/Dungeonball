import { getLeaderboard } from '../../utils/storage.js';
import { getRank } from '../../data/scoring.js';

export default function LeaderboardScreen({ onBack }) {
  const board = getLeaderboard();

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #1A1A2E 0%, #0F0F1A 70%)',
        minHeight: '100vh',
      }}
    >
      <h1
        className="text-2xl text-amber-400 mb-6"
        style={{
          fontFamily: '"Cinzel Decorative", serif',
          textShadow: '0 0 15px rgba(255,215,0,0.3)',
        }}
      >
        Classifica
      </h1>

      <div
        className="w-80 bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden"
        style={{ fontFamily: '"Rajdhani", sans-serif' }}
      >
        {/* Header */}
        <div className="flex px-3 py-2 bg-gray-800/50 text-gray-500 text-xs font-bold">
          <span className="w-8">#</span>
          <span className="flex-1">Nome</span>
          <span className="w-24 text-right">Punteggio</span>
          <span className="w-12 text-right">Lv</span>
        </div>

        {/* Entries */}
        {board.length === 0 ? (
          <div className="px-3 py-8 text-center text-gray-600 text-sm">
            Nessun punteggio ancora.
            <br />
            Gioca per entrare in classifica!
          </div>
        ) : (
          board.map((entry, i) => {
            const rank = getRank(entry.score);
            return (
              <div
                key={i}
                className={`flex px-3 py-2 items-center ${
                  i % 2 === 0 ? 'bg-gray-900/30' : ''
                } ${i === 0 ? 'bg-amber-900/20' : ''}`}
              >
                <span
                  className={`w-8 text-sm font-bold ${
                    i === 0
                      ? 'text-amber-400'
                      : i === 1
                      ? 'text-gray-300'
                      : i === 2
                      ? 'text-orange-400'
                      : 'text-gray-500'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-white text-sm truncate">
                  <span
                    className="mr-1 text-xs"
                    style={{
                      color:
                        rank.rank === 'S'
                          ? '#FFD700'
                          : rank.rank === 'A'
                          ? '#E74C3C'
                          : '#9B59B6',
                    }}
                  >
                    [{rank.rank}]
                  </span>
                  {entry.name}
                </span>
                <span
                  className="w-24 text-right text-amber-300 text-xs"
                  style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '9px' }}
                >
                  {entry.score.toLocaleString()}
                </span>
                <span className="w-12 text-right text-gray-400 text-xs">
                  {entry.level}
                </span>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={onBack}
        className="mt-6 px-8 py-2 text-sm font-semibold text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800 transition-all"
        style={{ fontFamily: '"Rajdhani", sans-serif' }}
      >
        Indietro
      </button>
    </div>
  );
}
