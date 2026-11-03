import { db } from "./firebase.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { $, toast } from "./ui.js";
import { onTournament, regState, current } from "./tournament.js";

const MSG = { none: "Hadda tartan ma jiro.", soon: "Is diiwaangelintu wali ma furna.", closed: "Waqtigii is diiwaangelinta wuu dhammaaday.", open: "" };
const STATUS = { pending: ["Waa la sugayaa, admin-ku wali ma eegin.", "pending"], approved: ["Waa lagu aqbalay. Guul!", "ok"], rejected: ["Codsigaaga waa la diiday.", "err"] };

function sync() {
  const s = regState(current);
  $("#reg-note").textContent = MSG[s];
  $("#reg-btn").disabled = s !== "open";
}

export function initRegister() {
  onTournament(sync);
  setInterval(sync, 1000);

  $("#reg-form").addEventListener("submit", async e => {
    e.preventDefault();
    if (regState(current) !== "open") return toast("Is diiwaangelintu ma furna", "err");
    const id = $("#f-id").value.trim(), name = $("#f-name").value.trim(), phone = $("#f-phone").value.trim();
    if (!/^\d{5,15}$/.test(id)) return toast("ID-gu waa inuu noqdaa 5-15 lambar", "err");
    if (name.length < 2 || !/^[+\d\s-]{7,16}$/.test(phone)) return toast("Hubi magaca iyo lambarka", "err");
    try {
      const ref = doc(db, "players", id);
      if ((await getDoc(ref)).exists()) return toast("ID-gan horey ayaa loo diiwaan geliyay", "err");
      await setDoc(ref, { gameId: id, name, phone, status: "pending", createdAt: serverTimestamp() });
      e.target.reset();
      toast("Codsigaaga waa la diray. Sug ogolaanshaha admin-ka.");
    } catch { toast("Khalad ayaa dhacay, mar kale isku day", "err"); }
  });

  $("#chk-btn").addEventListener("click", async () => {
    const id = $("#chk-id").value.trim();
    if (!id) return;
    try {
      const s = await getDoc(doc(db, "players", id));
      const [txt, cls] = s.exists() ? STATUS[s.data().status] : ["ID-gan lama helin.", "err"];
      $("#chk-out").textContent = txt;
      $("#chk-out").className = cls;
    } catch { toast("Khalad ayaa dhacay", "err"); }
  });
}
