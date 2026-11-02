-- Custodia · archivos de evidencia (firma, foto o PDF de la hoja firmada) en Supabase Storage.
-- Bucket privado: la ruta es <asset_area_id>/<uuid>.<ext> y la fila de custodia.evidences guarda ruta, tipo, tamaño y sha256.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('custodia-evidence', 'custodia-evidence', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

create policy custodia_evidence_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'custodia-evidence'
              and exists (select 1 from custodia.staff s where s.person_id = public.current_person_id()
                          and s.asset_area_id::text = (storage.foldername(name))[1]));

create policy custodia_evidence_read on storage.objects for select to authenticated
  using (bucket_id = 'custodia-evidence'
         and exists (select 1 from custodia.evidences e where e.storage_path = name));
