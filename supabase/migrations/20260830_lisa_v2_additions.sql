-- Add-only Lisa v2 objects for Carteret County Biz (rwmpqlnakmexugwihisy).
-- Do not drop or alter tables that this file did not create.

create table if not exists public.lisa_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  business_id uuid not null references public.business_profiles (id),
  full_name text not null,
  role text not null check (role in ('admin', 'staff')),
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.lisa_quote_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles (id),
  name text not null,
  phone text not null,
  email text,
  job_address text not null,
  type_of_clean text not null,
  preferred_date date,
  quote_time text,
  cleaning_schedule text,
  cleaning_time text,
  notes text,
  consent_at timestamptz,
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.lisa_quote_requests add column if not exists quote_time text;
alter table public.lisa_quote_requests add column if not exists cleaning_schedule text;
alter table public.lisa_quote_requests add column if not exists cleaning_time text;

create table if not exists public.lisa_jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles (id),
  customer_name text not null,
  customer_phone text,
  customer_email text,
  address text not null,
  type_of_clean text not null,
  price numeric,
  job_date date not null,
  job_time time not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed')),
  notes text,
  source_request_id uuid references public.lisa_quote_requests (id),
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table if not exists public.lisa_job_assignments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles (id),
  job_id uuid not null references public.lisa_jobs (id) on delete cascade,
  assignee_id uuid not null references public.lisa_profiles (id) on delete cascade,
  employee_notes text,
  marked_complete_at timestamptz,
  unique (job_id, assignee_id)
);

create table if not exists public.lisa_documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles (id),
  kind text not null check (kind in ('quote', 'invoice')),
  number text not null,
  customer text,
  job_id uuid references public.lisa_jobs (id),
  storage_path text,
  total numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.lisa_gallery_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles (id),
  path text not null,
  alt text not null,
  created_at timestamptz not null default now()
);

create index if not exists lisa_quote_requests_biz_status_idx on public.lisa_quote_requests (business_id, status, created_at desc);
create index if not exists lisa_jobs_biz_date_idx on public.lisa_jobs (business_id, job_date, job_time);
create index if not exists lisa_profiles_biz_idx on public.lisa_profiles (business_id);

alter table public.lisa_profiles enable row level security;
alter table public.lisa_quote_requests enable row level security;
alter table public.lisa_jobs enable row level security;
alter table public.lisa_job_assignments enable row level security;
alter table public.lisa_documents enable row level security;
alter table public.lisa_gallery_items enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'lisa_quote_requests' and policyname = 'lisa_anon_insert_requests'
  ) then
    create policy lisa_anon_insert_requests on public.lisa_quote_requests for insert to anon, authenticated with check (true);
  end if;
end $$;
