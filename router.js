const views = [...document.querySelectorAll(".view")];
const links = [...document.querySelectorAll("#nav a")];

export function initRouter() {
  const go = () => {
    let id = (location.hash || "#home").slice(1);
    if (!document.getElementById("view-" + id)) id = "home";
    views.forEach(v => (v.hidden = v.id !== "view-" + id));
    links.forEach(a => a.classList.toggle("on", a.hash === "#" + id));
    scrollTo(0, 0);
  };
  addEventListener("hashchange", go);
  go();
}
