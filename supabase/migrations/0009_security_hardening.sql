-- Security hardening: protect_profile_admin_fields (0008) only ran BEFORE
-- UPDATE. The profiles_insert_own RLS policy allows any authenticated user
-- to insert their own profile row (auth.uid() = id) but does not restrict
-- which columns that insert can set - so a client could bypass the app's
-- own signup flow entirely and INSERT a profile row with is_admin: true,
-- bonus_sessions: <anything>, trial_used: false, etc, directly against the
-- Supabase REST API. Extend the trigger to also fire BEFORE INSERT, forcing
-- safe server-controlled values there instead of trying to preserve a
-- nonexistent "old" row.
create or replace function protect_profile_admin_fields()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    if TG_OP = 'INSERT' then
      new.is_admin := false;
      new.trial_used := false;
      new.bonus_sessions := 0;
      new.referred_by := null;
      new.referral_reward_granted := false;
      new.referral_code := left(new.id::text, 8);
    else
      new.is_admin := old.is_admin;
      new.trial_used := old.trial_used;
      new.bonus_sessions := old.bonus_sessions;
      new.referred_by := old.referred_by;
      new.referral_reward_granted := old.referral_reward_granted;
      new.referral_code := old.referral_code;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists protect_profile_admin_fields_trigger on profiles;
create trigger protect_profile_admin_fields_trigger
before insert or update on profiles
for each row execute function protect_profile_admin_fields();
