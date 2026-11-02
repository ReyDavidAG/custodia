import { mark } from "../art.js";
import * as store from "../store.js";
import { esc, icon, shortDate, typeOf } from "../ui.js";

function find(res) {
  const saved = store.letterByFolio(res);
  if (saved) return saved;
  const items = store.assets().filter((a) => a.history.some((e) => e.res === res && e.kind === "handover"));
  if (!items.length) return null;
  const ev = items[0].history.find((e) => e.res === res && e.kind === "handover");
  return { res, personId: ev.person, folios: items.map((a) => a.folio), date: ev.date, evidence: { kind: "pdf", name: `resguardo-${res}.pdf` }, by: "Soporte de IT", seed: true };
}

export default {
  title: (p) => p[0],
  render([res], query) {
    const l = find(res);
    if (!l || (store.role() === "member" && l.personId !== store.me())) return null;
    const p = store.personById(l.personId);
    const items = l.folios.map(store.assetByFolio);
    const returned = items.filter((a) => a.res !== res).length;
    return `<div class="wrap narrow">
      ${query.new ? `<div class="done-head animate-page-in"><span class="done-head__mark">${icon("check")}</span><h1 class="h2">Entrega registrada</h1><p class="lede">La carta quedó firmada y el equipo ya aparece a nombre de ${esc(p.name)}.</p></div>` : `<a class="back-link" href="#/inventory">${icon("arrowLeft")}Inventario</a>`}
      <article class="doc doc--final">
        <header class="doc__head">${mark("doc__mark")}<div><p class="doc__kicker">Carta de resguardo</p><p class="doc__folio num">${l.res}</p></div><span class="stamp${returned === items.length ? " is-closed" : ""}">${returned === items.length ? "Devuelto" : "Vigente"}</span></header>
        <p class="doc__line">Recibe: <b>${esc(p.name)}</b> · ${esc(p.position)} · ${esc(p.area)} · No. <span class="num">${p.number}</span></p>
        <p class="doc__line">Entrega: <b>${esc(l.by)}</b> · ${shortDate(l.date)}</p>
        <table class="doc__table"><thead><tr><th>Folio</th><th>Equipo</th><th>Serie</th></tr></thead><tbody>
          ${items.map((a) => `<tr${a.res !== res ? ' class="is-back"' : ""}><td class="num">${a.folio}</td><td>${esc(typeOf(a).label)} ${esc(a.brand)} ${esc(a.model)}${a.parts.length ? `<small>+ ${esc(a.parts.join(", "))}</small>` : ""}</td><td class="num">${esc(a.serial)}</td></tr>`).join("")}
        </tbody></table>
        <p class="doc__terms">Me comprometo a cuidar el equipo, usarlo para mi trabajo y devolverlo completo cuando me lo pidan o deje la empresa.</p>
        <div class="doc__sign">
          ${l.evidence.kind === "firma" ? `<img src="${l.evidence.image}" alt="Firma de ${esc(p.name)}">` : `<span class="doc__file">${icon(l.evidence.kind === "pdf" ? "file" : "camera")}${esc(l.evidence.name)}${l.seed ? " · de ejemplo" : ""}</span>`}
          <span class="doc__signline">Firma de quien recibe</span>
        </div>
      </article>
      <div class="btn-row"><button class="btn btn--ghost" type="button" onclick="window.print()">${icon("file")}Imprimir o guardar PDF</button><a class="btn btn--primary" href="#/assets/${items[0].folio}">Ver el equipo</a></div>
    </div>`;
  },
};
