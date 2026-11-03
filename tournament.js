import { db } from "./firebase.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export let current = null;
const subs = [];
const norm = d => ({ ...d, start: d.regStart?.toDate(), end: d.regEnd?.toDate() });

export function onTournament(cb) { subs.push(cb); cb(current); }

export function regState(t, now = new Date()) {
  if (!t || !t.start || !t.end) return "none";
  return now < t.start ? "soon" : now > t.end ? "closed" : "open";
}

onSnapshot(doc(db, "settings", "current"), s => {
  current = s.exists() ? norm(s.data()) : null;
  subs.forEach(f => f(current));
});
