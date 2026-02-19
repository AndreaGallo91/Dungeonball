const LEADERBOARD_KEY = 'dungeonball_leaderboard';

export function getLeaderboard() {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveToLeaderboard(entry) {
  const board = getLeaderboard();
  board.push({ ...entry, date: new Date().toISOString() });
  board.sort((a, b) => b.score - a.score);
  const top10 = board.slice(0, 10);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top10));
  return top10;
}
