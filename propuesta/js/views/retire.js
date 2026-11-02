import * as store from "../store.js";
import { esc, icon, money, shortDate, toast } from "../ui.js";

const STEPS = [["it", "IT lo revisa", "Borra los datos y confirma si todavía sirve."], ["accounting", "Contabilidad da la baja", "Saca el activo fijo de los libros."], ["trueque", "Se postula a El Trueque", "Si sirve, pasa a la tienda con existencias = 1."]];

function stepper(a) {
  const done = { it: !!a.retire?.it, accounting: !!a.retire?.accounting, trueque: a.status === "trueque" };
  return `<ol class="stepper" role="list">${STEPS.map(([k, t, d], i) => `<li class="stepper__item${done[k] ? " is-done" : ""}${!done[k] && (i === 0 || done[STEPS[i - 1][0]]) ? " is-current" : ""}"><span class="stepper__n">${done[k] ? icon("check") : i + 1}</span><span><b>${t}</b><small>${d}</small></span></li>`).join("")}</ol>`;
}

function itForm(a) {
  const checks = ["Los datos están borrados (formateo seguro)", "Se retiraron cuentas y licencias del equipo", "Se separaron los accesorios que siguen sirviendo"];
  return `<form class="card stack" data-it novalidate>
    <h2 class="h4">Revisión de IT</h2>
    <div class="picks">${checks.map((c) => `<label class="pick"><input type="checkbox" name="check" required><span class="pick__text"><b>${c}</b></span>${icon("check", "pick__check")}</label>`).join("")}</div>
    <div class="field"><label for="why">Motivo</label><input id="why" class="input" maxlength="120" placeholder="Ej. batería que ya no carga, pantalla con pixeles muertos"></div>
    <button class="btn btn--primary" type="submit">${icon("archive")}Dar de baja</button>
  </form>`;
}

function truequeCard(a) {
  const n = store.suggestedCacaos(a);
  return `<form class="card stack trueque" data-trueque novalidate>
    <h2 class="h4">${icon("store")}Postular a El Trueque</h2>
    <p class="muted small">Precio sugerido según valor de compra (${money(a.value)}) y antigüedad (${shortDate(a.bought)}). RH lo revisa antes de publicarlo.</p>
    <div class="field"><label for="cac">Precio en cacaos</label><input id="cac" class="input num" inputmode="numeric" value="${n}"></div>
    <button class="btn btn--cacao" type="submit"><span>Postular por <span data-n>${n}</span> cacaos</span></button>
  </form>`;
}

export default {
  title: "Baja de equipo",
  render([folio]) {
    const a = store.assetByFolio(folio);
    if (!a) return null;
    const r = store.role();
    let body = "";
    if (a.status === "stock" || a.status === "repair") body = r === "it" ? itForm(a) : `<p class="hint">${icon("info")}<span>La baja la empieza soporte de IT.</span></p>`;
    else if (a.status === "retired" && !a.retire?.accounting) body = r === "accounting" ? `<div class="card stack"><h2 class="h4">Baja contable</h2><p class="muted">IT ya revisó el equipo. Al confirmar, el activo sale de los libros y IT puede postularlo a El Trueque.</p><dl class="facts"><div><dt>Valor de compra</dt><dd>${money(a.value)}</dd></div><div><dt>Comprado</dt><dd>${shortDate(a.bought)}</dd></div></dl><button class="btn btn--primary" type="button" data-accounting>${icon("calc")}Confirmar baja del activo</button></div>` : `<p class="hint is-warn">${icon("clock")}<span>Esperando a contabilidad para dar la baja del activo.</span></p>`;
    else if (a.status === "retired") body = r === "it" ? truequeCard(a) : `<p class="hint">${icon("info")}<span>Baja completa. IT decide si se postula a El Trueque.</span></p>`;
    else if (a.status === "trueque") body = `<p class="hint is-ok">${icon("store")}<span>Ya está en El Trueque. Cuando alguien la cambie, IT la entrega con el cupón.</span></p>`;
    return `<div class="wrap narrow">
      <a class="back-link" href="#/assets/${a.folio}">${icon("arrowLeft")}${a.folio}</a>
      <header class="page-head"><h1 class="h1">Baja de ${esc(a.brand)} ${esc(a.model)}</h1><p class="lede">Tres pasos y ninguno se salta: así un equipo no sale de la empresa con datos ni sigue cobrando en los libros.</p></header>
      ${stepper(a)}
      ${body}
    </div>`;
  },
  bind(root, [folio], query, go, rerender) {
    root.querySelector("[data-it]")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const unchecked = e.currentTarget.querySelectorAll('input[name="check"]:not(:checked)').length;
      if (unchecked) return toast("Marca los tres puntos de la revisión antes de dar de baja");
      store.retireByIT(folio, root.querySelector("#why").value.trim() || "Fin de vida útil");
      toast("Dado de baja por IT; avisamos a contabilidad");
      rerender();
    });
    root.querySelector("[data-accounting]")?.addEventListener("click", () => {
      store.approveByAccounting(folio);
      toast("Baja del activo confirmada");
      rerender();
    });
    const tq = root.querySelector("[data-trueque]");
    tq?.querySelector("#cac").addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "");
      tq.querySelector("[data-n]").textContent = e.target.value || "0";
    });
    tq?.addEventListener("submit", (e) => {
      e.preventDefault();
      const n = Number(tq.querySelector("#cac").value);
      if (!n) return toast("Pon un precio en cacaos");
      store.postToTrueque(folio, n);
      toast("Mandado a El Trueque: RH revisa el precio");
      rerender();
    });
  },
};
