import { shelf } from "../art.js";
import { statuses, types } from "../data.js";
import * as store from "../store.js";
import { assetTag, icon, skeletonRows } from "../ui.js";

let f = { q: "", type: "all", status: "all" };
let loaded = false;

const norm = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function list() {
  const words = norm(f.q).split(/\s+/).filter(Boolean);
  return store.assets().filter((a) => {
    if (f.type !== "all" && a.type !== f.type) return false;
    if (f.status !== "all" && a.status !== f.status) return false;
    if (!words.length) return true;
    const holder = a.holder ? store.personById(a.holder).name : "";
    const text = norm(`${a.folio} ${a.brand} ${a.model} ${a.serial} ${holder} ${types[a.type].label}`);
    return words.every((w) => text.includes(w));
  });
}

function grid() {
  const items = list();
  if (!items.length) return `<div class="empty"><div class="empty__art">${shelf("Repisa vacía")}</div><p class="h3">Nada coincide</p><p class="muted">Prueba con el folio, la serie o el nombre de quien lo tiene.</p></div>`;
  return `<p class="count muted small" aria-live="polite">${items.length} de ${store.assets().length} equipos</p><div class="atags">${items.map((a, i) => assetTag(a, { i })).join("")}</div>`;
}

const failed = () => `<div class="empty empty--error" role="alert"><div class="empty__art">${shelf("Repisa sin datos")}</div><p class="h3">No pudimos cargar el inventario</p><p class="muted">Parece que no hay conexión. No se perdió nada: vuelve a intentar.</p><button class="btn btn--primary" type="button" data-retry>${icon("refresh")}Reintentar</button></div>`;

function kpis() {
  const all = store.assets();
  const n = (s) => all.filter((a) => a.status === s).length;
  const items = [["Asignados", n("assigned"), "assigned"], ["En almacén", n("stock"), "stock"], ["En reparación", n("repair"), "repair"], ["Dados de baja", n("retired") + n("trueque"), "retired"]];
  return `<dl class="kpis">${items.map(([l, v, s]) => `<div class="kpi" data-status="${s}"><dt>${l}</dt><dd class="num">${v}</dd></div>`).join("")}</dl>`;
}

const chips = (name, options, current) => `<div class="chip-row" role="radiogroup" aria-label="${name === "type" ? "Tipo" : "Estado"}">${options.map(([v, l]) => `<label class="chip-radio"><input type="radio" name="${name}" value="${v}"${v === current ? " checked" : ""}><span>${l}</span></label>`).join("")}</div>`;

export default {
  title: "Inventario",
  render() {
    const it = store.role() === "it";
    return `<div class="wrap">
      <header class="page-head page-head--row">
        <div><p class="kicker">Sistemas</p><h1 class="h1">Inventario</h1></div>
        ${it ? `<a class="btn btn--primary" href="#/handover">${icon("plus")}Nueva entrega</a>` : ""}
      </header>
      ${kpis()}
      <div class="tools">
        <label class="search"><span class="sr-only">Buscar</span>${icon("search")}<input type="search" class="input" placeholder="Folio, serie, modelo o persona" value="${f.q}" data-q></label>
        ${chips("type", [["all", "Todos"], ...Object.entries(types).map(([k, t]) => [k, t.label])], f.type)}
        ${chips("status", [["all", "Cualquier estado"], ...Object.entries(statuses)], f.status)}
      </div>
      <div data-grid>${loaded ? grid() : skeletonRows()}</div>
      <p class="demo-note">${icon("info")}Equipos y personas de ejemplo.</p>
    </div>`;
  },
  bind(root) {
    const slot = root.querySelector("[data-grid]");
    const load = () => {
      slot.innerHTML = skeletonRows();
      setTimeout(() => {
        if (store.offline()) {
          slot.innerHTML = failed();
          slot.querySelector("[data-retry]").addEventListener("click", load);
          return;
        }
        loaded = true;
        slot.innerHTML = grid();
      }, 700);
    };
    if (!loaded || store.offline()) load();
    let t;
    root.querySelector("[data-q]").addEventListener("input", (e) => {
      clearTimeout(t);
      t = setTimeout(() => {
        f.q = e.target.value;
        if (loaded) slot.innerHTML = grid();
      }, 300);
    });
    root.querySelector(".tools").addEventListener("change", (e) => {
      if (e.target.name === "type" || e.target.name === "status") {
        f[e.target.name] = e.target.value;
        if (loaded) slot.innerHTML = grid();
      }
    });
  },
};
