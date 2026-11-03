export const $ = (s, r = document) => r.querySelector(s);
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const fmt = d => (d ? d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—");
export function toast(msg, type = "ok") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast show " + (type === "err" ? "err" : "");
  clearTimeout(toast.id);
  toast.id = setTimeout(() => (t.className = "toast"), 3200);
}
