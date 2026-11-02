import * as store from "../store.js";
import { assetTag, esc, icon, money, personChip, shortDate, stagger, warrantyLeft } from "../ui.js";

const KIND = {
  in: ["Entró al almacén", "box"],
  handover: ["Entregado", "send"],
  return: ["Devuelto", "inbox"],
  repair: ["A reparación", "wrench"],
  retire: ["IT lo dio de baja", "archive"],
  accounting: ["Contabilidad dio la baja del activo", "calc"],
  trueque: ["Postulado a El Trueque", "store"],
};

function history(a) {
  return `<ol class="timeline" role="list">${[...a.history].reverse().map((e, i) => {
    const [label, ic] = KIND[e.kind];
    const p = e.person ? store.personById(e.person) : null;
    return `<li class="timeline__item animate-row-in" data-kind="${e.kind}" style="${stagger(i)}">
      <span class="timeline__dot">${icon(ic)}</span>
      <span class="timeline__body"><b>${label}${p ? ` · ${esc(p.name)}` : ""}</b>
        <small>${shortDate(e.date)}${e.res ? ` · <a href="#/letters/${e.res}" class="num">${e.res}</a>` : ""}${e.note ? ` · ${esc(e.note)}` : ""}${e.evidence ? ` · evidencia: ${esc(e.evidence.kind)}` : ""}</small></span>
    </li>`;
  }).join("")}</ol>`;
}

function actions(a) {
  const r = store.role();
  const out = [];
  if (r === "it" && a.status === "stock") out.push(`<a class="btn btn--primary btn--block" href="#/handover?asset=${a.folio}">${icon("send")}Entregar a alguien</a>`);
  if (r === "it" && a.status === "assigned") out.push(`<a class="btn btn--primary btn--block" href="#/assets/${a.folio}/return">${icon("inbox")}Recibir devolución</a>`);
  if (r === "it" && (a.status === "stock" || a.status === "repair")) out.push(`<a class="btn btn--block" href="#/assets/${a.folio}/retire">${icon("archive")}Dar de baja</a>`);
  if (a.status === "retired") out.push(`<a class="btn ${r === "accounting" && !a.retire?.accounting ? "btn--primary" : ""} btn--block" href="#/assets/${a.folio}/retire">${icon("archive")}Ver la baja</a>`);
  if (a.status === "trueque") out.push(`<p class="hint">${icon("store")}<span>Publicada en El Trueque. Cuando alguien la cambie, IT la entrega con el cupón.</span></p>`);
  return out.join("");
}

export default {
  title: (p) => p[0],
  render([folio]) {
    const a = store.assetByFolio(folio);
    if (!a || (store.role() === "member" && a.holder !== store.me())) return null;
    const holder = a.holder ? store.personById(a.holder) : null;
    const facts = [["Marca y modelo", `${a.brand} ${a.model}`], ["Serie", a.serial], ["Compra", shortDate(a.bought)], ["Garantía", warrantyLeft(a)], ["Valor de compra", a.value ? money(a.value) : "—"], ["Accesorios", a.parts.length ? a.parts.join(", ") : "Ninguno"]];
    return `<div class="wrap">
      <a class="back-link" href="#${store.role() === "member" ? "/mine" : "/inventory"}">${icon("arrowLeft")}${store.role() === "member" ? "Mi equipo" : "Inventario"}</a>
      <div class="asset">
        <div class="asset__side">
          ${assetTag(a, { link: false, big: true })}
          <div class="asset__actions">${actions(a)}</div>
        </div>
        <div class="asset__main">
          <section class="card">
            <h2 class="h4">Ficha</h2>
            <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
          </section>
          ${holder ? `<section class="card"><h2 class="h4">En custodia de</h2>${personChip(holder)}<a class="doc-link" href="#/letters/${a.res}">${icon("file")}<span>Carta de resguardo <b class="num">${a.res}</b></span>${icon("arrowRight")}</a></section>` : ""}
          ${a.missing?.length ? `<p class="hint is-warn">${icon("info")}<span>En la última devolución faltó: ${esc(a.missing.join(", "))}.</span></p>` : ""}
          <section class="card"><h2 class="h4">Historial de custodia</h2>${history(a)}</section>
        </div>
      </div>
    </div>`;
  },
};
