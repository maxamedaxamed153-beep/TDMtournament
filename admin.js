import { db, auth } from "./firebase.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, doc, onSnapshot, setDoc, updateDoc, addDoc, deleteDoc, getDocs, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { $, esc, toast } from "./ui.js";
import { onTournament } from "./tournament.js";

let players = [], teams = [], started = false, filled = false;
const toLocal = d => (d ? new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16) : "");
const ST = { pending: "Sugaya", approved: "La aqbalay", rejected: "La diiday" };

function drawPlayers() {
  const order = { pending: 0, approved: 1, rejected: 2 };
  $("#ad-players").innerHTML = [...players].sort((a, b) => order[a.status] - order[b.status]).map(p =>
    `<tr><td>${esc(p.gameId)}</td><td>${esc(p.name)}</td><td>${esc(p.phone)}</td><td class="${p.status === "approved" ? "ok" : p.status === "rejected" ? "err" : "pending"}">${ST[p.status]}</td>
    <td><button data-id="${esc(p.id)}" data-st="approved">Aqbal</button><button data-id="${esc(p.id)}" data-st="rejected">Diid</button></td></tr>`
  ).join("") || `<tr><td colspan="5">Codsi ma jiro</td></tr>`;
}

function drawTeams() {
  $("#ad-teams").innerHTML = teams.map(t => `<span>${esc(t.name)} (${t.players?.length || 0}) <a href="#admin" data-del="${t.id}" style="color:#e5484d">x</a></span>`).join("");
  const opts = teams.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join("");
  $("#m-a").innerHTML = opts; $("#m-b").innerHTML = opts;
}

function watch() {
  onSnapshot(collection(db, "players"), s => { players = s.docs.map(d => ({ id: d.id, ...d.data() })); drawPlayers(); });
  onSnapshot(collection(db, "teams"), s => { teams = s.docs.map(d => ({ id: d.id, ...d.data() })); drawTeams(); });
  onSnapshot(collection(db, "matches"), s => {
    $("#ad-matches").innerHTML = s.docs.map(d => {
      const m = d.data(), n = id => esc(teams.find(t => t.id === id)?.name || "?");
      return `<p>${n(m.teamA)} ${m.killsA} - ${m.killsB} ${n(m.teamB)} <a href="#admin" data-mdel="${d.id}" style="color:#e5484d">x</a></p>`;
    }).join("");
  });
  onTournament(t => {
    if (filled || !t) return;
    filled = true;
    $("#s-name").value = t.name || ""; $("#s-start").value = toLocal(t.start); $("#s-end").value = toLocal(t.end);
    $("#s-win").value = t.winPts ?? 3; $("#s-kill").value = t.killPts ?? 1;
  });
}

export function initAdmin() {
  $("#ad-login").addEventListener("submit", async e => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, $("#ad-mail").value, $("#ad-pass").value); }
    catch { toast("Gelitaanku wuu fashilmay", "err"); }
  });
  $("#ad-out").onclick = () => signOut(auth);
  onAuthStateChanged(auth, u => {
    $("#ad-gate").hidden = !!u; $("#ad-panel").hidden = !u;
    if (u && !started) { started = true; watch(); }
  });

  $("#ad-settings").addEventListener("submit", async e => {
    e.preventDefault();
    const s = new Date($("#s-start").value), en = new Date($("#s-end").value);
    if (en <= s) return toast("Xiritaanku waa inuu ka dambeeyaa furitaanka", "err");
    try {
      await setDoc(doc(db, "settings", "current"), { name: $("#s-name").value.trim(), regStart: Timestamp.fromDate(s), regEnd: Timestamp.fromDate(en), winPts: +$("#s-win").value, killPts: +$("#s-kill").value });
      toast("Waa la kaydiyay");
    } catch { toast("Ma kaydsanayn", "err"); }
  });

  $("#ad-players").addEventListener("click", async e => {
    const b = e.target.closest("button[data-id]");
    if (b) await updateDoc(doc(db, "players", b.dataset.id), { status: b.dataset.st });
  });

  $("#ad-team").addEventListener("submit", async e => {
    e.preventDefault();
    const ids = [...new Set($("#t-ids").value.split(",").map(x => x.trim()).filter(Boolean))];
    const bad = ids.filter(i => players.find(p => p.id === i)?.status !== "approved");
    if (bad.length) return toast("Lama aqbalin: " + bad.join(", "), "err");
    if (teams.some(t => t.players?.some(i => ids.includes(i)))) return toast("Ciyaaryahan horey koox ayuu ugu jiraa", "err");
    await addDoc(collection(db, "teams"), { name: $("#t-new").value.trim(), players: ids });
    e.target.reset(); toast("Kooxda waa lagu daray");
  });

  $("#ad-match").addEventListener("submit", async e => {
    e.preventDefault();
    const a = $("#m-a").value, b = $("#m-b").value;
    if (!a || !b || a === b) return toast("Dooro laba koox oo kala duwan", "err");
    await addDoc(collection(db, "matches"), { teamA: a, teamB: b, killsA: +$("#m-ka").value, killsB: +$("#m-kb").value, winner: $("#m-w").value === "A" ? a : b, createdAt: serverTimestamp() });
    toast("Natiijada waa la kaydiyay");
  });

  document.addEventListener("click", async e => {
    const t = e.target.closest("[data-del]"), m = e.target.closest("[data-mdel]");
    if (t) { e.preventDefault(); await deleteDoc(doc(db, "teams", t.dataset.del)); }
    if (m) { e.preventDefault(); await deleteDoc(doc(db, "matches", m.dataset.mdel)); }
  });

  $("#ad-reset").onclick = async () => {
    if (!confirm("Xogta ciyaartoyda, kooxaha iyo natiijooyinka oo dhan ayaa la tirtirayaa. Hubaal?")) return;
    for (const c of ["players", "teams", "matches"]) {
      const s = await getDocs(collection(db, c));
      await Promise.all(s.docs.map(d => deleteDoc(d.ref)));
    }
    await deleteDoc(doc(db, "settings", "current"));
    filled = false; toast("Tartan cusub ayaa diyaar ah");
  };
}
