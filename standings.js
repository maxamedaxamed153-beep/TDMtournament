import { db } from "./firebase.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { $, esc } from "./ui.js";
import { computeStandings } from "./scoring.js";
import { current, onTournament } from "./tournament.js";

let teams = [], matches = [];

function draw() {
  const rules = { winPts: Number(current?.winPts ?? 3), killPts: Number(current?.killPts ?? 1) };
  const rows = computeStandings(teams, matches, rules);
  $("#st-body").innerHTML = rows.map(r =>
    `<tr class="r${r.rank}"><td>${r.rank}</td><td>${esc(r.name)}</td><td>${r.played}</td><td>${r.wins}</td><td>${r.kills}</td><td><b>${r.points}</b></td></tr>`
  ).join("") || `<tr><td colspan="6">Wali xog ma jirto</td></tr>`;
}

export function initStandings() {
  onSnapshot(collection(db, "teams"), s => { teams = s.docs.map(d => ({ id: d.id, ...d.data() })); draw(); });
  onSnapshot(collection(db, "matches"), s => { matches = s.docs.map(d => ({ id: d.id, ...d.data() })); draw(); });
  onTournament(draw);
}
