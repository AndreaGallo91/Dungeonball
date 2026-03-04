export default function GameHUD({ state }) {
  const {
    hp,
    maxHp,
    score,
    level,
    multiplier,
    streakCount,
    activePowerUp,
    comboCount,
    bossesDefeated,
    tiltsRemaining,
    phase,
    currentBoss,
  } = state;

  return (
    <div
      className="w-[400px] flex items-center justify-between px-3 py-2 mb-1 rounded-t-lg"
      style={{
        background: 'linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)',
        borderBottom: '2px solid #8B7355',
        fontFamily: '"Rajdhani", sans-serif',
      }}
    >
      {/* HP */}
      <div className="flex flex-col items-start">
        <div className="flex gap-0.5">
          {Array.from({ length: maxHp }).map((_, i) => (
            <span
              key={i}
              className={`text-sm ${
                i < hp ? 'text-red-500' : 'text-gray-700'
              } ${hp <= 2 && i < hp ? 'animate-pulse' : ''}`}
            >
              {i < hp ? '\u2764' : '\uD83D\uDDA4'}
            </span>
          ))}
        </div>
        <span className="text-gray-400 text-xs">
          Tilt: {'|'.repeat(tiltsRemaining)}
          {'_'.repeat(3 - tiltsRemaining)}
        </span>
      </div>

      {/* Center info */}
      <div className="flex flex-col items-center">
        <span
          className="text-amber-400 text-xs font-bold"
          style={{ fontFamily: '"Cinzel Decorative", serif', fontSize: '10px' }}
        >
          DungeonBall
        </span>
        <span className="text-gray-400 text-xs">
          Lv.{level} | Boss: {bossesDefeated}
        </span>
        {phase === 'boss_fight' && currentBoss && (
          <span className="text-red-400 text-xs animate-pulse">
            {'\u2694'} {currentBoss.name}
          </span>
        )}
        {phase === 'frenzy' && (
          <span className="text-pink-400 text-xs animate-pulse">
            {'\uD83D\uDD25'} FRENZY! {'\uD83D\uDD25'}
          </span>
        )}
      </div>

      {/* Score & multiplier */}
      <div className="flex flex-col items-end">
        <span
          className="text-amber-300 font-bold"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px',
          }}
        >
          {score.toLocaleString()}
        </span>
        {multiplier > 1 && (
          <span
            className={`text-xs font-bold ${
              multiplier >= 10
                ? 'text-yellow-300 animate-pulse'
                : multiplier >= 5
                ? 'text-orange-400'
                : 'text-green-400'
            }`}
          >
            {'\u00D7'}{multiplier} STREAK!
          </span>
        )}
        {activePowerUp && (
          <span
            className="text-xs"
            style={{ color: activePowerUp.color }}
          >
            {activePowerUp.icon} {activePowerUp.name}
          </span>
        )}
      </div>
    </div>
  );
}
