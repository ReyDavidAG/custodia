-- Custodia · esquema inicial (Supabase / Postgres 15+)
-- Vive en la misma base que Chispa y El Trueque. Requiere sus migraciones aplicadas antes:
-- reutiliza public.people, public.companies y public.areas, y postula equipos con trueque.create_product_from_asset.
-- Explicación en docs/database.md.

create schema custodia;

-- ───────────────────────── Quién administra (por área, como en RH) ─────────────────────────

create table custodia.asset_areas (
  id              uuid primary key default gen_random_uuid(),
  area_id         uuid not null unique references public.areas (id),
  name            text not null check (length(name) between 2 and 80),
  responsible_id  uuid references public.people (id) on delete set null,
  rh_key          text unique,
  created_at      timestamptz not null default now()
);

create table custodia.staff (
  asset_area_id  uuid not null references custodia.asset_areas (id) on delete cascade,
  person_id      uuid not null references public.people (id) on delete cascade,
  role           text not null default 'agent' check (role in ('manager', 'agent')),
  created_at     timestamptz not null default now(),
  primary key (asset_area_id, person_id)
);
create index staff_person_idx on custodia.staff (person_id);

create table custodia.accountants (
  person_id   uuid primary key references public.people (id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- ───────────────────────── Catálogo de tipos ─────────────────────────

create table custodia.asset_types (
  id             uuid primary key default gen_random_uuid(),
  asset_area_id  uuid not null references custodia.asset_areas (id),
  code           text not null check (code ~ '^[a-z_]{2,30}$'),
  name           text not null,
  group_code     text not null check (group_code in ('hardware', 'license')),
  icon           text,
  position       smallint not null default 0,
  rh_key         text unique,
  unique (asset_area_id, code)
);

-- ───────────────────────── Folios (EQ-0001, LIC-0001, RES-0001, SOL-0001) ─────────────────────────

create table custodia.folio_counters (
  kind        text primary key check (kind in ('EQ', 'LIC', 'RES', 'SOL')),
  last_value  integer not null default 0
);

create function custodia.next_folio(p_kind text)
returns integer
language plpgsql
as $$
declare
  v integer;
begin
  insert into custodia.folio_counters (kind, last_value) values (p_kind, 1)
  on conflict (kind) do update set last_value = custodia.folio_counters.last_value + 1
  returning last_value into v;
  return v;
end;
$$;

-- ───────────────────────── Equipos ─────────────────────────

create table custodia.assets (
  id              uuid primary key default gen_random_uuid(),
  prefix          text not null check (prefix in ('EQ', 'LIC')),
  folio           integer not null,
  asset_area_id   uuid not null references custodia.asset_areas (id),
  type_id         uuid not null references custodia.asset_types (id),
  company_id      uuid not null references public.companies (id),
  name            text not null check (length(name) between 2 and 120),
  description     text,
  features        text,
  brand           text,
  model           text,
  serial          text,
  inventory_tag   text unique,
  purchased_on    date,
  warranty_until  date,
  value           numeric(12, 2) check (value >= 0),
  status          text not null default 'stock' check (status in ('stock', 'assigned', 'repair', 'retired', 'trueque', 'disposed')),
  condition       text not null default 'good' check (condition in ('new', 'good', 'fair', 'damaged')),
  location        text,
  notes           text,
  rh_key          text unique,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (prefix, folio),
  unique (type_id, serial)
);
create index assets_list_idx on custodia.assets (asset_area_id, status);
create index assets_type_idx on custodia.assets (type_id, status);

create table custodia.asset_parts (
  id        uuid primary key default gen_random_uuid(),
  asset_id  uuid not null references custodia.assets (id) on delete cascade,
  name      text not null check (length(name) between 2 and 60),
  position  smallint not null,
  unique (asset_id, position)
);

-- ───────────────────────── Evidencia (archivo, no base64) ─────────────────────────

create table custodia.evidences (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('signature', 'photo', 'pdf')),
  storage_path  text not null unique,
  mime          text not null,
  size_bytes    integer not null check (size_bytes between 1 and 10485760),
  sha256        text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  uploaded_by   uuid not null references public.people (id),
  rh_key        text unique,
  created_at    timestamptz not null default now()
);

-- ───────────────────────── Solicitudes ─────────────────────────

create table custodia.requests (
  id             uuid primary key default gen_random_uuid(),
  folio          integer not null unique,
  person_id      uuid not null references public.people (id),
  asset_area_id  uuid not null references custodia.asset_areas (id),
  type_id        uuid not null references custodia.asset_types (id),
  reason         text not null check (length(reason) between 10 and 300),
  status         text not null default 'pending' check (status in ('pending', 'rejected', 'delivered', 'cancelled')),
  decided_by     uuid references public.people (id),
  decided_at     timestamptz,
  note           text,
  created_at     timestamptz not null default now()
);
create index requests_queue_idx on custodia.requests (asset_area_id, status, created_at);
create index requests_person_idx on custodia.requests (person_id, created_at desc);

-- ───────────────────────── Resguardos (cabecera y detalle, como en RH) ─────────────────────────

create table custodia.custodies (
  id             uuid primary key default gen_random_uuid(),
  folio          integer not null unique,
  person_id      uuid not null references public.people (id),
  company_id     uuid not null references public.companies (id),
  asset_area_id  uuid not null references custodia.asset_areas (id),
  status         text not null default 'active' check (status in ('active', 'closed')),
  delivered_on   timestamptz not null default now(),
  closed_on      timestamptz,
  delivered_by   uuid not null references public.people (id),
  request_id     uuid references custodia.requests (id),
  terms          text not null,
  rh_key         text unique,
  check ((status = 'closed') = (closed_on is not null))
);
create index custodies_person_idx on custodia.custodies (person_id, status);

create table custodia.custody_items (
  id                    uuid primary key default gen_random_uuid(),
  custody_id            uuid not null references custodia.custodies (id) on delete cascade,
  asset_id              uuid not null references custodia.assets (id),
  delivery_evidence_id  uuid not null references custodia.evidences (id),
  return_evidence_id    uuid references custodia.evidences (id),
  returned_on           timestamptz,
  return_condition      text check (return_condition in ('good', 'damaged')),
  received_by           uuid references public.people (id),
  unique (custody_id, asset_id),
  check ((returned_on is null) = (return_evidence_id is null)),
  check ((returned_on is null) = (return_condition is null))
);
create unique index custody_items_one_open_idx on custodia.custody_items (asset_id) where returned_on is null;

create table custodia.missing_parts (
  custody_item_id  uuid not null references custodia.custody_items (id) on delete cascade,
  part_name        text not null,
  primary key (custody_item_id, part_name)
);

-- ───────────────────────── Historial y bajas ─────────────────────────

create table custodia.asset_events (
  id          bigint generated always as identity primary key,
  asset_id    uuid not null references custodia.assets (id) on delete cascade,
  kind        text not null check (kind in ('in', 'handover', 'return', 'repair', 'repaired', 'retire', 'accounting', 'trueque', 'disposed')),
  person_id   uuid references public.people (id),
  custody_id  uuid references custodia.custodies (id),
  note        text,
  created_by  uuid references public.people (id),
  created_at  timestamptz not null default now()
);
create index asset_events_asset_idx on custodia.asset_events (asset_id, created_at);

create table custodia.retirements (
  asset_id          uuid primary key references custodia.assets (id) on delete cascade,
  reason            text not null check (length(reason) between 3 and 200),
  data_wiped        boolean not null check (data_wiped),
  accounts_removed  boolean not null check (accounts_removed),
  parts_separated   boolean not null,
  it_by             uuid not null references public.people (id),
  it_at             timestamptz not null default now(),
  accounting_by     uuid references public.people (id),
  accounting_at     timestamptz,
  outcome           text not null default 'pending' check (outcome in ('pending', 'trueque', 'disposal', 'donation')),
  trueque_product   uuid,
  check ((accounting_by is null) = (accounting_at is null)),
  check (outcome = 'pending' or accounting_at is not null)
);

-- ───────────────────────── Funciones de apoyo ─────────────────────────

create function custodia.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger assets_touch before update on custodia.assets for each row execute function custodia.touch_updated_at();

create function custodia.prepare_asset()
returns trigger
language plpgsql
security definer
set search_path = custodia, public
as $$
begin
  select case group_code when 'license' then 'LIC' else 'EQ' end into new.prefix from custodia.asset_types where id = new.type_id;
  new.folio := custodia.next_folio(new.prefix);
  new.status := 'stock';
  return new;
end;
$$;
create trigger assets_prepare before insert on custodia.assets for each row execute function custodia.prepare_asset();

create function custodia.log_new_asset()
returns trigger
language plpgsql
security definer
set search_path = custodia, public
as $$
begin
  insert into custodia.asset_events (asset_id, kind, created_by) values (new.id, 'in', public.current_person_id());
  return null;
end;
$$;
create trigger assets_log_in after insert on custodia.assets for each row execute function custodia.log_new_asset();

create function custodia.assign_request_folio()
returns trigger
language plpgsql
security definer
set search_path = custodia, public
as $$
begin
  new.folio := custodia.next_folio('SOL');
  new.status := 'pending';
  return new;
end;
$$;
create trigger requests_folio before insert on custodia.requests for each row execute function custodia.assign_request_folio();

create function custodia.is_staff(p_asset_area uuid)
returns boolean
language sql
stable
security definer
set search_path = custodia, public
as $$
  select exists (select 1 from custodia.staff where asset_area_id = p_asset_area and person_id = public.current_person_id())
      or exists (select 1 from public.people where id = public.current_person_id() and is_admin);
$$;

create function custodia.is_accountant()
returns boolean
language sql
stable
security definer
set search_path = custodia, public
as $$
  select exists (select 1 from custodia.accountants where person_id = public.current_person_id());
$$;

create function custodia.holds(p_asset uuid)
returns boolean
language sql
stable
security definer
set search_path = custodia, public
as $$
  select exists (select 1 from custodia.custody_items i join custodia.custodies c on c.id = i.custody_id
                 where i.asset_id = p_asset and i.returned_on is null and c.person_id = public.current_person_id());
$$;

create function custodia.can_see_asset(p_asset uuid)
returns boolean
language sql
stable
security definer
set search_path = custodia, public
as $$
  select custodia.is_accountant() or custodia.holds(p_asset)
      or exists (select 1 from custodia.assets a where a.id = p_asset and custodia.is_staff(a.asset_area_id));
$$;

create function custodia.fmt(p_prefix text, p_folio integer)
returns text
language sql
immutable
as $$
  select p_prefix || '-' || lpad(p_folio::text, 4, '0');
$$;

-- ───────────────────────── Lecturas (vistas) ─────────────────────────

create view custodia.asset_cards
with (security_invoker = true)
as
select
  a.id,
  custodia.fmt(a.prefix, a.folio) as folio,
  a.asset_area_id,
  a.type_id,
  t.code as type_code,
  t.name as type_name,
  t.group_code,
  a.company_id,
  a.name,
  a.brand,
  a.model,
  a.serial,
  a.status,
  a.condition,
  a.value,
  a.purchased_on,
  a.warranty_until,
  c.person_id as holder_id,
  custodia.fmt('RES', c.folio) as custody_folio,
  c.delivered_on
from custodia.assets a
join custodia.asset_types t on t.id = a.type_id
left join custodia.custody_items i on i.asset_id = a.id and i.returned_on is null
left join custodia.custodies c on c.id = i.custody_id;

-- ───────────────────────── Entregar (carta de resguardo) ─────────────────────────

create function custodia.handover(p_person uuid, p_assets uuid[], p_evidence uuid, p_request uuid default null,
                                  p_terms text default 'Me comprometo a cuidar el equipo, usarlo para mi trabajo y devolverlo completo cuando me lo pidan o deje la empresa.')
returns text
language plpgsql
security definer
set search_path = custodia, public
as $$
declare
  v_me uuid := public.current_person_id();
  v_area uuid;
  v_id uuid;
  v_folio integer;
  a record;
begin
  if coalesce(array_length(p_assets, 1), 0) = 0 then
    raise exception 'Elige al menos un equipo.';
  end if;
  if not exists (select 1 from custodia.evidences where id = p_evidence) then
    raise exception 'Falta la evidencia de entrega.';
  end if;
  select min(asset_area_id::text)::uuid into v_area from custodia.assets where id = any (p_assets);
  if (select count(distinct asset_area_id) from custodia.assets where id = any (p_assets)) <> 1 or not custodia.is_staff(v_area) then
    raise exception 'Sólo quien administra estos equipos puede entregarlos.';
  end if;
  if exists (select 1 from custodia.assets where id = any (p_assets) and status <> 'stock') then
    raise exception 'Algún equipo ya no está en almacén.';
  end if;
  v_folio := custodia.next_folio('RES');
  insert into custodia.custodies (folio, person_id, company_id, asset_area_id, delivered_by, request_id, terms)
  select v_folio, p.id, ar.company_id, v_area, v_me, p_request, p_terms
    from public.people p join public.areas ar on ar.id = p.area_id where p.id = p_person and p.is_active
  returning id into v_id;
  if v_id is null then
    raise exception 'No encontramos a esa persona.';
  end if;
  for a in select id from custodia.assets where id = any (p_assets) for update loop
    insert into custodia.custody_items (custody_id, asset_id, delivery_evidence_id) values (v_id, a.id, p_evidence);
    update custodia.assets set status = 'assigned' where id = a.id;
    insert into custodia.asset_events (asset_id, kind, person_id, custody_id, created_by) values (a.id, 'handover', p_person, v_id, v_me);
  end loop;
  if p_request is not null then
    update custodia.requests set status = 'delivered', decided_by = v_me, decided_at = now()
     where id = p_request and person_id = p_person and status = 'pending';
  end if;
  return custodia.fmt('RES', v_folio);
end;
$$;

-- ───────────────────────── Recibir una devolución (total o parcial) ─────────────────────────

create function custodia.receive_return(p_asset uuid, p_condition text, p_evidence uuid, p_missing text[] default '{}')
returns text
language plpgsql
security definer
set search_path = custodia, public
as $$
declare
  v_me uuid := public.current_person_id();
  it custodia.custody_items;
  v_person uuid;
  v_part text;
begin
  select i.* into it from custodia.custody_items i join custodia.assets a on a.id = i.asset_id
   where i.asset_id = p_asset and i.returned_on is null for update of i;
  if it.id is null then
    raise exception 'Este equipo no está asignado.';
  end if;
  if not custodia.is_staff((select asset_area_id from custodia.assets where id = p_asset)) then
    raise exception 'Sólo quien administra este equipo recibe devoluciones.';
  end if;
  if not exists (select 1 from custodia.evidences where id = p_evidence) then
    raise exception 'Falta la firma de quien entrega.';
  end if;
  update custodia.custody_items
     set returned_on = now(), return_condition = p_condition, return_evidence_id = p_evidence, received_by = v_me
   where id = it.id;
  foreach v_part in array coalesce(p_missing, '{}') loop
    insert into custodia.missing_parts (custody_item_id, part_name) values (it.id, v_part);
  end loop;
  select person_id into v_person from custodia.custodies where id = it.custody_id;
  update custodia.assets set status = case p_condition when 'damaged' then 'repair' else 'stock' end,
                             condition = case p_condition when 'damaged' then 'damaged' else condition end
   where id = p_asset;
  insert into custodia.asset_events (asset_id, kind, person_id, custody_id, note, created_by)
  values (p_asset, 'return', v_person, it.custody_id,
          nullif(concat_ws(' · ', case when p_condition = 'damaged' then 'Regresó con daños' end,
                                  case when coalesce(array_length(p_missing, 1), 0) > 0 then 'Falta: ' || array_to_string(p_missing, ', ') end), ''), v_me);
  if p_condition = 'damaged' then
    insert into custodia.asset_events (asset_id, kind, note, created_by) values (p_asset, 'repair', 'Mandado a revisión al recibirlo', v_me);
  end if;
  update custodia.custodies c set status = 'closed', closed_on = now()
   where c.id = it.custody_id and not exists (select 1 from custodia.custody_items i where i.custody_id = c.id and i.returned_on is null);
  return case p_condition when 'damaged' then 'repair' else 'stock' end;
end;
$$;

create function custodia.set_repair(p_asset uuid, p_in_repair boolean, p_note text default null)
returns text
language plpgsql
security definer
set search_path = custodia, public
as $$
declare
  a custodia.assets;
begin
  select * into a from custodia.assets where id = p_asset for update;
  if a.id is null or not custodia.is_staff(a.asset_area_id) then
    raise exception 'Sólo quien administra este equipo lo manda a reparación.';
  end if;
  if (p_in_repair and a.status <> 'stock') or (not p_in_repair and a.status <> 'repair') then
    raise exception 'El equipo no está en el estado correcto.';
  end if;
  update custodia.assets set status = case when p_in_repair then 'repair' else 'stock' end where id = p_asset;
  insert into custodia.asset_events (asset_id, kind, note, created_by)
  values (p_asset, case when p_in_repair then 'repair' else 'repaired' end, p_note, public.current_person_id());
  return case when p_in_repair then 'repair' else 'stock' end;
end;
$$;

-- ───────────────────────── Baja: IT → contabilidad → El Trueque ─────────────────────────

create function custodia.retire(p_asset uuid, p_reason text, p_data_wiped boolean, p_accounts_removed boolean, p_parts_separated boolean)
returns text
language plpgsql
security definer
set search_path = custodia, public
as $$
declare
  a custodia.assets;
begin
  select * into a from custodia.assets where id = p_asset for update;
  if a.id is null or not custodia.is_staff(a.asset_area_id) then
    raise exception 'Sólo quien administra este equipo lo da de baja.';
  end if;
  if a.status not in ('stock', 'repair') then
    raise exception 'Sólo se da de baja un equipo en almacén o en reparación.';
  end if;
  if not (p_data_wiped and p_accounts_removed) then
    raise exception 'Antes de la baja hay que borrar los datos y retirar las cuentas.';
  end if;
  insert into custodia.retirements (asset_id, reason, data_wiped, accounts_removed, parts_separated, it_by)
  values (p_asset, p_reason, p_data_wiped, p_accounts_removed, p_parts_separated, public.current_person_id());
  update custodia.assets set status = 'retired' where id = p_asset;
  insert into custodia.asset_events (asset_id, kind, note, created_by) values (p_asset, 'retire', p_reason, public.current_person_id());
  return 'retired';
end;
$$;

create function custodia.confirm_write_off(p_asset uuid)
returns text
language plpgsql
security definer
set search_path = custodia, public
as $$
begin
  if not custodia.is_accountant() then
    raise exception 'Sólo contabilidad da la baja del activo.';
  end if;
  update custodia.retirements set accounting_by = public.current_person_id(), accounting_at = now()
   where asset_id = p_asset and accounting_at is null;
  if not found then
    raise exception 'Este equipo no espera la baja contable.';
  end if;
  insert into custodia.asset_events (asset_id, kind, created_by) values (p_asset, 'accounting', public.current_person_id());
  return 'written_off';
end;
$$;

create function custodia.suggested_cacaos(p_asset uuid)
returns integer
language sql
stable
security definer
set search_path = custodia, public
as $$
  select greatest(60, round(coalesce(a.value, 0) / 40
           * greatest(0.25, 1 - greatest(1, extract(year from current_date) - extract(year from coalesce(a.purchased_on, current_date))) * 0.18) / 10) * 10)::integer
  from custodia.assets a where a.id = p_asset;
$$;

create function custodia.propose_to_trueque(p_asset uuid, p_price integer)
returns uuid
language plpgsql
security definer
set search_path = custodia, public
as $$
declare
  a custodia.assets;
  r custodia.retirements;
  v_product uuid;
  v_ref text;
begin
  select * into a from custodia.assets where id = p_asset for update;
  if a.id is null or not custodia.is_staff(a.asset_area_id) then
    raise exception 'Sólo quien administra este equipo lo postula.';
  end if;
  select * into r from custodia.retirements where asset_id = p_asset;
  if r.asset_id is null or r.accounting_at is null or r.outcome <> 'pending' then
    raise exception 'Primero IT y contabilidad tienen que completar la baja.';
  end if;
  v_ref := custodia.fmt(a.prefix, a.folio);
  v_product := trueque.create_product_from_asset(
    a.company_id,
    left(concat_ws(' ', a.brand, a.model, '· reacondicionado'), 80),
    left(coalesce(a.features, a.name), 140),
    'Viene de Custodia (' || v_ref || '): IT la revisó y borró los datos, y contabilidad ya la dio de baja.',
    p_price, v_ref, public.current_person_id());
  update custodia.retirements set outcome = 'trueque', trueque_product = v_product where asset_id = p_asset;
  update custodia.assets set status = 'trueque' where id = p_asset;
  insert into custodia.asset_events (asset_id, kind, note, created_by)
  values (p_asset, 'trueque', 'Postulado por ' || p_price || ' cacaos; RH revisa el precio', public.current_person_id());
  return v_product;
end;
$$;

-- Cuando alguien canjea en El Trueque un equipo que vino de Custodia, sale del inventario.
create function custodia.on_trueque_order_used()
returns trigger
language plpgsql
security definer
set search_path = custodia, public
as $$
declare
  v_asset uuid;
begin
  select r.asset_id into v_asset from custodia.retirements r where r.trueque_product = new.product_id;
  if v_asset is not null then
    update custodia.assets set status = 'disposed' where id = v_asset;
    insert into custodia.asset_events (asset_id, kind, person_id, note)
    values (v_asset, 'disposed', new.person_id, 'Entregado por El Trueque (TRQ-' || lpad(new.folio::text, 4, '0') || ')');
  end if;
  return null;
end;
$$;
create trigger custodia_trueque_used after update of status on trueque.orders
  for each row when (new.status = 'used' and old.status is distinct from 'used') execute function custodia.on_trueque_order_used();

-- ───────────────────────── Solicitudes ─────────────────────────

create function custodia.reject_request(p_request uuid, p_note text)
returns text
language plpgsql
security definer
set search_path = custodia, public
as $$
begin
  update custodia.requests set status = 'rejected', decided_by = public.current_person_id(), decided_at = now(), note = p_note
   where id = p_request and status = 'pending' and custodia.is_staff(asset_area_id);
  if not found then
    raise exception 'No puedes rechazar esta solicitud.';
  end if;
  return 'rejected';
end;
$$;

-- ───────────────────────── Seguridad (RLS) ─────────────────────────

alter table custodia.asset_areas enable row level security;
alter table custodia.staff enable row level security;
alter table custodia.accountants enable row level security;
alter table custodia.asset_types enable row level security;
alter table custodia.folio_counters enable row level security;
alter table custodia.assets enable row level security;
alter table custodia.asset_parts enable row level security;
alter table custodia.evidences enable row level security;
alter table custodia.requests enable row level security;
alter table custodia.custodies enable row level security;
alter table custodia.custody_items enable row level security;
alter table custodia.missing_parts enable row level security;
alter table custodia.asset_events enable row level security;
alter table custodia.retirements enable row level security;

create policy read_all on custodia.asset_areas for select to authenticated using (true);
create policy read_all on custodia.staff for select to authenticated using (true);
create policy read_all on custodia.accountants for select to authenticated using (true);
create policy read_all on custodia.asset_types for select to authenticated using (true);

create policy read_assets on custodia.assets for select to authenticated using (custodia.can_see_asset(id));
create policy register_assets on custodia.assets for insert to authenticated with check (custodia.is_staff(asset_area_id));
create policy edit_assets on custodia.assets for update to authenticated
  using (custodia.is_staff(asset_area_id)) with check (custodia.is_staff(asset_area_id));

create policy read_parts on custodia.asset_parts for select to authenticated using (custodia.can_see_asset(asset_id));
create policy write_parts on custodia.asset_parts for all to authenticated
  using (exists (select 1 from custodia.assets a where a.id = asset_id and custodia.is_staff(a.asset_area_id)))
  with check (exists (select 1 from custodia.assets a where a.id = asset_id and custodia.is_staff(a.asset_area_id)));

create policy read_evidences on custodia.evidences for select to authenticated
  using (uploaded_by = public.current_person_id() or custodia.is_accountant()
         or exists (select 1 from custodia.custody_items i join custodia.custodies c on c.id = i.custody_id
                    where (i.delivery_evidence_id = evidences.id or i.return_evidence_id = evidences.id)
                      and (c.person_id = public.current_person_id() or custodia.is_staff(c.asset_area_id))));
create policy upload_evidences on custodia.evidences for insert to authenticated
  with check (uploaded_by = public.current_person_id() and exists (select 1 from custodia.staff s where s.person_id = public.current_person_id()));

create policy read_requests on custodia.requests for select to authenticated
  using (person_id = public.current_person_id() or custodia.is_staff(asset_area_id));
create policy create_requests on custodia.requests for insert to authenticated
  with check (person_id = public.current_person_id()
              and exists (select 1 from custodia.asset_types t where t.id = requests.type_id and t.asset_area_id = requests.asset_area_id));
create policy cancel_requests on custodia.requests for update to authenticated
  using (person_id = public.current_person_id() and status = 'pending')
  with check (person_id = public.current_person_id() and status = 'cancelled');

create policy read_custodies on custodia.custodies for select to authenticated
  using (person_id = public.current_person_id() or custodia.is_staff(asset_area_id) or custodia.is_accountant());
create policy read_items on custodia.custody_items for select to authenticated
  using (exists (select 1 from custodia.custodies c where c.id = custody_id));
create policy read_missing on custodia.missing_parts for select to authenticated
  using (exists (select 1 from custodia.custody_items i where i.id = custody_item_id));
create policy read_events on custodia.asset_events for select to authenticated using (custodia.can_see_asset(asset_id));
create policy read_retirements on custodia.retirements for select to authenticated
  using (custodia.is_accountant() or exists (select 1 from custodia.assets a where a.id = asset_id and custodia.is_staff(a.asset_area_id)));

grant usage on schema custodia to authenticated;
grant select on all tables in schema custodia to authenticated;
revoke select on custodia.folio_counters from authenticated;
grant insert on custodia.assets, custodia.evidences, custodia.requests to authenticated;
grant insert, update, delete on custodia.asset_parts to authenticated;
grant update (name, description, features, brand, model, serial, inventory_tag, purchased_on, warranty_until, value, condition, location, notes) on custodia.assets to authenticated;
grant update (status) on custodia.requests to authenticated;

revoke execute on all functions in schema custodia from public;
grant execute on function custodia.is_staff(uuid) to authenticated;
grant execute on function custodia.is_accountant() to authenticated;
grant execute on function custodia.holds(uuid) to authenticated;
grant execute on function custodia.can_see_asset(uuid) to authenticated;
grant execute on function custodia.fmt(text, integer) to authenticated;
grant execute on function custodia.handover(uuid, uuid[], uuid, uuid, text) to authenticated;
grant execute on function custodia.receive_return(uuid, text, uuid, text[]) to authenticated;
grant execute on function custodia.set_repair(uuid, boolean, text) to authenticated;
grant execute on function custodia.retire(uuid, text, boolean, boolean, boolean) to authenticated;
grant execute on function custodia.confirm_write_off(uuid) to authenticated;
grant execute on function custodia.suggested_cacaos(uuid) to authenticated;
grant execute on function custodia.propose_to_trueque(uuid, integer) to authenticated;
grant execute on function custodia.reject_request(uuid, text) to authenticated;
