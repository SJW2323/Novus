-- Billing: Stripe subscriptions gating tutor access.

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references profiles (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  tier text check (tier in ('bronze', 'silver', 'gold')),
  status text not null default 'incomplete'
    check (status in ('incomplete', 'active', 'past_due', 'canceled', 'unpaid')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table subscriptions enable row level security;

create policy "subscriptions_select_own" on subscriptions
  for select using (auth.uid() = student_id);

-- All writes happen server-side via the Stripe checkout route and webhook
-- handler (service role), same pattern as sessions/session_messages.

create index subscriptions_stripe_customer_id_idx on subscriptions (stripe_customer_id);
