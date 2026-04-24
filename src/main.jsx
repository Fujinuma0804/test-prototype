import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { initialMatches, initialMembers } from './data';
import { buildRanking, buildStats } from './stats';

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

function Icon({ name }) {
  return <span className="icon" aria-hidden="true">{iconMap[name] || '•'}</span>;
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="stat-card">
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
      <div className="stat-icon"><Icon name={icon} /></div>
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
  const [message, setMessage] = useState('');
  const [matchPlayers, setMatchPlayers] = useState([
    { memberId: 'M001', rank: '1', score: '42000', pointDelta: '80' },
    { memberId: 'M002', rank: '2', score: '31000', pointDelta: '30' },
    { memberId: 'M003', rank: '3', score: '21000', pointDelta: '-20' },
    { memberId: 'M004', rank: '4', score: '6000', pointDelta: '-50' },
  ]);

  const stats = useMemo(() => buildStats(members, matches), [members, matches]);
  const ranking = useMemo(() => buildRanking(stats), [stats]);
  const selected = stats.find((member) => member.id === selectedMemberId) || stats[0];

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

    setMembers((prev) => prev.map((member) => (
      member.id === pointMemberId ? { ...member, point: member.point + delta } : member
    )));
    setPointDelta('');
    setMessage('ポイントを更新しました。ユーザー側表示にも反映されています。');
  };

  const updateMatchPlayer = (index, field, value) => {
    setMatchPlayers((prev) => prev.map((row, rowIndex) => (
      rowIndex === index ? { ...row, [field]: value } : row
    )));
  };

  const saveMatch = () => {
    const cleaned = matchPlayers
      .filter((player) => player.memberId)
      .map((player) => ({
        memberId: player.memberId,
        rank: Number(player.rank),
        score: Number(player.score),
        pointDelta: Number(player.pointDelta),
      }));

    const hasInvalidNumber = cleaned.some((player) => (
      !Number.isFinite(player.rank) || !Number.isFinite(player.score) || !Number.isFinite(player.pointDelta)
    ));
    const duplicateMember = new Set(cleaned.map((player) => player.memberId)).size !== cleaned.length;

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

  if (!selected) return <div className="empty">会員データがありません。</div>;

  return (
    <div className="app">
      <main className="container">
        <header className="hero">
          <div>
            <p className="hero-sub">麻雀DANRAN MVP Prototype</p>
            <h1>成績・ランキング・ポイント管理Webアプリ</h1>
            <p className="hero-text">店舗入力からユーザー表示への反映を確認する初回版プロトタイプです。</p>
          </div>
          <div className="user-select-card">
            <p>選択中ユーザー</p>
            <select value={selectedMemberId} onChange={(event) => setSelectedMemberId(event.target.value)}>
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.name}（{member.id}）</option>
              ))}
            </select>
          </div>
        </header>

        {message && <div className="notice">{message}</div>}

        <nav className="tabs">
          {tabs.map((tab) => (
            <button key={tab.id} className={active === tab.id ? 'active' : ''} onClick={() => setActive(tab.id)}>
              <Icon name={tab.icon} />
              {tab.label}
            </button>
          ))}
        </nav>

        {active === 'home' && (
          <section className="section-stack">
            <div className="stat-grid four">
              <StatCard icon="coins" label="現在ポイント" value={`${selected.currentPoint} pt`} sub="手動更新＋対戦結果を反映" />
              <StatCard icon="chart" label="平均順位" value={selected.avgRank} sub={`${selected.games} 対戦`} />
              <StatCard icon="medal" label="1着回数" value={`${selected.wins} 回`} sub="個人成績に反映" />
              <StatCard icon="trophy" label="月間順位" value={`${ranking.findIndex((member) => member.id === selected.id) + 1} 位`} sub="平均順位ランキング" />
            </div>
            <div className="two-column">
              <InfoPanel title="ユーザー側で見える情報" description="個人成績、ランキング、対戦履歴、ポイントをスマホ・PCで確認できます。" items={['ログイン後ホーム', '個人成績', 'ランキング', '対戦履歴', 'ポイント表示']} />
              <InfoPanel title="店舗側で行う操作" description="スタッフが会員・対戦結果・ポイントを入力すると、ユーザー表示へ反映されます。" items={['会員管理', '対戦結果入力', 'ポイント手動更新', 'ランキング自動反映']} />
            </div>
          </section>
        )}

        {active === 'stats' && (
          <section className="section-stack">
            <div className="panel profile-panel">
              <div className="profile-icon"><Icon name="user" /></div>
              <div>
                <h2>{selected.name}さんの個人成績</h2>
                <p>会員番号：{selected.id}</p>
              </div>
            </div>
            <div className="stat-grid five">
              <StatCard icon="chart" label="平均順位" value={selected.avgRank} />
              <StatCard icon="medal" label="1着" value={`${selected.wins}回`} />
              <StatCard icon="medal" label="2着" value={`${selected.seconds}回`} />
              <StatCard icon="medal" label="3着" value={`${selected.thirds}回`} />
              <StatCard icon="medal" label="4着" value={`${selected.fourths}回`} />
            </div>
          </section>
        )}

        {active === 'ranking' && (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>月間ランキング</h2>
                <p>MVPではランキング1種類に絞って実装します。平均順位が低い順、同順位の場合はポイントが高い順です。</p>
              </div>
              <Icon name="trophy" />
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>順位</th>
                    <th>会員名</th>
                    <th>平均順位</th>
                    <th>対戦数</th>
                    <th>ポイント</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((member, index) => (
                    <tr key={member.id}>
                      <td className="rank">{index + 1}</td>
                      <td>{member.name}</td>
                      <td>{member.avgRank}</td>
                      <td>{member.games}</td>
                      <td>{member.currentPoint} pt</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {active === 'history' && (
          <section className="panel">
            <h2>{selected.name}さんの対戦履歴</h2>
            <p className="muted">日付ごとの順位・スコア・ポイント増減を表示します。</p>
            <div className="history-list">
              {selected.history.length === 0 ? (
                <div className="empty-row">まだ履歴がありません。</div>
              ) : (
                selected.history.map((history) => (
                  <div key={`${history.matchId}-${history.memberId}`} className="history-row">
                    <div><span>日付：</span>{history.date}</div>
                    <div><span>順位：</span>{history.rank}位</div>
                    <div><span>スコア：</span>{history.score}</div>
                    <div><span>ポイント：</span>{history.pointDelta > 0 ? '+' : ''}{history.pointDelta} pt</div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {active === 'admin' && (
          <section className="admin-grid">
            <div className="panel">
              <h2><Icon name="users" /> 会員管理</h2>
              <div className="inline-form">
                <input value={newMemberName} onChange={(event) => setNewMemberName(event.target.value)} placeholder="会員名" />
                <button onClick={addMember}><Icon name="plus" /></button>
              </div>
              <div className="member-list">
                {members.map((member) => (
                  <div key={member.id}>{member.name} <span>/ {member.id}</span></div>
                ))}
              </div>
            </div>

            <div className="panel match-panel">
              <h2><Icon name="save" /> 対戦結果入力</h2>
              <p className="muted">保存するとランキング・個人成績・履歴へ反映されます。</p>
              <input className="date-input" type="date" value={matchDate} onChange={(event) => setMatchDate(event.target.value)} />
              <div className="match-input-list">
                {matchPlayers.map((row, index) => (
                  <div key={index} className="match-input-row">
                    <select value={row.memberId} onChange={(event) => updateMatchPlayer(index, 'memberId', event.target.value)}>
                      {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                    </select>
                    <input value={row.rank} onChange={(event) => updateMatchPlayer(index, 'rank', event.target.value)} placeholder="順位" />
                    <input value={row.score} onChange={(event) => updateMatchPlayer(index, 'score', event.target.value)} placeholder="スコア" />
                    <input value={row.pointDelta} onChange={(event) => updateMatchPlayer(index, 'pointDelta', event.target.value)} placeholder="ポイント増減" />
                  </div>
                ))}
              </div>
              <button className="primary-button" onClick={saveMatch}>対戦結果を保存して反映</button>
            </div>

            <div className="panel point-panel">
              <h2><Icon name="coins" /> ポイント手動更新</h2>
              <div className="point-form">
                <select value={pointMemberId} onChange={(event) => setPointMemberId(event.target.value)}>
                  {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
                <input value={pointDelta} onChange={(event) => setPointDelta(event.target.value)} placeholder="例：100 / -50" />
                <button onClick={updatePoint}>ポイント更新</button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function InfoPanel({ title, description, items }) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      <div className="info-list">
        {items.map((item) => <div key={item}>{item}</div>)}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
