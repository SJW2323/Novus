-- Flashcards generated from session transcripts. Access to how many a
-- student can see is gated by subscription tier at the application layer,
-- not here - this table just stores every card ever generated.

create table flashcards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  session_id uuid references sessions (id) on delete cascade,
  topic_name text,
  front text not null,
  back text not null,
  created_at timestamptz not null default now()
);

alter table flashcards enable row level security;

create policy "flashcards_select_own" on flashcards
  for select using (auth.uid() = student_id);

-- Writes happen server-side (service role) from the session/end route,
-- same pattern as sessions/session_messages/student_topic_mastery.

create index flashcards_student_id_idx on flashcards (student_id);
create index flashcards_session_id_idx on flashcards (session_id);
