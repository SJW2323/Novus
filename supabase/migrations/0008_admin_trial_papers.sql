-- Admin back office, free-trial tracking, and tailored past papers.

alter table profiles add column is_admin boolean not null default false;
alter table profiles add column trial_used boolean not null default false;

-- Server-managed fields on profiles (admin flag, trial state, referral
-- bookkeeping) must only ever change via our service-role routes, never
-- through a client's own "update my profile" call. RLS alone can't express
-- "this column can't change" cleanly, so enforce it with a trigger that
-- resets these fields to their prior value whenever the update comes from
-- anything other than the service role.
create or replace function protect_profile_admin_fields()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    new.is_admin := old.is_admin;
    new.trial_used := old.trial_used;
    new.bonus_sessions := old.bonus_sessions;
    new.referred_by := old.referred_by;
    new.referral_reward_granted := old.referral_reward_granted;
    new.referral_code := old.referral_code;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger protect_profile_admin_fields_trigger
before update on profiles
for each row execute function protect_profile_admin_fields();

-- Simple key/value store for admin-editable marketing copy. Publicly
-- readable (the marketing pages render it), writable only through our
-- admin API routes (service role, after checking profiles.is_admin).
create table site_content (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table site_content enable row level security;

create policy "site_content_select_all" on site_content
  for select using (true);

-- Tailored past papers, generated on demand for Gold students.
create table past_papers (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  exam_board text not null,
  questions jsonb not null,
  created_at timestamptz not null default now()
);

alter table past_papers enable row level security;

create policy "past_papers_select_own" on past_papers
  for select using (auth.uid() = student_id);

create index past_papers_student_id_idx on past_papers (student_id);
