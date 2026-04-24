import React, { useMemo, useState } from 'react';

const initialMembers = [
  { id: 'M001', name: '佐藤', point: 1240 },
  { id: 'M002', name: '田中', point: 980 },
  { id: 'M003', name: '鈴木', point: 860 },
  { id: 'M004', name: '高橋', point: 720 },
];

const initialMatches = [
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

const iconMap = {
  trophy: '🏆',
  user: '👤',
  history: '🕘',
  coins: '🪙',
  settings: '⚙️',
  plus: '＋',
  users: '👥',
  chart: '📊',
  medal: '🥇',
  home: '🏠',
  save: '💾',
};

function Icon({ name, className = '' }) {
  return (
    <span aria-hidden="true" className={`inline-flex h-5 w-5 items-center justify-center text-base ${className}`}>
      {iconMap[name] || '•'}
    </span>
  );
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function buildStats(members, matches) {
  return members.map((member) => {
    const rows = matches.flatMap((match) =>
      match.players
        .filter((p) => p.memberId === member.id)
        .map((p) => ({ ...p, date: match.date, matchId: match.id }))
    );
    const games = rows.length;
    const avgRankValue = games ? rows.reduce((sum, r) => sum + Number(r.rank), 0) / games : 0;
    const wins = rows.filter((r) => Number(r.rank) === 1).length;
    const seconds = rows.filter((r) => Number(r.rank) === 2).length;
    const thirds = rows.filter((r) => Number(r.rank) === 3).length;
    const fourths = rows.filter((r) => Number(r.rank) === 4).length;
    const earned = rows.reduce((sum, r) => sum + Number(r.pointDelta || 0), 0);
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

function runBuildStatsTests() {
  const stats = buildStats(initialMembers, initialMatches);
  const sato = stats.find((m) => m.id === 'M001');
  const tanaka = stats.find((m) => m.id === 'M002');
  const empty = buildStats([{ id: 'M999', name: 'テスト', point: 0 }], [])[0];

  console.assert(sato.avgRank === '1.50', 'M001 average rank should be 1.50');
  console.assert(sato.currentPoint === 1340, 'M001 current point should include +100 earned points');
  console.assert(tanaka.wins === 1, 'M002 should have one first-place finish');
  console.assert(empty.avgRank === '-', 'Member with no matches should show - for average rank');
  console.assert(empty.currentPoint === 0, 'Member with no matches should keep base points');
}

runBuildStatsTests();

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className="rounded-2xl bg-slate-100 p-3">
          <Icon name={icon} />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [members, setMembers] = useState(initialMembers);
  const [matches, setMatches] = useState(initialMatches);
  const [active, setActive] = useState('home');
  const [selectedMemberId, setSelectedMemberId] = useState('M001');
  const [newMemberName, setNewMemberName] = useState('');
  const [pointMemberId, setPointMemberId] = useState('M001');
  const [pointDelta, setPointDelta] = useState('');
  const [matchDate, setMatchDate] = useState('2026-04-24');
  const [matchPlayers, setMatchPlayers] = useState([
    { memberId: 'M001', rank: '1', score: '42000', pointDelta: '80' },
    { memberId: 'M002', rank: '2', score: '31000', pointDelta: '30' },
    { memberId: 'M003', rank: '3', score: '21000', pointDelta: '-20' },
    { memberId: 'M004', rank: '4', score: '6000', pointDelta: '-50' },
  ]);
  const [message, setMessage] = useState('');

  const stats = useMemo(() => buildStats(members, matches), [members, matches]);
  const selected = stats.find((m) => m.id === selectedMemberId) || stats[0];
  const ranking = [...stats].sort((a, b) => a.avgRankValue - b.avgRankValue || b.currentPoint - a.currentPoint);

  const tabs = [
    { id: 'home', label: 'ホーム', icon: 'home' },
    { id: 'stats', label: '個人成績', icon: 'chart' },
    { id: 'ranking', label: 'ランキング', icon: 'trophy' },
    { id: 'history', label: '対戦履歴', icon: 'history' },
    { id: 'admin', label: '店舗管理', icon: 'settings' },
  ];

  const addMember = () => {
    const name = newMemberName.trim();
    if (!name) {
      setMessage('会員名を入力してください。');
      return;
    }
    const nextId = `M${String(members.length + 1).padStart(3, '0')}`;
    const nextMembers = [...members, { id: nextId, name, point: 0 }];
    setMembers(nextMembers);
    setNewMemberName('');
    setSelectedMemberId(nextId);
    setPointMemberId(nextId);
    setMessage(`${name}さんを登録しました。`);
  };

  const updatePoint = () => {
    const delta = Number(pointDelta);
    if (!Number.isFinite(delta)) {
      setMessage('ポイント増減には数値を入力してください。');
      return;
    }
    setMembers((prev) => prev.map((m) => (m.id === pointMemberId ? { ...m, point: m.point + delta } : m)));
    setPointDelta('');
    setMessage('ポイントを更新しました。ユーザー側表示にも反映されています。');
  };

  const saveMatch = () => {
    const cleaned = matchPlayers
      .filter((p) => p.memberId)
      .map((p) => ({
        memberId: p.memberId,
        rank: Number(p.rank),
        score: Number(p.score),
        pointDelta: Number(p.pointDelta),
      }));

    const hasInvalidNumber = cleaned.some(
      (p) => !Number.isFinite(p.rank) || !Number.isFinite(p.score) || !Number.isFinite(p.pointDelta)
    );
    const duplicateMember = new Set(cleaned.map((p) => p.memberId)).size !== cleaned.length;

    if (cleaned.length < 2) {
      setMessage('対戦結果は2名以上入力してください。');
      return;
    }
    if (hasInvalidNumber) {
      setMessage('順位・スコア・ポイント増減には数値を入力してください。');
      return;
    }
    if (duplicateMember) {
      setMessage('同じ会員が重複しています。別々の会員を選択してください。');
      return;
    }

    setMatches([{ id: Date.now(), date: matchDate, players: cleaned }, ...matches]);
    setActive('ranking');
    setMessage('対戦結果を保存しました。ランキング・個人成績・履歴に反映されています。');
  };

  const updateMatchPlayer = (index, field, value) => {
    setMatchPlayers((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  };

  if (!selected) {
    return <div className="p-6">会員データがありません。</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6 rounded-3xl bg-slate-950 px-6 py-6 text-white shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-300">麻雀DANRAN MVP Prototype</p>
              <h1 className="mt-1 text-2xl font-bold md:text-3xl">成績・ランキング・ポイント管理Webアプリ</h1>
              <p className="mt-2 text-sm text-slate-300">店舗入力からユーザー表示への反映を確認する初回版プロトタイプです。</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
              <p className="text-slate-300">選択中ユーザー</p>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-slate-900"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}（{m.id}）</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {message && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <nav className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={classNames(
                'flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition',
                active === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-100'
              )}
            >
              <Icon name={tab.icon} />
              {tab.label}
            </button>
          ))}
        </nav>

        {active === 'home' && (
          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard icon="coins" label="現在ポイント" value={`${selected.currentPoint} pt`} sub="手動更新＋対戦結果を反映" />
              <StatCard icon="chart" label="平均順位" value={selected.avgRank} sub={`${selected.games} 対戦`} />
              <StatCard icon="medal" label="1着回数" value={`${selected.wins} 回`} sub="個人成績に反映" />
              <StatCard icon="trophy" label="月間順位" value={`${ranking.findIndex((m) => m.id === selected.id) + 1} 位`} sub="平均順位ランキング" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold">ユーザー側で見える情報</h2>
                <p className="mt-2 text-sm text-slate-500">個人成績、ランキング、対戦履歴、ポイントをスマホ・PCで確認できます。</p>
                <div className="mt-4 space-y-3">
                  {['ログイン後ホーム', '個人成績', 'ランキング', '対戦履歴', 'ポイント表示'].map((item) => (
                    <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium">{item}</div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold">店舗側で行う操作</h2>
                <p className="mt-2 text-sm text-slate-500">スタッフが会員・対戦結果・ポイントを入力すると、ユーザー表示へ反映されます。</p>
                <div className="mt-4 space-y-3">
                  {['会員管理', '対戦結果入力', 'ポイント手動更新', 'ランキング自動反映'].map((item) => (
                    <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium">{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {active === 'stats' && (
          <section className="space-y-6">
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3"><Icon name="user" /></div>
                <div>
                  <h2 className="text-xl font-bold">{selected.name}さんの個人成績</h2>
                  <p className="text-sm text-slate-500">会員番号：{selected.id}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-5">
              <StatCard icon="chart" label="平均順位" value={selected.avgRank} />
              <StatCard icon="medal" label="1着" value={`${selected.wins}回`} />
              <StatCard icon="medal" label="2着" value={`${selected.seconds}回`} />
              <StatCard icon="medal" label="3着" value={`${selected.thirds}回`} />
              <StatCard icon="medal" label="4着" value={`${selected.fourths}回`} />
            </div>
          </section>
        )}

        {active === 'ranking' && (
          <section className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">月間ランキング</h2>
                <p className="text-sm text-slate-500">MVPではランキング1種類に絞って実装します。平均順位が低い順、同順位の場合はポイントが高い順です。</p>
              </div>
              <Icon name="trophy" className="text-2xl" />
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="bg-slate-100 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3">順位</th>
                    <th className="px-4 py-3">会員名</th>
                    <th className="px-4 py-3">平均順位</th>
                    <th className="px-4 py-3">対戦数</th>
                    <th className="px-4 py-3">ポイント</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((m, index) => (
                    <tr key={m.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-bold">{index + 1}</td>
                      <td className="px-4 py-3">{m.name}</td>
                      <td className="px-4 py-3">{m.avgRank}</td>
                      <td className="px-4 py-3">{m.games}</td>
                      <td className="px-4 py-3">{m.currentPoint} pt</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {active === 'history' && (
          <section className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold">{selected.name}さんの対戦履歴</h2>
            <p className="mt-1 text-sm text-slate-500">日付ごとの順位・スコア・ポイント増減を表示します。</p>
            <div className="mt-4 space-y-3">
              {selected.history.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">まだ履歴がありません。</div>
              ) : (
                selected.history.map((h) => (
                  <div key={`${h.matchId}-${h.memberId}`} className="grid gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm md:grid-cols-4">
                    <div><span className="text-slate-500">日付：</span>{h.date}</div>
                    <div><span className="text-slate-500">順位：</span>{h.rank}位</div>
                    <div><span className="text-slate-500">スコア：</span>{h.score}</div>
                    <div><span className="text-slate-500">ポイント：</span>{h.pointDelta > 0 ? '+' : ''}{h.pointDelta} pt</div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {active === 'admin' && (
          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2">
                <Icon name="users" />
                <h2 className="text-lg font-bold">会員管理</h2>
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="会員名"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
                <button onClick={addMember} className="rounded-2xl bg-slate-900 px-4 py-3 text-white"><Icon name="plus" /></button>
              </div>
              <div className="mt-4 space-y-2">
                {members.map((m) => (
                  <div key={m.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                    {m.name} <span className="text-slate-400">/ {m.id}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100 lg:col-span-2">
              <div className="flex items-center gap-2">
                <Icon name="save" />
                <h2 className="text-lg font-bold">対戦結果入力</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">保存するとランキング・個人成績・履歴へ反映されます。</p>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="mt-4 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
              <div className="mt-4 space-y-3">
                {matchPlayers.map((row, idx) => (
                  <div key={idx} className="grid gap-2 rounded-2xl bg-slate-50 p-3 md:grid-cols-4">
                    <select
                      value={row.memberId}
                      onChange={(e) => updateMatchPlayer(idx, 'memberId', e.target.value)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    >
                      {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <input
                      value={row.rank}
                      onChange={(e) => updateMatchPlayer(idx, 'rank', e.target.value)}
                      placeholder="順位"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                    <input
                      value={row.score}
                      onChange={(e) => updateMatchPlayer(idx, 'score', e.target.value)}
                      placeholder="スコア"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                    <input
                      value={row.pointDelta}
                      onChange={(e) => updateMatchPlayer(idx, 'pointDelta', e.target.value)}
                      placeholder="ポイント増減"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
              <button onClick={saveMatch} className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700">
                対戦結果を保存して反映
              </button>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100 lg:col-span-3">
              <div className="flex items-center gap-2">
                <Icon name="coins" />
                <h2 className="text-lg font-bold">ポイント手動更新</h2>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                <select value={pointMemberId} onChange={(e) => setPointMemberId(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                  {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input
                  value={pointDelta}
                  onChange={(e) => setPointDelta(e.target.value)}
                  placeholder="例：100 / -50"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
                <button onClick={updatePoint} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700">ポイント更新</button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
