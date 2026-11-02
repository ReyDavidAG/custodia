import { desk, wordmark } from "../art.js";
import * as store from "../store.js";
import { esc, icon, initials } from "../ui.js";

let pending = null;

const numberStep = (error = "", value = "") => `<form class="signin__card animate-page-in" data-step="number" novalidate>
  <h2 class="h2">Entra con tu número</h2>
  <p class="muted">El mismo de tu gafete.</p>
  <div class="field">
    <label for="emp">Número de trabajador</label>
    <input id="emp" class="input input--number num${error ? " animate-nudge" : ""}" inputmode="numeric" autocomplete="off" maxlength="10" placeholder="00000" value="${esc(value)}" aria-describedby="emp-help"${error ? ' aria-invalid="true"' : ""}>
    <p class="field__help${error ? " is-error" : ""}" id="emp-help">${error || "Mínimo 5 dígitos, sólo números."}</p>
  </div>
  <button class="btn btn--primary btn--lg btn--block" type="submit">Continuar${icon("arrowRight")}</button>
  <p class="signin__demo">${icon("info")}<span>Demo: <b class="num">20001</b> colaborador · <b class="num">20003</b> soporte de IT · <b class="num">20004</b> contabilidad</span></p>
</form>`;

const confirmStep = (p) => `<div class="signin__card animate-page-in" data-step="confirm">
  <h2 class="h2">¿Eres tú?</h2>
  <div class="who"><span class="avatar is-lg" aria-hidden="true">${esc(initials(p.name))}</span><span class="who__text"><strong>${esc(p.name)}</strong><span>${esc(p.position)}</span><span class="muted">${esc(p.area)} · No. <span class="num">${esc(p.number)}</span></span></span></div>
  <button class="btn btn--primary btn--lg btn--block" type="button" data-yes>Sí, entrar</button>
  <button class="btn btn--ghost btn--block" type="button" data-no>No soy yo</button>
</div>`;

export default {
  title: "Entrar",
  render() {
    return `<div class="signin">
      <section class="signin__story">
        <span class="signin__brand">${wordmark()}</span>
        <h1 class="display">Cada equipo, con nombre y firma.</h1>
        <p class="lede">Qué tiene la empresa, quién lo tiene, desde cuándo y con qué evidencia. Sin hojas sueltas ni fotos perdidas en el chat.</p>
      </section>
      <section class="signin__panel" data-slot>${pending ? confirmStep(pending) : numberStep()}</section>
      <div class="signin__scene">${desk()}</div>
    </div>`;
  },
  bind(root, params, query, go) {
    const slot = root.querySelector("[data-slot]");
    const show = (html) => {
      slot.innerHTML = html;
      wire();
    };
    function wire() {
      const form = slot.querySelector('[data-step="number"]');
      if (form) {
        const input = form.querySelector("input");
        input.addEventListener("input", () => (input.value = input.value.replace(/\D/g, "")));
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const v = input.value.trim();
          if (v.length < 5) {
            show(numberStep(v ? "Te faltan dígitos: son mínimo 5." : "Escribe tu número de trabajador.", v));
            return slot.querySelector("input").focus();
          }
          const btn = form.querySelector("button[type=submit]");
          btn.disabled = true;
          btn.innerHTML = `<span class="spinner" aria-hidden="true"></span>Buscando…`;
          setTimeout(() => {
            pending = store.findProfile(v);
            show(confirmStep(pending));
            slot.querySelector("[data-yes]").focus();
          }, 650);
        });
        return;
      }
      slot.querySelector("[data-yes]")?.addEventListener("click", (e) => {
        e.currentTarget.disabled = true;
        e.currentTarget.innerHTML = `<span class="spinner" aria-hidden="true"></span>Entrando…`;
        setTimeout(() => {
          store.signIn(pending);
          pending = null;
          go("/");
        }, 500);
      });
      slot.querySelector("[data-no]")?.addEventListener("click", () => {
        pending = null;
        show(numberStep());
        slot.querySelector("input").focus();
      });
    }
    wire();
  },
};
