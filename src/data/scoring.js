import { RANKS } from '../utils/constants.js';

export function getRank(score) {
  for (const r of RANKS) {
    if (score >= r.min) return r;
  }
  return RANKS[RANKS.length - 1];
}
