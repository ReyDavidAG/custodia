insert into custodia.asset_areas (area_id, name)
select id, 'Sistemas' from public.areas where code = 'TECN';

insert into custodia.asset_types (asset_area_id, code, name, group_code, icon, position)
select aa.id, t.code, t.name, t.grp, t.icon, t.pos
from custodia.asset_areas aa, (values
  ('laptop', 'Laptop', 'hardware', 'laptop', 1),
  ('desktop', 'PC de escritorio', 'hardware', 'monitor', 2),
  ('monitor', 'Monitor', 'hardware', 'monitor', 3),
  ('phone', 'Celular', 'hardware', 'phone', 4),
  ('tablet', 'Tableta', 'hardware', 'phone', 5),
  ('printer', 'Impresora', 'hardware', 'printer', 6),
  ('accessory', 'Accesorio', 'hardware', 'plug', 7),
  ('email', 'Cuenta de correo', 'license', 'key', 8),
  ('office', 'Office 365', 'license', 'key', 9),
  ('adobe', 'Adobe', 'license', 'key', 10)
) as t (code, name, grp, icon, pos);

insert into custodia.assets (asset_area_id, type_id, company_id, name, features, brand, model, serial, purchased_on, warranty_until, value)
select aa.id, t.id, c.id, a.name, a.features, a.brand, a.model, a.serial, a.bought::date, a.warranty::date, a.value
from custodia.asset_areas aa
join custodia.asset_types t on t.asset_area_id = aa.id
cross join public.companies c
join (values
  ('laptop', 'Laptop de ejemplo 1', '14", 16 GB, SSD 512 GB', 'Marca A', 'Modelo L14', 'SER-0001', '2025-02-11', '2028-02-11', 24800),
  ('laptop', 'Laptop de ejemplo 2', '14", 16 GB, SSD 512 GB', 'Marca A', 'Modelo L14', 'SER-0002', '2026-04-18', '2029-04-18', 27900),
  ('laptop', 'Laptop de ejemplo 3', '13", 8 GB, SSD 256 GB', 'Marca B', 'Modelo P13', 'SER-0003', '2019-08-10', '2022-08-10', 16200),
  ('monitor', 'Monitor de ejemplo 1', '24", HDMI', 'Marca C', 'Modelo M24', 'SER-0101', '2025-02-11', '2028-02-11', 4600),
  ('phone', 'Celular de ejemplo 1', '128 GB', 'Marca D', 'Modelo C5', 'SER-0201', '2025-09-01', '2026-09-01', 7800),
  ('printer', 'Impresora de ejemplo 1', 'Láser, red', 'Marca E', 'Modelo I5', 'SER-0301', '2023-11-08', '2025-11-08', 6400),
  ('office', 'Licencia Office de ejemplo', 'Plan E3', 'Microsoft', 'Office 365 E3', null, '2026-01-01', '2026-12-31', 0)
) as a (type_code, name, features, brand, model, serial, bought, warranty, value) on a.type_code = t.code
where c.code = 'DEMO';

insert into custodia.asset_parts (asset_id, name, position)
select a.id, p.name, p.pos
from custodia.assets a
join (values ('SER-0001', 'Cargador', 1), ('SER-0001', 'Mouse inalámbrico', 2), ('SER-0001', 'Funda', 3), ('SER-0002', 'Cargador', 1), ('SER-0003', 'Cargador', 1), ('SER-0101', 'Cable HDMI', 1), ('SER-0201', 'Cargador', 1), ('SER-0201', 'Funda', 2)) as p (serial, name, pos)
  on p.serial = a.serial;
