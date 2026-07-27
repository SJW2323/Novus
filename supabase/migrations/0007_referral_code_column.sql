-- ilike doesn't work directly against a uuid column via PostgREST (no
-- implicit cast), which silently broke referral code lookups. Store the
-- code as a real text column instead of pattern-matching against id.

alter table profiles add column referral_code text unique;

update profiles set referral_code = left(id::text, 8) where referral_code is null;
