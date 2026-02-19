export const BOSSES = [
  {
    id: 1,
    name: 'Ratto Gigante',
    emoji: '\u{1F400}',
    hp: 3,
    attack: null,
    attackName: null,
    points: 10000,
    color: '#8B6914',
  },
  {
    id: 2,
    name: 'Ragno delle Ombre',
    emoji: '\u{1F577}',
    hp: 5,
    attack: 'slowBall',
    attackName: 'Ragnatele',
    points: 25000,
    color: '#4A0080',
  },
  {
    id: 3,
    name: 'Scheletro Guerriero',
    emoji: '\u{1F480}',
    hp: 7,
    attack: 'blockRamp',
    attackName: 'Muro di Ossa',
    points: 50000,
    color: '#D4D4D4',
  },
  {
    id: 4,
    name: 'Mago Oscuro',
    emoji: '\u{1F9D9}',
    hp: 9,
    attack: 'flickerTargets',
    attackName: 'Invisibilit\u00E0',
    points: 75000,
    color: '#6B0099',
  },
  {
    id: 5,
    name: 'Drago Antico',
    emoji: '\u{1F409}',
    hp: 12,
    attack: 'widenDrain',
    attackName: 'Fuoco',
    points: 100000,
    color: '#CC0000',
  },
];

export function getBoss(bossIndex) {
  if (bossIndex < BOSSES.length) {
    return { ...BOSSES[bossIndex] };
  }
  const base = BOSSES[BOSSES.length - 1];
  const extra = bossIndex - BOSSES.length + 1;
  return {
    ...base,
    id: bossIndex + 1,
    name: `Boss Infinito ${extra}`,
    emoji: '\u{1F479}',
    hp: 12 + extra * 2,
    attack: 'combined',
    attackName: 'Attacco Combinato',
    points: 100000 + extra * 20000,
  };
}
