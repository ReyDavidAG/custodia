import * as store from "../store.js";
import { esc, icon, money, shortDate, stagger, typeOf } from "../ui.js";

export default {
  title: "Bajas por confirmar",
  render() {
    const queue = store.assets().filter((a) => a.status === "retired" && !a.retire?.accounting);
    const done = store.assets().filter((a) => (a.status === "retired" && a.retire?.accounting) || a.status === "trueque");
    const row = (a, i, act) => `<li class="req animate-row-in" style="${stagger(i)}"><div class="req__head"><span class="num folio">${a.folio}</span><span class="muted small">${shortDate(a.history.at(-1).date)}</span></div><p class="req__what">${icon(typeOf(a).icon)}<b>${esc(a.brand)} ${esc(a.model)}</b> · ${money(a.value)} · comprado ${shortDate(a.bought)}</p>${act ? `<div class="req__actions"><a class="btn btn--primary btn--sm" href="#/assets/${a.folio}/retire">${icon("calc")}Revisar y confirmar</a></div>` : ""}</li>`;
    return `<div class="wrap narrow">
      <header class="page-head"><p class="kicker">Contabilidad</p><h1 class="h1">Bajas por confirmar</h1><p class="lede">IT ya revisó estos equipos. Falta sacarlos de los libros.</p></header>
      <section class="section"><div class="section__head"><h2 class="h3">Pendientes · ${queue.length}</h2></div>${queue.length ? `<ul class="reqs" role="list">${queue.map((a, i) => row(a, i, true)).join("")}</ul>` : `<p class="muted">Todo al día.</p>`}</section>
      <section class="section"><div class="section__head"><h2 class="h3">Ya confirmadas</h2></div><ul class="reqs" role="list">${done.map((a, i) => row(a, i, false)).join("")}</ul></section>
      <p class="demo-note">${icon("info")}Valores de ejemplo.</p>
    </div>`;
  },
};
