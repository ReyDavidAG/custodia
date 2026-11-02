import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.argv[2]);
const chispa = resolve(process.env.CHISPA_DIR ?? `${root}/../Chispa`);
const trueque = resolve(process.env.TRUEQUE_DIR ?? `${root}/../Trueque`);
const db = new PGlite();
const ok = (m) => console.log("ok  ", m);
const fail = (m) => { console.log("FAIL", m); process.exitCode = 1; };
const migrations = (dir) => readdirSync(`${dir}/supabase/migrations`).filter((f) => f.endsWith(".sql") && !f.includes("storage")).sort().map((f) => `${dir}/supabase/migrations/${f}`);

await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`);
for (const f of migrations(chispa)) await db.exec(readFileSync(f, "utf8"));
await db.exec(`
  grant usage on schema public to anon, authenticated;
  grant select, insert, update, delete on all tables in schema public to authenticated;
  grant usage on all sequences in schema public to authenticated;
`);
await db.exec(readFileSync(`${chispa}/supabase/seed_demo_org.sql`, "utf8"));
await db.exec(readFileSync(`${chispa}/supabase/seed.sql`, "utf8"));
for (const f of migrations(trueque)) await db.exec(readFileSync(f, "utf8"));
await db.exec(readFileSync(`${trueque}/supabase/seed.sql`, "utf8"));
for (const f of migrations(root)) await db.exec(readFileSync(f, "utf8"));
await db.exec(readFileSync(`${root}/supabase/seed_demo.sql`, "utf8"));
ok("migraciones de Chispa, El Trueque y Custodia aplicadas en la misma base");

const U = { member: "11111111-1111-1111-1111-111111111111", it: "22222222-2222-2222-2222-222222222222", acc: "33333333-3333-3333-3333-333333333333", other: "44444444-4444-4444-4444-444444444444", hr: "55555555-5555-5555-5555-555555555555", store: "66666666-6666-6666-6666-666666666666" };
await db.exec(`
  insert into people (employee_number, full_name, area_id, auth_subject) values
    ('20001', 'Colaborador Uno', (select id from areas where code='CALI'), '${U.member}'),
    ('20003', 'Soporte de IT', (select id from areas where code='TECN'), '${U.it}'),
    ('20004', 'Contabilidad', (select id from areas where code='FINA'), '${U.acc}'),
    ('20005', 'Otro colaborador', (select id from areas where code='LOGI'), '${U.other}'),
    ('20006', 'RH corporativo', (select id from areas where code='RHUM'), '${U.hr}'),
    ('20007', 'Encargado de la tienda', (select id from areas where code='RHUM'), '${U.store}');
  insert into custodia.staff (asset_area_id, person_id) select aa.id, p.id from custodia.asset_areas aa, people p where p.employee_number = '20003';
  insert into custodia.accountants select id from people where employee_number = '20004';
  insert into trueque.hr_reviewers select id from people where employee_number = '20006';
  insert into trueque.store_managers select c.id, p.id from companies c, people p where c.code = 'DEMO' and p.employee_number = '20007';
`);

async function as(user, sql, params = []) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${user}', false); set role authenticated;`);
  try { return await db.query(sql, params); } finally { await db.exec("reset role;"); }
}
async function expectError(label, fn, match) {
  try { await fn(); fail(`${label}: debió fallar`); } catch (e) { match && !String(e.message).includes(match) ? fail(`${label}: ${e.message}`) : ok(label); }
}
const person = (n) => `(select id from people where employee_number='${n}')`;
const asset = async (serial) => (await db.query(`select id from custodia.assets where serial = $1`, [serial])).rows[0].id;
const sha = "a".repeat(64);
const evidence = async (name) => (await as(U.it, `insert into custodia.evidences (kind, storage_path, mime, size_bytes, sha256, uploaded_by) values ('signature', $1, 'image/png', 2048, '${sha}', ${person("20003")}) returning id`, [name])).rows[0].id;

const folios = await db.query(`select string_agg(custodia.fmt(prefix, folio), ',' order by prefix, folio) f from custodia.assets`);
folios.rows[0].f === "EQ-0001,EQ-0002,EQ-0003,EQ-0004,EQ-0005,EQ-0006,LIC-0001" ? ok("folios por tipo: EQ-0001… y LIC-0001") : fail(folios.rows[0].f);
const ins = await db.query(`select count(*)::int n from custodia.asset_events where kind = 'in'`);
ins.rows[0].n === 7 ? ok("cada alta queda en el historial") : fail(`altas ${ins.rows[0].n}`);

const memberSees = await as(U.member, `select count(*)::int n from custodia.asset_cards`);
memberSees.rows[0].n === 0 ? ok("un colaborador no ve el inventario") : fail(`colaborador ve ${memberSees.rows[0].n}`);
const itSees = await as(U.it, `select count(*)::int n from custodia.asset_cards`);
itSees.rows[0].n === 7 ? ok("soporte de IT ve todo el inventario de su área") : fail(`IT ve ${itSees.rows[0].n}`);
await expectError("un colaborador no da de alta equipo", () => as(U.member, `insert into custodia.assets (asset_area_id, type_id, company_id, name) select aa.id, t.id, (select id from companies where code='DEMO'), 'X' from custodia.asset_areas aa join custodia.asset_types t on t.asset_area_id = aa.id where t.code='laptop'`));
await expectError("nadie cambia el estado a mano", () => as(U.it, `update custodia.assets set status = 'assigned' where serial = 'SER-0002'`));

const sol = await as(U.member, `insert into custodia.requests (person_id, asset_area_id, type_id, reason) select ${person("20001")}, aa.id, t.id, 'Trabajo en piso y necesito laptop' from custodia.asset_areas aa join custodia.asset_types t on t.asset_area_id = aa.id where t.code='laptop' returning id, folio, status`);
sol.rows[0].folio === 1 && sol.rows[0].status === "pending" ? ok("el colaborador pide equipo: SOL-0001 pendiente") : fail(JSON.stringify(sol.rows[0]));
await expectError("no se pide equipo a nombre de otro", () => as(U.member, `insert into custodia.requests (person_id, asset_area_id, type_id, reason) select ${person("20005")}, aa.id, t.id, 'Para alguien más, por favor' from custodia.asset_areas aa join custodia.asset_types t on t.asset_area_id = aa.id where t.code='laptop'`));
const otherReq = await as(U.other, `select count(*)::int n from custodia.requests`);
otherReq.rows[0].n === 0 ? ok("cada quien ve sólo sus solicitudes") : fail("solicitudes ajenas visibles");

const laptop = await asset("SER-0002");
await expectError("sin evidencia no hay entrega", () => as(U.it, `select custodia.handover(${person("20001")}, array['${laptop}']::uuid[], gen_random_uuid(), null)`), "evidencia");
const ev1 = await evidence("aa/firma-1.png");
const monitor = await asset("SER-0101");
const res = await as(U.it, `select custodia.handover(${person("20001")}, array['${laptop}', '${monitor}']::uuid[], $1, $2) r`, [ev1, sol.rows[0].id]);
res.rows[0].r === "RES-0001" ? ok("entrega con carta de resguardo RES-0001 y dos equipos") : fail(res.rows[0].r);
const delivered = await db.query(`select status from custodia.requests where id = $1`, [sol.rows[0].id]);
delivered.rows[0].status === "delivered" ? ok("la solicitud queda entregada") : fail(delivered.rows[0].status);
await expectError("un equipo asignado no se entrega dos veces", () => as(U.it, `select custodia.handover(${person("20005")}, array['${laptop}']::uuid[], $1)`, [ev1]), "ya no está");
const spare = await asset("SER-0003");
await expectError("un colaborador no entrega equipo", () => as(U.member, `select custodia.handover(${person("20005")}, array['${spare}']::uuid[], $1)`, [ev1]), "Sólo quien administra");

const mine = await as(U.member, `select folio, custody_folio from custodia.asset_cards order by folio`);
mine.rows.length === 2 && mine.rows[0].custody_folio === "RES-0001" ? ok("el colaborador ve sus 2 equipos con su carta") : fail(JSON.stringify(mine.rows));
const otherSees = await as(U.other, `select count(*)::int n from custodia.custodies`);
otherSees.rows[0].n === 0 ? ok("otro colaborador no ve cartas ajenas") : fail("cartas ajenas");
const evSeen = await as(U.member, `select count(*)::int n from custodia.evidences`);
evSeen.rows[0].n === 1 ? ok("quien recibe ve la evidencia de su carta") : fail(`evidencia ${evSeen.rows[0].n}`);

const ev2 = await evidence("aa/firma-2.png");
const back = await as(U.it, `select custodia.receive_return($1, 'good', $2, array['Funda']) s`, [monitor, ev2]);
const open = await db.query(`select status from custodia.custodies where folio = 1`);
back.rows[0].s === "stock" && open.rows[0].status === "active" ? ok("devolución parcial: el monitor vuelve al almacén y la carta sigue vigente") : fail(`${back.rows[0].s} ${open.rows[0].status}`);
const missing = await db.query(`select part_name from custodia.missing_parts`);
missing.rows[0]?.part_name === "Funda" ? ok("queda anotado lo que faltó") : fail("faltante");
const ev3 = await evidence("aa/firma-3.png");
const dmg = await as(U.it, `select custodia.receive_return($1, 'damaged', $2) s`, [laptop, ev3]);
const closed = await db.query(`select status, closed_on is not null c from custodia.custodies where folio = 1`);
dmg.rows[0].s === "repair" && closed.rows[0].status === "closed" ? ok("regresa con daños: pasa a reparación y la carta se cierra al volver todo") : fail(`${dmg.rows[0].s} ${closed.rows[0].status}`);
const hist = await db.query(`select string_agg(kind, '>' order by id) k from custodia.asset_events where asset_id = $1`, [laptop]);
hist.rows[0].k === "in>handover>return>repair" ? ok("historial de custodia: " + hist.rows[0].k) : fail(hist.rows[0].k);

const old = await asset("SER-0003");
await expectError("no se da de baja sin borrar datos", () => as(U.it, `select custodia.retire($1, 'Batería muerta', false, true, true)`, [old]), "borrar los datos");
await as(U.it, `select custodia.retire($1, 'Batería que ya no carga', true, true, true)`, [old]);
await expectError("IT no postula a El Trueque sin la baja contable", () => as(U.it, `select custodia.propose_to_trueque($1, 100)`, [old]), "contabilidad");
await expectError("IT no hace la baja contable", () => as(U.it, `select custodia.confirm_write_off($1)`, [old]), "Sólo contabilidad");
const accView = await as(U.acc, `select count(*)::int n from custodia.retirements where accounting_at is null`);
accView.rows[0].n === 1 ? ok("contabilidad ve la baja que espera su confirmación") : fail("cola contable");
await as(U.acc, `select custodia.confirm_write_off($1)`, [old]);
const suggested = await as(U.it, `select custodia.suggested_cacaos($1) n`, [old]);
suggested.rows[0].n >= 60 ? ok(`precio sugerido por valor y antigüedad: ${suggested.rows[0].n} cacaos`) : fail(String(suggested.rows[0].n));
const prod = await as(U.it, `select custodia.propose_to_trueque($1, $2) id`, [old, suggested.rows[0].n]);
const tp = await db.query(`select status, stock, origin, origin_ref, category_code from trueque.products where id = $1`, [prod.rows[0].id]);
const t = tp.rows[0];
const ref = (await db.query(`select custodia.fmt(prefix, folio) f from custodia.assets where id = $1`, [old])).rows[0].f;
t.status === "pending" && t.stock === 1 && t.origin === "custodia" && t.origin_ref === ref && t.category_code === "custodia" ? ok(`postulada a El Trueque: pendiente de RH, existencias 1, origen ${ref}`) : fail(JSON.stringify(t));
await expectError("no se postula dos veces el mismo equipo", () => as(U.it, `select custodia.propose_to_trueque($1, 100)`, [old]));
await as(U.hr, `select trueque.review_price($1, 'approved')`, [prod.rows[0].id]);

await db.exec(`
  insert into trueque.ledger (person_id, company_id, kind, amount, rule_code, source, source_id, source_ref, expires_on)
  select ${person("20005")}, (select id from companies where code='DEMO'), 'earn', 500, 'done', 'chispa.idea', gen_random_uuid(), 'CHI-001', current_date + 300;
`);
const trade = await as(U.other, `select * from trueque.trade($1)`, [prod.rows[0].id]);
await as(U.store, `select trueque.redeem($1, null)`, [trade.rows[0].code]);
const gone = await db.query(`select status from custodia.assets where id = $1`, [old]);
const last = await db.query(`select kind, note from custodia.asset_events where asset_id = $1 order by id desc limit 1`, [old]);
gone.rows[0].status === "disposed" && last.rows[0].kind === "disposed" ? ok("al canjearse en El Trueque, el equipo sale del inventario: " + last.rows[0].note) : fail(`${gone.rows[0].status} ${last.rows[0].kind}`);
