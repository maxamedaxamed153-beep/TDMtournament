import { $, fmt } from "./ui.js";
import { onTournament, regState } from "./tournament.js";

const LABEL = { none: "Tartan lama furin", soon: "Is diiwaangelintu wali ma furna", open: "Is diiwaangelintu waa furan tahay", closed: "Is diiwaangelintu way xirantay" };
let t = null;
const left = d => {
  const s = Math.max(0, Math.floor((d - new Date()) / 1000));
  return `${Math.floor(s / 3600)}s ${Math.floor((s % 3600) / 60)}d ${s % 60}ss`;
};

function draw() {
  const s = regState(t);
  $("#t-name").textContent = t?.name || "Tartan ma jiro";
  $("#t-badge").textContent = LABEL[s];
  $("#t-badge").className = "badge " + s;
  $("#t-count").textContent = s === "soon" ? "Wuu furmayaa: " + left(t.start) : s === "open" ? "Wuu xirmayaa: " + left(t.end) : "";
  $("#t-dates").textContent = t?.start ? `${fmt(t.start)} – ${fmt(t.end)}` : "";
  $("#go-register").classList.toggle("disabled", s !== "open");
}

export function initHome() {
  onTournament(x => { t = x; draw(); });
  setInterval(draw, 1000);
}
