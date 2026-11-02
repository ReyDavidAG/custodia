import { bindEvidence, evidenceField } from "../evidence.js";
import * as store from "../store.js";
import { esc, icon, personChip, toast, typeOf } from "../ui.js";

export default {
  title: "Recibir devolución",
  render([folio]) {
    const a = store.assetByFolio(folio);
    if (!a) return null;
    if (a.status !== "assigned") return `<div class="wrap narrow"><div class="empty"><p class="h3">Este equipo no está asignado</p><a class="btn" href="#/assets/${a.folio}">Ver el equipo</a></div></div>`;
    const p = store.personById(a.holder);
    const pieces = [`${typeOf(a).label} ${a.brand} ${a.model}`, ...a.parts];
    return `<div class="wrap narrow">
      <a class="back-link" href="#/assets/${a.folio}">${icon("arrowLeft")}${a.folio}</a>
      <header class="page-head"><h1 class="h1">Recibir devolución</h1><p class="lede">Marca lo que sí regresó. Si falta algo, queda anotado en el historial.</p></header>
      <form class="stack" data-form novalidate>
        <section class="card">${personChip(p)}</section>
        <fieldset class="card field">
          <legend class="step__title">Qué regresó</legend>
          <div class="picks">${pieces.map((x, i) => `<label class="pick"><input type="checkbox" name="piece" value="${esc(x)}" checked${i === 0 ? " disabled" : ""}><span class="pick__text"><b>${esc(x)}</b>${i === 0 ? "<small>El equipo principal</small>" : ""}</span>${icon("check", "pick__check")}</label>`).join("")}</div>
        </fieldset>
        <fieldset class="card field">
          <legend class="step__title">En qué estado</legend>
          <div class="seg seg--wide" role="radiogroup"><label><input type="radio" name="condition" value="good" checked><span>${icon("check")}Buen estado</span></label><label><input type="radio" name="condition" value="damaged"><span>${icon("wrench")}Con daños</span></label></div>
          <p class="field__help">Con daños pasa directo a reparación en lugar de volver al almacén.</p>
        </fieldset>
        <div class="card">${evidenceField("rt").replace("Evidencia de entrega", "Firma de quien entrega")}</div>
        <div class="form-actions"><a class="btn btn--ghost" href="#/assets/${a.folio}">Cancelar</a><button class="btn btn--primary btn--lg" type="submit">${icon("inbox")}Registrar devolución</button></div>
      </form>
    </div>`;
  },
  bind(root, [folio], query, go) {
    const form = root.querySelector("[data-form]");
    if (!form) return;
    const ev = bindEvidence(root, "rt");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const evidence = ev.value();
      if (!evidence) return ev.fail("Falta la firma de quien entrega el equipo.");
      const missing = [...form.querySelectorAll('input[name="piece"]:not(:checked)')].map((i) => i.value);
      const condition = form.querySelector('input[name="condition"]:checked').value;
      store.giveBack(folio, { missing, condition, evidence });
      toast(condition === "damaged" ? "Recibido y mandado a reparación" : missing.length ? "Recibido; quedó anotado lo que falta" : "Recibido completo, de vuelta al almacén");
      go(`/assets/${folio}`);
    });
  },
};
