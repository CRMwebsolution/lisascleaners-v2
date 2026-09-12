-- Run in Carteret County Biz SQL editor if these columns are not on lisa_gallery_items yet.

alter table public.lisa_gallery_items add column if not exists kind text not null default 'single';
alter table public.lisa_gallery_items add column if not exists after_path text;
alter table public.lisa_gallery_items add column if not exists site_key text;
alter table public.lisa_gallery_items add column if not exists caption text;

do $$
begin
  alter table public.lisa_gallery_items drop constraint if exists lisa_gallery_items_kind_check;
  alter table public.lisa_gallery_items add constraint lisa_gallery_items_kind_check
    check (kind in ('single', 'before_after', 'site'));
exception when others then null;
end $$;

create unique index if not exists lisa_gallery_items_site_key_uidx
  on public.lisa_gallery_items (site_key)
  where site_key is not null;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lisa_gallery_items' and policyname = 'lisa_gallery_public_read'
  ) then
    create policy lisa_gallery_public_read
      on public.lisa_gallery_items
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;
