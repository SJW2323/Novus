-- Novus schema: accounts, syllabus reference data, learning memory, session transcripts.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Accounts
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student', 'parent')),
  exam_board text check (exam_board in ('AQA', 'OCR', 'Edexcel')),
  year_group text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Syllabus reference data (seeded, not user-owned)
-- ---------------------------------------------------------------------------

create table syllabus_topics (
  id uuid primary key default gen_random_uuid(),
  exam_board text not null check (exam_board in ('AQA', 'OCR', 'Edexcel')),
  unit_code text,
  topic_name text not null,
  parent_topic_id uuid references syllabus_topics (id) on delete cascade,
  order_index int not null default 0
);

alter table syllabus_topics enable row level security;

create policy "syllabus_topics_read_all" on syllabus_topics
  for select using (true);

-- ---------------------------------------------------------------------------
-- Learning memory
-- ---------------------------------------------------------------------------

create table student_topic_mastery (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  topic_id uuid not null references syllabus_topics (id) on delete cascade,
  mastery_level numeric(3, 2) not null default 0 check (mastery_level between 0 and 1),
  confidence numeric(3, 2) not null default 0 check (confidence between 0 and 1),
  times_covered int not null default 0,
  last_reviewed_at timestamptz,
  notes text,
  updated_at timestamptz not null default now(),
  unique (student_id, topic_id)
);

alter table student_topic_mastery enable row level security;

create policy "mastery_select_own" on student_topic_mastery
  for select using (auth.uid() = student_id);

-- writes to mastery happen server-side (service role, via the summarization step)

create table learning_profile (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references profiles (id) on delete cascade,
  style_notes jsonb not null default '{}'::jsonb,
  pacing_notes text,
  engagement_notes text,
  raw_summary text,
  updated_at timestamptz not null default now()
);

alter table learning_profile enable row level security;

create policy "learning_profile_select_own" on learning_profile
  for select using (auth.uid() = student_id);

-- ---------------------------------------------------------------------------
-- Sessions + transcripts
-- ---------------------------------------------------------------------------

create table sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  anam_session_id text,
  status text not null default 'active' check (status in ('active', 'completed', 'error')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

alter table sessions enable row level security;

create policy "sessions_select_own" on sessions
  for select using (auth.uid() = student_id);

create table session_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  role text not null check (role in ('student', 'tutor')),
  content text not null,
  topic_tag uuid references syllabus_topics (id),
  created_at timestamptz not null default now()
);

alter table session_messages enable row level security;

create policy "session_messages_select_own" on session_messages
  for select using (
    exists (
      select 1 from sessions
      where sessions.id = session_messages.session_id
        and sessions.student_id = auth.uid()
    )
  );

create table session_summaries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references sessions (id) on delete cascade,
  summary text,
  topics_covered jsonb not null default '[]'::jsonb,
  mastery_deltas jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now()
);

alter table session_summaries enable row level security;

create policy "session_summaries_select_own" on session_summaries
  for select using (
    exists (
      select 1 from sessions
      where sessions.id = session_summaries.session_id
        and sessions.student_id = auth.uid()
    )
  );

-- All inserts/updates on sessions, session_messages, session_summaries, and
-- student_topic_mastery are performed server-side with the Supabase service
-- role key (see src/lib/supabase/admin.ts), which bypasses RLS. Students only
-- ever read their own rows directly.

create index session_messages_session_id_idx on session_messages (session_id);
create index student_topic_mastery_student_id_idx on student_topic_mastery (student_id);
create index syllabus_topics_exam_board_idx on syllabus_topics (exam_board);
