import { describe, expect, it } from 'vitest';
import { initialMatches, initialMembers } from './data';
import { buildRanking, buildStats } from './stats';

describe('buildStats', () => {
  it('calculates average rank and current points', () => {
    const stats = buildStats(initialMembers, initialMatches);
    const sato = stats.find((member) => member.id === 'M001');

    expect(sato.avgRank).toBe('1.50');
    expect(sato.currentPoint).toBe(1340);
    expect(sato.games).toBe(2);
  });

  it('counts ranks correctly', () => {
    const stats = buildStats(initialMembers, initialMatches);
    const tanaka = stats.find((member) => member.id === 'M002');

    expect(tanaka.wins).toBe(1);
    expect(tanaka.seconds).toBe(1);
    expect(tanaka.thirds).toBe(0);
    expect(tanaka.fourths).toBe(0);
  });

  it('handles members with no matches', () => {
    const stats = buildStats([{ id: 'M999', name: 'テスト', point: 0 }], []);

    expect(stats[0].avgRank).toBe('-');
    expect(stats[0].currentPoint).toBe(0);
    expect(stats[0].games).toBe(0);
  });
});

describe('buildRanking', () => {
  it('sorts by average rank then current points', () => {
    const stats = buildStats(initialMembers, initialMatches);
    const ranking = buildRanking(stats);

    expect(ranking[0].id).toBe('M001');
    expect(ranking[1].id).toBe('M002');
  });
});
