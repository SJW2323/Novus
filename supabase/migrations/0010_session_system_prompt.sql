-- Cache the per-session tutor system prompt instead of recomputing it (3
-- queries: profile, learning_profile, student_topic_mastery) on every single
-- conversational turn. It only depends on data that's fixed for the lifetime
-- of a session, so compute it once at session/start and read it back here.
alter table sessions add column if not exists system_prompt text;
