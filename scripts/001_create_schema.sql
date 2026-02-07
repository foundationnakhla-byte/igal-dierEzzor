-- =============================================
-- Legal Clinic Case Management System
-- Database Schema for Deir ez-Zor Returnees
-- =============================================

-- 1) Profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'data_entry',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- All authenticated users can see all profiles (needed for display names etc)
create policy "authenticated_select_profiles" on public.profiles
  for select using (auth.uid() is not null);

-- Users can insert their own profile (for trigger)
create policy "users_insert_own_profile" on public.profiles
  for insert with check (true);

-- Users can update their own profile
create policy "users_update_own_profile" on public.profiles
  for update using (auth.uid() = id);

-- Admin can update all profiles (uses subquery)
create policy "admin_update_all_profiles" on public.profiles
  for update using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- 2) Case number sequence
create sequence if not exists public.case_number_seq start 1;

-- 3) Cases (beneficiary files)
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_number text unique not null default ('DZ-' || lpad(nextval('public.case_number_seq')::text, 5, '0')),
  full_name text not null,
  mother_name text,
  gender text not null default 'male',
  date_of_birth date,
  age integer,
  phone text,
  neighborhood text,
  family_size integer,
  family_status text,
  displacement_location text,
  return_date date,
  return_reason text,
  housing_status text,
  civil_documents text[] default '{}',
  documents_status text,
  legal_issue_type text[] default '{}',
  legal_issue_details text,
  priority text not null default 'medium',
  status text not null default 'new',
  data_consent boolean not null default false,
  data_consent_date timestamptz,
  photo_consent boolean default false,
  data_sharing_level text default 'internal',
  created_by uuid not null references auth.users(id),
  assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cases enable row level security;

create policy "staff_select_cases" on public.cases
  for select using (auth.uid() is not null);

create policy "staff_insert_cases" on public.cases
  for insert with check (auth.uid() is not null);

create policy "staff_update_cases" on public.cases
  for update using (auth.uid() is not null);

-- 4) Consultations
create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  consultation_date timestamptz not null default now(),
  consultation_type text not null default 'legal_advice',
  summary text not null,
  recommendations text,
  proposed_actions text,
  follow_up_date date,
  follow_up_by uuid references auth.users(id),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.consultations enable row level security;

create policy "staff_select_consultations" on public.consultations
  for select using (auth.uid() is not null);

create policy "staff_insert_consultations" on public.consultations
  for insert with check (auth.uid() is not null);

create policy "staff_update_consultations" on public.consultations
  for update using (auth.uid() is not null);

-- 5) Referrals
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  referral_agency text not null,
  referral_reason text not null,
  referral_date timestamptz not null default now(),
  status text not null default 'sent',
  notes text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.referrals enable row level security;

create policy "staff_select_referrals" on public.referrals
  for select using (auth.uid() is not null);

create policy "staff_insert_referrals" on public.referrals
  for insert with check (auth.uid() is not null);

create policy "staff_update_referrals" on public.referrals
  for update using (auth.uid() is not null);

-- 6) Audit Log
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy "admin_select_audit_log" on public.audit_log
  for select using (auth.uid() is not null);

create policy "staff_insert_audit_log" on public.audit_log
  for insert with check (auth.uid() is not null);

-- 7) Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
    coalesce(new.raw_user_meta_data ->> 'role', 'data_entry')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 8) Updated_at triggers
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cases_updated_at
  before update on public.cases
  for each row
  execute function public.update_updated_at();

create trigger referrals_updated_at
  before update on public.referrals
  for each row
  execute function public.update_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at();
