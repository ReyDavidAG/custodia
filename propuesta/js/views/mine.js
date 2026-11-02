import { shelf } from "../art.js";
import * as store from "../store.js";
import { assetTag, icon, toast } from "../ui.js";

export default {
  title: "Mi equipo",
  render() {
    const mine = store.assetsOf(store.me());
    const res = [...new Set(mine.map((a) => a.res))];
    return `<div class="wrap">
      <header class="page-head page-head--row"><div><h1 class="h1">Mi equipo</h1><p class="lede">Lo que tienes a tu nombre. Si algo falla, avísale a IT desde aquí.</p></div><a class="btn btn--primary" href="#/requests">${icon("plus")}Pedir equipo</a></header>
      ${mine.length ? `<div class="atags">${mine.map((a, i) => assetTag(a, { i })).join("")}</div>
        <div class="doc-links">${res.map((r) => `<a class="doc-link" href="#/letters/${r}">${icon("file")}<span>Tu carta de resguardo <b class="num">${r}</b></span>${icon("arrowRight")}</a>`).join("")}</div>
        <button class="btn btn--ghost" type="button" data-report>${icon("wrench")}Reportar una falla</button>`
      : `<div class="empty"><div class="empty__art">${shelf("Nada a tu nombre")}</div><p class="h3">No tienes equipo a tu nombre</p><p class="muted">Si lo necesitas para tu trabajo, pídelo y soporte de IT lo revisa.</p><a class="btn btn--primary" href="#/requests">Pedir equipo</a></div>`}
    </div>`;
  },
  bind(root) {
    root.querySelector("[data-report]")?.addEventListener("click", () => toast("Abrimos un reporte con soporte de IT; te escriben hoy"));
  },
};
