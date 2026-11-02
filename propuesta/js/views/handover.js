import { bindEvidence, evidenceField } from "../evidence.js";
import * as store from "../store.js";
import { TODAY, people } from "../data.js";
import { esc, icon, initials, shortDate, toast, typeOf } from "../ui.js";

const norm = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function personList(q, selected) {
  const words = norm(q).split(/\s+/).filter(Boolean);
  const list = people.filter((p) => words.every((w) => norm(`${p.name} ${p.number} ${p.area} ${p.position}`).includes(w)));
  if (!list.length) return `<p class="muted small pick__empty">Nadie con ese nombre o número.</p>`;
  return list.map((p) => `<label class="pick"><input type="radio" name="person" value="${p.id}"${p.id === selected ? " checked" : ""}><span class="avatar" aria-hidden="true">${esc(initials(p.name))}</span><span class="pick__text"><b>${esc(p.name)}</b><small>${esc(p.area)} · No. <span class="num">${p.number}</span></small></span>${icon("check", "pick__check")}</label>`).join("");
}

function preview(personId, folios) {
  const p = personId ? store.personById(personId) : null;
  const items = folios.map(store.assetByFolio);
  return `<p class="doc__kicker">Carta de resguardo</p>
    <p class="doc__line">Recibe: <b>${p ? esc(p.name) : "—"}</b>${p ? ` · No. <span class="num">${p.number}</span>` : ""}</p>
    <p class="doc__line">Fecha: <b>${shortDate(TODAY)}</b></p>
    <ul class="doc__items" role="list">${items.length ? items.map((a) => `<li><span class="num">${a.folio}</span> ${esc(typeOf(a).label)} ${esc(a.brand)} ${esc(a.model)}${a.parts.length ? ` <small>+ ${esc(a.parts.join(", "))}</small>` : ""}</li>`).join("") : `<li class="muted">Elige uno o más equipos</li>`}</ul>
    <p class="doc__terms">Me comprometo a cuidar el equipo, usarlo para mi trabajo y devolverlo completo cuando me lo pidan o deje la empresa.</p>`;
}

export default {
  title: "Nueva entrega",
  render(params, query) {
    if (store.role() !== "it") return `<div class="wrap narrow"><div class="empty"><p class="h3">Sólo soporte de IT entrega equipo</p><p class="muted">Si necesitas algo, pídelo desde Mis solicitudes.</p><a class="btn btn--primary" href="#/requests">Ir a solicitudes</a></div></div>`;
    const req = query.request ? store.requestByFolio(query.request) : null;
    const pre = query.asset ? [query.asset] : [];
    const avail = store.available();
    return `<div class="wrap">
      <a class="back-link" href="#/inventory">${icon("arrowLeft")}Inventario</a>
      <header class="page-head"><h1 class="h1">Nueva entrega</h1><p class="lede">Quién recibe, qué se lleva y su firma. Con eso sale la carta de resguardo.</p></header>
      ${req ? `<p class="hint is-info">${icon("inbox")}<span>Atiende la solicitud <b class="num">${req.folio}</b>: ${esc(req.reason)}</span></p>` : ""}
      <form class="handover" data-form novalidate>
        <div class="handover__steps">
          <fieldset class="card step">
            <legend class="step__title"><span class="step__n">1</span>Quién recibe</legend>
            <label class="search"><span class="sr-only">Buscar persona</span>${icon("search")}<input type="search" class="input" placeholder="Nombre, número o área" data-q></label>
            <div class="picks" role="radiogroup" aria-label="Persona" data-people>${personList("", req?.person)}</div>
          </fieldset>
          <fieldset class="card step">
            <legend class="step__title"><span class="step__n">2</span>Qué se lleva</legend>
            ${avail.length ? `<div class="picks">${avail.map((a) => `<label class="pick pick--asset"><input type="checkbox" name="asset" value="${a.folio}"${pre.includes(a.folio) || (req && !pre.length && a.type === req.type && avail.find((x) => x.type === req.type) === a) ? " checked" : ""}><span class="pick__icon">${icon(typeOf(a).icon)}</span><span class="pick__text"><b><span class="num">${a.folio}</span> · ${esc(a.brand)} ${esc(a.model)}</b><small>${esc(typeOf(a).label)}${a.parts.length ? ` · con ${esc(a.parts.join(", "))}` : ""}</small></span>${icon("check", "pick__check")}</label>`).join("")}</div>` : `<p class="muted">No hay equipo en almacén.</p>`}
          </fieldset>
          <div class="card step">
            <p class="step__title"><span class="step__n">3</span>Firma de quien recibe</p>
            ${evidenceField("ho")}
          </div>
          <div class="form-actions"><a class="btn btn--ghost" href="#/inventory">Cancelar</a><button class="btn btn--primary btn--lg" type="submit">${icon("file")}Emitir carta de resguardo</button></div>
        </div>
        <aside class="doc doc--draft" aria-label="Vista previa de la carta" data-preview>${preview(req?.person, pre)}</aside>
      </form>
    </div>`;
  },
  bind(root, params, query, go) {
    const form = root.querySelector("[data-form]");
    if (!form) return;
    const ev = bindEvidence(root, "ho");
    const state = () => ({ personId: form.querySelector('input[name="person"]:checked')?.value, folios: [...form.querySelectorAll('input[name="asset"]:checked')].map((i) => i.value) });
    const refresh = () => {
      const s = state();
      root.querySelector("[data-preview]").innerHTML = preview(s.personId, s.folios);
    };
    refresh();
    let t;
    form.querySelector("[data-q]").addEventListener("input", (e) => {
      clearTimeout(t);
      const selected = state().personId;
      t = setTimeout(() => (form.querySelector("[data-people]").innerHTML = personList(e.target.value, selected)), 300);
    });
    form.addEventListener("change", refresh);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const s = state();
      if (!s.personId) {
        toast("Elige quién recibe el equipo");
        return form.querySelector("[data-q]").focus();
      }
      if (!s.folios.length) return toast("Elige al menos un equipo");
      const evidence = ev.value();
      if (!evidence) return ev.fail("Falta la firma o la foto de la hoja firmada.");
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner" aria-hidden="true"></span>Emitiendo…`;
      setTimeout(() => {
        const letter = store.handover({ ...s, evidence, request: query.request });
        go(`/letters/${letter.res}?new=1`);
      }, 600);
    });
  },
};
