export function buildStats(members, matches) {
  return members.map((member) => {
    const rows = matches.flatMap((match) =>
      match.players
        .filter((player) => player.memberId === member.id)
        .map((player) => ({ ...player, date: match.date, matchId: match.id }))
    );

    const games = rows.length;
    const avgRankValue = games
      ? rows.reduce((sum, row) => sum + Number(row.rank), 0) / games
      : 0;
    const wins = rows.filter((row) => Number(row.rank) === 1).length;
    const seconds = rows.filter((row) => Number(row.rank) === 2).length;
    const thirds = rows.filter((row) => Number(row.rank) === 3).length;
    const fourths = rows.filter((row) => Number(row.rank) === 4).length;
    const earned = rows.reduce((sum, row) => sum + Number(row.pointDelta || 0), 0);

    return {
      ...member,
      games,
      avgRank: games ? avgRankValue.toFixed(2) : '-',
      avgRankValue: games ? avgRankValue : Number.POSITIVE_INFINITY,
      wins,
      seconds,
      thirds,
      fourths,
      currentPoint: member.point + earned,
      history: rows.sort((a, b) => Number(b.matchId) - Number(a.matchId)),
    };
  });
}

export function buildRanking(stats) {
  return [...stats].sort((a, b) => a.avgRankValue - b.avgRankValue || b.currentPoint - a.currentPoint);
}
