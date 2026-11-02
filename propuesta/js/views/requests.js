import { types } from "../data.js";
import * as store from "../store.js";
import { esc, icon, initials, shortDate, stagger, toast } from "../ui.js";

const STATUS = { pending: ["Pendiente", "is-pending"], approved: ["Aprobada", "is-approved"], rejected: ["Rechazada", "is-rejected"], delivered: ["Entregada", "is-delivered"] };

function row(r, i, it) {
  const p = store.personById(r.person);
  const [label, cls] = STATUS[r.status];
  return `<li class="req animate-row-in" style="${stagger(i)}">
    <div class="req__head"><span class="num folio">${r.folio}</span><span class="pill ${cls}">${label}</span><span class="muted small">${shortDate(r.date)}</span></div>
    <p class="req__what">${icon(types[r.type].icon)}<b>${types[r.type].label}</b>${it ? ` · <span class="avatar is-xs" aria-hidden="true">${esc(initials(p.name))}</span>${esc(p.name)} <span class="muted">(${esc(p.area)})</span>` : ""}</p>
    <p class="req__why">${esc(r.reason)}</p>
    ${it && r.status === "pending" ? `<div class="req__actions"><a class="btn btn--primary btn--sm" href="#/handover?request=${r.folio}">${icon("send")}Aprobar y entregar</a><button class="btn btn--ghost btn--sm" type="button" data-reject="${r.folio}">Rechazar</button></div>` : ""}
    ${r.res ? `<a class="link small" href="#/letters/${r.res}">Ver carta ${r.res}</a>` : ""}
  </li>`;
}

export default {
  title: "Solicitudes",
  render() {
    const it = store.role() === "it";
    const all = store.requests().filter((r) => it || r.person === store.me());
    const pending = all.filter((r) => r.status === "pending");
    const rest = all.filter((r) => r.status !== "pending");
    return `<div class="wrap${it ? "" : " narrow"}">
      <header class="page-head"><h1 class="h1">${it ? "Solicitudes de equipo" : "Mis solicitudes"}</h1><p class="lede">${it ? "Lo que la gente pide. Al aprobar, entregas desde el almacén con su carta de resguardo." : "Pide equipo y sigue en qué va."}</p></header>
      <div class="${it ? "" : "stack"}">
        ${it ? "" : `<form class="card stack" data-ask novalidate>
          <h2 class="h4">Pedir equipo</h2>
          <fieldset class="field"><legend>Qué necesitas</legend><div class="chip-row" role="radiogroup">${Object.entries(types).map(([k, t], i) => `<label class="chip-radio"><input type="radio" name="type" value="${k}"${i === 0 ? " checked" : ""}><span>${icon(t.icon)}${t.label}</span></label>`).join("")}</div></fieldset>
          <div class="field"><label for="why">Para qué</label><textarea id="why" class="input input--area" rows="3" maxlength="300" placeholder="Cuéntale a IT para qué lo necesitas"></textarea><p class="field__help" id="why-help">Con una razón clara se aprueba más rápido.</p></div>
          <button class="btn btn--primary" type="submit">${icon("send")}Mandar solicitud</button>
        </form>`}
        <section class="section"><div class="section__head"><h2 class="h3">Pendientes · ${pending.length}</h2></div>${pending.length ? `<ul class="reqs" role="list">${pending.map((r, i) => row(r, i, it)).join("")}</ul>` : `<p class="muted">Nada pendiente.</p>`}</section>
        <section class="section"><div class="section__head"><h2 class="h3">Atendidas</h2></div><ul class="reqs" role="list">${rest.map((r, i) => row(r, i, it)).join("")}</ul></section>
      </div>
    </div>`;
  },
  bind(root, p, q, go, rerender) {
    root.addEventListener("click", (e) => {
      const r = e.target.closest("[data-reject]");
      if (!r) return;
      store.decideRequest(r.dataset.reject, "rejected");
      toast("Solicitud rechazada; la persona recibe el aviso");
      rerender();
    });
    root.querySelector("[data-ask]")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const reason = root.querySelector("#why").value.trim();
      if (reason.length < 10) {
        const help = root.querySelector("#why-help");
        help.textContent = "Escribe para qué lo necesitas (al menos 10 letras).";
        help.classList.add("is-error");
        return root.querySelector("#why").focus();
      }
      const folio = store.askFor({ type: e.currentTarget.querySelector('input[name="type"]:checked').value, reason });
      toast(`Solicitud ${folio} enviada a soporte de IT`);
      rerender();
    });
  },
};
