create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  target_amount numeric(14,2) not null check (target_amount > 0),
  saved_amount numeric(14,2) not null default 0 check (saved_amount >= 0),
  target_date date,
  monthly_contribution numeric(14,2) not null default 0 check (monthly_contribution >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index savings_goals_household_id_idx on public.savings_goals(household_id);
create trigger savings_goals_set_updated_at before update on public.savings_goals
for each row execute function public.set_updated_at();

alter table public.savings_goals enable row level security;
alter table public.savings_goals force row level security;
revoke all on public.savings_goals from anon;
grant select, insert, update, delete on public.savings_goals to authenticated;

create policy savings_goals_select on public.savings_goals for select to authenticated
using (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()));
create policy savings_goals_insert on public.savings_goals for insert to authenticated
with check (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()));
create policy savings_goals_update on public.savings_goals for update to authenticated
using (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()))
with check (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()));
create policy savings_goals_delete on public.savings_goals for delete to authenticated
using (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()));
