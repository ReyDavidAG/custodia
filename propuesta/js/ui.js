import { barcode } from "./art.js";
import { TODAY, statuses, types } from "./data.js";
import * as store from "./store.js";

const paths = {
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  printer: '<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M6 14h12v7H6z"/>',
  plug: '<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L3 9M3 4v5h5M4 13a8 8 0 0 0 14.6 4.5L21 15M21 20v-5h-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  logout: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 16l4-4-4-4M20 12H10"/>',
  wifiOff: '<path d="M3 3l18 18M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 4.2-2.5M12 20h.01M15.5 10.6A10 10 0 0 1 19 12.9M2 9a15 15 0 0 1 4.4-2.7M10.6 5.1A15 15 0 0 1 22 9"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  inbox: '<path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1 2h6l1-2h5"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  archive: '<path d="M3 4h18v4H3zM5 8v12h14V8M10 12h4"/>',
  store: '<path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 3 3s3-1 3-3"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M16 12v5M8 16h2M12 16h2"/>',
};

export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name] ?? ""}</svg>`;

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export const shortDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
export const money = (n) => `$${n.toLocaleString("es-MX")}`;
export const stagger = (i) => `--i:${Math.min(i, 12)}`;
export const initials = (name) => name.split(" ").filter((w) => w.length > 2).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
export const typeOf = (a) => types[a.type];
export const statusPill = (s) => `<span class="status" data-status="${s}"><i aria-hidden="true"></i>${statuses[s]}</span>`;
export const warrantyLeft = (a) => (a.warranty >= TODAY ? `Garantía hasta ${shortDate(a.warranty)}` : "Sin garantía");

export function assetTag(a, opts = {}) {
  const t = typeOf(a);
  const holder = a.holder ? store.personById(a.holder) : null;
  return `<${opts.link === false ? "div" : "a"} class="atag animate-tile-in${opts.big ? " atag--big" : ""}" data-status="${a.status}"${opts.link === false ? "" : ` href="#/assets/${a.folio}"`} style="${stagger(opts.i ?? 0)}">
    <span class="atag__hole" aria-hidden="true"></span>
    <span class="atag__head"><span class="atag__type">${icon(t.icon)}${t.label}</span>${statusPill(a.status)}</span>
    <span class="atag__folio num">${a.folio}</span>
    <span class="atag__model">${esc(a.brand)} ${esc(a.model)}</span>
    ${barcode(a.folio, "atag__bars")}
    <span class="atag__foot">${holder ? `${icon("eye")}<span>${esc(holder.name)}</span>` : `<span class="muted">${a.status === "stock" ? "Disponible" : "Sin persona"}</span>`}<span class="num muted">${esc(a.serial)}</span></span>
  </${opts.link === false ? "div" : "a"}>`;
}

export function personChip(p) {
  return `<span class="person"><span class="avatar" aria-hidden="true">${esc(initials(p.name))}</span><span class="person__text"><strong>${esc(p.name)}</strong><small>${esc(p.position)} · ${esc(p.area)} · No. <span class="num">${esc(p.number)}</span></small></span></span>`;
}

export function toast(message) {
  const host = document.getElementById("toasts");
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  host.append(el);
  setTimeout(() => el.classList.add("is-leaving"), 2600);
  setTimeout(() => el.remove(), 3000);
}

export const skeletonRows = (n = 6) =>
  `<div class="atags" aria-busy="true" aria-label="Cargando">${Array.from({ length: n }, (_, i) => `<div class="atag atag--ghost" style="${stagger(i)}"><span class="ghost"></span><span class="ghost is-big"></span><span class="ghost is-short"></span></div>`).join("")}</div>`;
