export const initialMembers = [
  { id: 'M001', name: '佐藤', point: 1240 },
  { id: 'M002', name: '田中', point: 980 },
  { id: 'M003', name: '鈴木', point: 860 },
  { id: 'M004', name: '高橋', point: 720 },
];

export const initialMatches = [
  {
    id: 1,
    date: '2026-04-24',
    players: [
      { memberId: 'M001', rank: 1, score: 42000, pointDelta: 80 },
      { memberId: 'M002', rank: 2, score: 31000, pointDelta: 30 },
      { memberId: 'M003', rank: 3, score: 21000, pointDelta: -20 },
      { memberId: 'M004', rank: 4, score: 6000, pointDelta: -50 },
    ],
  },
  {
    id: 2,
    date: '2026-04-23',
    players: [
      { memberId: 'M002', rank: 1, score: 39000, pointDelta: 70 },
      { memberId: 'M001', rank: 2, score: 29000, pointDelta: 20 },
      { memberId: 'M004', rank: 3, score: 24000, pointDelta: -10 },
      { memberId: 'M003', rank: 4, score: 8000, pointDelta: -40 },
    ],
  },
];
