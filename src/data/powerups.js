export const POWERUPS = [
  {
    id: 'multiball',
    name: 'Multiball',
    icon: '\u26A1',
    duration: 15000,
    rarity: 'rare',
    color: '#FFD700',
    instant: false,
  },
  {
    id: 'fireball',
    name: 'Fireball',
    icon: '\u{1F525}',
    duration: 10000,
    rarity: 'rare',
    color: '#E74C3C',
    instant: false,
  },
  {
    id: 'shield',
    name: 'Shield',
    icon: '\u{1F6E1}',
    duration: 12000,
    rarity: 'medium',
    color: '#3498DB',
    instant: false,
  },
  {
    id: 'slowmo',
    name: 'Slow-Mo',
    icon: '\u231B',
    duration: 8000,
    rarity: 'common',
    color: '#9B59B6',
    instant: false,
  },
  {
    id: 'giant',
    name: 'Giant Ball',
    icon: '\u{1F52E}',
    duration: 10000,
    rarity: 'medium',
    color: '#E67E22',
    instant: false,
  },
  {
    id: 'magnet',
    name: 'Magnet',
    icon: '\u{1F9F2}',
    duration: 8000,
    rarity: 'rare',
    color: '#C0392B',
    instant: false,
  },
  {
    id: 'heal',
    name: 'Heal',
    icon: '\u2764',
    duration: 0,
    rarity: 'common',
    color: '#2ECC71',
    instant: true,
  },
  {
    id: 'scoreboost',
    name: 'Score Boost',
    icon: '\u{1F4B0}',
    duration: 15000,
    rarity: 'medium',
    color: '#F39C12',
    instant: false,
  },
  {
    id: 'kickback',
    name: 'Kickback',
    icon: '\u{1F3F0}',
    duration: 0,
    rarity: 'medium',
    color: '#8B7355',
    instant: true,
  },
];

export function getRandomPowerUp() {
  const weights = { common: 3, medium: 2, rare: 1 };
  const weighted = POWERUPS.flatMap((p) =>
    Array(weights[p.rarity]).fill(p)
  );
  return weighted[Math.floor(Math.random() * weighted.length)];
}
