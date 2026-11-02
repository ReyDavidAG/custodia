import { TODAY, assets as seedAssets, people, profiles, requests as seedRequests } from "./data.js";

const KEY = "custodia.demo.v1";
const clone = (v) => JSON.parse(JSON.stringify(v));

const blank = () => ({
  role: "it",
  session: null,
  offline: false,
  assets: clone(seedAssets),
  requests: clone(seedRequests),
  letters: [],
  seq: { res: 240, sol: 58 },
});

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return saved ? { ...blank(), ...saved } : blank();
  } catch {
    return blank();
  }
}

let state = read();
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
};

export const role = () => state.role;
export function setRole(r) {
  state.role = r;
  const p = profiles.find((x) => x.role === r);
  if (p && state.session) {
    const who = people.find((x) => x.number === p.number);
    state.session = { personId: who.id, number: who.number, name: who.name, position: who.position, area: who.area };
  }
  save();
}

export const session = () => state.session;
export function findProfile(number) {
  const p = people.find((x) => x.number === number) ?? { ...people[0], number, name: "Colaborador de ejemplo" };
  const r = profiles.find((x) => x.number === number)?.role ?? "member";
  return { ...p, role: r };
}
export function signIn(profile) {
  state.session = { personId: profile.id, number: profile.number, name: profile.name, position: profile.position, area: profile.area };
  state.role = profile.role;
  save();
}
export function signOut() {
  state.session = null;
  save();
}
export const me = () => state.session?.personId ?? "p1";

export const offline = () => state.offline;
export function setOffline(on) {
  state.offline = on;
  save();
}

export const assets = () => state.assets;
export const assetByFolio = (folio) => state.assets.find((a) => a.folio === folio);
export const personById = (id) => people.find((p) => p.id === id);
export const assetsOf = (personId) => state.assets.filter((a) => a.holder === personId);
export const available = () => state.assets.filter((a) => a.status === "stock");

export const letters = () => state.letters;
export const letterByFolio = (res) => state.letters.find((l) => l.res === res);

export function handover({ personId, folios, evidence, request }) {
  const res = `RES-${String(++state.seq.res).padStart(4, "0")}`;
  for (const folio of folios) {
    const a = assetByFolio(folio);
    a.status = "assigned";
    a.holder = personId;
    a.res = res;
    a.history.push({ date: TODAY, kind: "handover", person: personId, res });
  }
  const letter = { res, personId, folios, date: TODAY, evidence, by: state.session?.name ?? "Soporte de IT" };
  state.letters.push(letter);
  if (request) {
    const r = state.requests.find((x) => x.folio === request);
    if (r) {
      r.status = "delivered";
      r.res = res;
    }
  }
  save();
  return letter;
}

export function giveBack(folio, { missing, condition, evidence }) {
  const a = assetByFolio(folio);
  const person = a.holder;
  const note = [condition === "damaged" ? "Regresó con daños" : "Regresó en buen estado", missing.length ? `Falta: ${missing.join(", ")}` : null].filter(Boolean).join(" · ");
  a.history.push({ date: TODAY, kind: "return", person, res: a.res, note, evidence });
  a.status = condition === "damaged" ? "repair" : "stock";
  a.holder = null;
  a.missing = missing;
  delete a.res;
  if (condition === "damaged") a.history.push({ date: TODAY, kind: "repair", note: "Mandado a revisión al recibirlo" });
  save();
}

export function retireByIT(folio, note) {
  const a = assetByFolio(folio);
  a.status = "retired";
  a.retire = { it: true, accounting: false };
  a.history.push({ date: TODAY, kind: "retire", note });
  save();
}

export function approveByAccounting(folio) {
  const a = assetByFolio(folio);
  a.retire = { ...a.retire, accounting: true };
  a.history.push({ date: TODAY, kind: "accounting" });
  save();
}

export function postToTrueque(folio, cacaos) {
  const a = assetByFolio(folio);
  a.status = "trueque";
  a.history.push({ date: TODAY, kind: "trueque", note: `Postulada por ${cacaos} cacaos; RH revisa el precio` });
  save();
}

export function suggestedCacaos(a) {
  const years = Math.max(1, Number(TODAY.slice(0, 4)) - Number(a.bought.slice(0, 4)));
  return Math.max(60, Math.round((a.value / 40) * Math.max(0.25, 1 - years * 0.18) / 10) * 10);
}

export const requests = () => state.requests;
export const requestByFolio = (f) => state.requests.find((r) => r.folio === f);
export function askFor({ type, reason }) {
  const folio = `SOL-${String(++state.seq.sol).padStart(4, "0")}`;
  state.requests.unshift({ folio, person: me(), type, reason, date: TODAY, status: "pending" });
  save();
  return folio;
}
export function decideRequest(folio, status) {
  const r = requestByFolio(folio);
  r.status = status;
  save();
}

export function reset() {
  const { role: r, session: s } = state;
  state = { ...blank(), role: r, session: s };
  save();
}
