// Xisaabinta dhibcaha iyo rank-ka. Dhibco = guulo * winPts + kills * killPts
export function computeStandings(teams, matches, rules) {
  const map = new Map(teams.map(t => [t.id, { id: t.id, name: t.name, played: 0, wins: 0, kills: 0, points: 0 }]));
  for (const m of matches) {
    for (const k of ["A", "B"]) {
      const r = map.get(m["team" + k]);
      if (!r) continue;
      r.played++;
      r.kills += Number(m["kills" + k]) || 0;
      if (m.winner === m["team" + k]) r.wins++;
    }
  }
  for (const r of map.values()) r.points = r.wins * rules.winPts + r.kills * rules.killPts;
  return [...map.values()]
    .sort((a, b) => b.points - a.points || b.kills - a.kills || b.wins - a.wins)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
