import { shelf, wordmark } from "./art.js";
import { roleNames } from "./data.js";
import * as store from "./store.js";
import { esc, icon, initials, toast } from "./ui.js";
import asset from "./views/asset.js";
import handover from "./views/handover.js";
import inventory from "./views/inventory.js";
import letter from "./views/letter.js";
import mine from "./views/mine.js";
import requests from "./views/requests.js";
import retire from "./views/retire.js";
import retirements from "./views/retirements.js";
import giveBack from "./views/return.js";
import signIn from "./views/sign_in.js";

const HOME = { member: "/mine", it: "/inventory", accounting: "/retirements" };

const routes = [
  { pattern: /^\/sign-in$/, view: signIn, public: true },
  { pattern: /^\/inventory$/, view: inventory, nav: "inventory", roles: ["it", "accounting"] },
  { pattern: /^\/assets\/([\w-]+)$/, view: asset, nav: "inventory" },
  { pattern: /^\/assets\/([\w-]+)\/return$/, view: giveBack, nav: "inventory", roles: ["it"] },
  { pattern: /^\/assets\/([\w-]+)\/retire$/, view: retire, nav: "inventory", roles: ["it", "accounting"] },
  { pattern: /^\/handover$/, view: handover, nav: "handover", roles: ["it"] },
  { pattern: /^\/letters\/(RES-\d+)$/, view: letter, nav: "inventory" },
  { pattern: /^\/requests$/, view: requests, nav: "requests", roles: ["it", "member"] },
  { pattern: /^\/mine$/, view: mine, nav: "mine" },
  { pattern: /^\/retirements$/, view: retirements, nav: "retirements", roles: ["accounting"] },
];

const NAV = {
  member: [["mine", "/mine", "Mi equipo", "laptop"], ["requests", "/requests", "Solicitudes", "inbox"]],
  it: [["inventory", "/inventory", "Inventario", "box"], ["requests", "/requests", "Solicitudes", "inbox"], ["handover", "/handover", "Entregar", "send"]],
  accounting: [["retirements", "/retirements", "Bajas", "calc"], ["inventory", "/inventory", "Inventario", "box"]],
};

const app = document.getElementById("app");

function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, qs = ""] = raw.split("?");
  return { path, query: Object.fromEntries(new URLSearchParams(qs)) };
}

export const go = (path) => (location.hash = `#${path}`);

function pendingCount(role) {
  if (role === "it") return store.requests().filter((r) => r.status === "pending").length;
  if (role === "accounting") return store.assets().filter((a) => a.status === "retired" && !a.retire?.accounting).length;
  return 0;
}

function menu(role) {
  const who = store.session();
  return `<div class="menu" id="menu" hidden>
    <div class="menu__head"><span class="avatar" aria-hidden="true">${esc(initials(who.name))}</span><span><strong>${esc(who.name)}</strong><small>${esc(who.position)} · No. <span class="num">${esc(who.number)}</span></small></span></div>
    <fieldset class="menu__roles"><legend>Ver la demo como</legend>
      ${Object.entries(roleNames).map(([id, n]) => `<label class="role-option"><input type="radio" name="demo-role" value="${id}"${id === role ? " checked" : ""}><span>${n}</span></label>`).join("")}
    </fieldset>
    <label class="menu-item menu-item--toggle"><span>${icon("wifiOff")}Simular sin conexión</span><input type="checkbox" name="demo-offline"${store.offline() ? " checked" : ""}></label>
    <button class="menu-item" type="button" data-action="reset">${icon("refresh")}Reiniciar datos de ejemplo</button>
    <button class="menu-item" type="button" data-action="sign-out">${icon("logout")}Salir</button>
  </div>`;
}

function shell(route, content) {
  const role = store.role();
  const nav = NAV[role];
  const badge = pendingCount(role);
  const link = (id, href, label, cls, ic) => `<a class="${cls}" href="#${href}"${id === route.nav ? ' aria-current="page"' : ""}>${ic ? icon(ic) : ""}<span>${label}</span>${(id === "requests" || id === "retirements") && badge ? `<span class="badge-n num" aria-label="${badge} pendientes">${badge}</span>` : ""}</a>`;
  return `<a class="skip-link" href="#main">Saltar al contenido</a>
  <header class="topbar">
    <div class="topbar__inner">
      <a class="topbar__brand" href="#/" aria-label="Custodia, inicio">${wordmark()}</a>
      <nav class="topnav" aria-label="Principal">${nav.map(([id, h, l]) => link(id, h, l, "topnav__link")).join("")}</nav>
      <div class="topbar__actions">
        <button class="role-chip" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="menu" data-action="menu"><span class="avatar is-xs" aria-hidden="true">${esc(initials(store.session().name))}</span><span class="role-chip__label"><span class="sr-only">Ver la demo como </span>${roleNames[role]}</span>${icon("chevronDown")}</button>
        ${menu(role)}
      </div>
    </div>
  </header>
  <div class="demo-ribbon" role="note">${icon("info")}<span>Demo con datos de ejemplo · viendo como <strong>${roleNames[role]}</strong></span></div>
  <main id="main" class="page" tabindex="-1"><div class="animate-page-in">${content}</div></main>
  <nav class="tabbar" aria-label="Principal">${nav.map(([id, h, l, ic]) => link(id, h, l, "tabbar__item", ic)).join("")}</nav>`;
}

const notFound = () => `<div class="wrap narrow"><div class="empty empty--error">
  <div class="empty__art">${shelf("Repisa con un hueco")}</div>
  <p class="kicker">Error 404</p>
  <h1 class="h2">Ese folio no está en el inventario</h1>
  <p class="muted">Revisa el número de la etiqueta o búscalo por serie desde el inventario.</p>
  <a class="btn btn--primary" href="#/">Volver al inicio</a>
</div></div>`;

function render() {
  const { path, query } = parseHash();
  const who = store.session();
  const match = routes.map((r) => ({ r, m: path.match(r.pattern) })).find((x) => x.m);
  if (!who && !match?.r.public) return go("/sign-in");
  if (who && (match?.r.public || path === "/")) return go(HOME[store.role()]);
  if (match?.r.public) {
    app.innerHTML = match.r.view.render([], query);
    document.title = `${match.r.view.title} · Custodia`;
    match.r.view.bind?.(app, [], query, go, render);
    return;
  }
  if (!match) {
    app.innerHTML = shell({ nav: "" }, notFound());
    document.title = `No encontrado · Custodia`;
    return;
  }
  const { r, m } = match;
  if (r.roles && !r.roles.includes(store.role())) return go(HOME[store.role()]);
  const params = m.slice(1);
  const html = r.view.render(params, query);
  app.innerHTML = shell(r, html ?? notFound());
  document.title = `${typeof r.view.title === "function" ? r.view.title(params) : r.view.title} · Custodia`;
  if (html) r.view.bind?.(app.querySelector("#main"), params, query, go, render);
  window.scrollTo(0, 0);
  document.getElementById("main")?.focus({ preventScroll: true });
}

function closeMenu() {
  const m = document.getElementById("menu");
  if (m && !m.hidden) {
    m.hidden = true;
    document.querySelector('[data-action="menu"]')?.setAttribute("aria-expanded", "false");
  }
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-action]")?.dataset.action;
  if (a === "menu") {
    const m = document.getElementById("menu");
    m.hidden = !m.hidden;
    e.target.closest("button").setAttribute("aria-expanded", String(!m.hidden));
    if (!m.hidden) m.querySelector("input:checked")?.focus();
    return;
  }
  if (a === "sign-out") {
    store.signOut();
    toast("Saliste de Custodia");
    return go("/sign-in");
  }
  if (a === "reset") {
    store.reset();
    closeMenu();
    render();
    return toast("Datos de ejemplo reiniciados");
  }
  if (!e.target.closest(".menu")) closeMenu();
});

document.addEventListener("change", (e) => {
  if (e.target.name === "demo-offline") {
    store.setOffline(e.target.checked);
    toast(e.target.checked ? "Simulando sin conexión: abre el inventario" : "Conexión de vuelta");
    return;
  }
  if (e.target.name === "demo-role") {
    store.setRole(e.target.value);
    toast(`Ahora ves la demo como ${roleNames[e.target.value]}`);
    go(HOME[e.target.value]);
    render();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

window.addEventListener("hashchange", render);
setTimeout(() => {
  document.getElementById("boot")?.remove();
  render();
}, 700);
