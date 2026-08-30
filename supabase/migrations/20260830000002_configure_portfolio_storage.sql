insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = true;

create policy "Public can view portfolio media"
on storage.objects
for select
to public
using (bucket_id = 'portfolio');

create policy "Authenticated users can upload portfolio media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'portfolio');

create policy "Authenticated users can delete portfolio media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'portfolio');