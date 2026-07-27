-- Referral program: a student's referral code is just the first 8 chars
-- of their own id, so no extra column is needed to generate or look one
-- up. This just adds the bookkeeping for who referred whom and the bonus
-- session credits each side earns.

alter table profiles add column referred_by uuid references profiles (id);
alter table profiles add column bonus_sessions int not null default 0;
alter table profiles add column referral_reward_granted boolean not null default false;
