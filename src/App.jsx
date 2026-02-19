import { useState, useCallback } from 'react';
import MainMenu from './components/screens/MainMenu.jsx';
import PinballGame from './components/game/PinballGame.jsx';
import GameOverScreen from './components/screens/GameOverScreen.jsx';
import LeaderboardScreen from './components/screens/LeaderboardScreen.jsx';
import HowToPlay from './components/screens/HowToPlay.jsx';

function App() {
  const [screen, setScreen] = useState('menu');
  const [gameStats, setGameStats] = useState(null);
  const [gameKey, setGameKey] = useState(0);

  const handleStart = useCallback(() => {
    setGameKey((k) => k + 1);
    setScreen('game');
  }, []);

  const handleGameOver = useCallback((stats) => {
    setGameStats(stats);
    setScreen('gameover');
  }, []);

  const handleRestart = useCallback(() => {
    setGameKey((k) => k + 1);
    setScreen('game');
  }, []);

  const handleMenu = useCallback(() => {
    setScreen('menu');
  }, []);

  const handleLeaderboard = useCallback(() => {
    setScreen('leaderboard');
  }, []);

  const handleHowToPlay = useCallback(() => {
    setScreen('howtoplay');
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center" style={{ background: '#0F0F1A' }}>
      {screen === 'menu' && (
        <MainMenu
          onStart={handleStart}
          onLeaderboard={handleLeaderboard}
          onHowToPlay={handleHowToPlay}
        />
      )}
      {screen === 'game' && (
        <PinballGame key={gameKey} onGameOver={handleGameOver} />
      )}
      {screen === 'gameover' && gameStats && (
        <GameOverScreen
          stats={gameStats}
          onRestart={handleRestart}
          onMenu={handleMenu}
        />
      )}
      {screen === 'leaderboard' && (
        <LeaderboardScreen onBack={handleMenu} />
      )}
      {screen === 'howtoplay' && (
        <HowToPlay onBack={handleMenu} />
      )}
    </div>
  );
}

export default App;
