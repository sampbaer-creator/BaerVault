alter table public.budget_entries
  add column created_by_clerk_user_id text;

create index budget_entries_creator_date_idx
  on public.budget_entries (household_id, created_by_clerk_user_id, entry_date desc)
  where created_by_clerk_user_id is not null;

comment on column public.budget_entries.created_by_clerk_user_id is
  'Clerk user ID of the member who logged the purchase; null for imported or legacy entries.';

-- Existing household-scoped RLS policies on budget_entries also protect this field.
