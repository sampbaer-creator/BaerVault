import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

async function createDatabase() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth;
    create function auth.jwt() returns jsonb language sql as $$ select '{"org_id":"org_test"}'::jsonb $$;
    create function auth.role() returns text language sql as $$ select 'service_role'::text $$;`);
  const folder = new URL("../../supabase/migrations/", import.meta.url);
  for (const file of (await readdir(folder)).filter((name) => name.endsWith(".sql")).sort()) {
    const sql = (await readFile(new URL(file, folder), "utf8")).replace("create extension if not exists pgcrypto;", "");
    await db.exec(sql);
  }
  return db;
}

test("budget months carry forward categories without copying plans", async () => {
  const db = await createDatabase();
  try {
    const household = "11111111-1111-4111-8111-111111111111";
    await db.query("insert into public.households(id, clerk_org_id, name) values($1, 'org_test', 'Test')", [household]);
    await db.query("insert into public.budget_months(id, household_id, year, month) values($1, $2, 2026, 1)", ["22222222-2222-4222-8222-222222222222", household]);
    await db.query("insert into public.budget_categories(household_id, budget_month_id, name, planned_amount, sort_order) values($1, $2, 'Groceries', 450, 0), ($1, $2, 'Gas', 120, 1)", [household, "22222222-2222-4222-8222-222222222222"]);
    await db.query("insert into public.budget_months(household_id, year, month) values($1, 2026, 2)", [household]);

    const created = await db.query<{ budget_month_id: string; created: boolean }>("select * from public.get_or_create_budget_month($1, 2026, 3)", [household]);
    assert.equal(created.rows[0].created, true);
    assert.deepEqual(
      (await db.query<{ name: string; planned_amount: string; sort_order: number }>("select name, planned_amount, sort_order from public.budget_categories where budget_month_id = $1 order by sort_order", [created.rows[0].budget_month_id])).rows,
      [{ name: "Groceries", planned_amount: "0.00", sort_order: 0 }, { name: "Gas", planned_amount: "0.00", sort_order: 1 }],
    );

    const existing = await db.query<{ budget_month_id: string; created: boolean }>("select * from public.get_or_create_budget_month($1, 2026, 3)", [household]);
    assert.equal(existing.rows[0].created, false);
    assert.equal((await db.query<{ count: number }>("select count(*)::int as count from public.budget_categories where budget_month_id = $1", [created.rows[0].budget_month_id])).rows[0].count, 2);
    assert.equal(Number((await db.query<{ planned_amount: string }>("select planned_amount from public.budget_categories where budget_month_id = $1 and name = 'Groceries'", ["22222222-2222-4222-8222-222222222222"])).rows[0].planned_amount), 450);
  } finally {
    await db.close();
  }
});

test("concurrent month creation has one creator and bank sync uses carry-forward", async () => {
    const db = await createDatabase();
  try {
    const household = "33333333-3333-4333-8333-333333333333";
    const connection = "44444444-4444-4444-8444-444444444444";
    await db.query("insert into public.households(id, clerk_org_id, name) values($1, 'org_test', 'Test')", [household]);
    await db.query("insert into public.budget_months(household_id, year, month) values($1, 2026, 8)", [household]);
    const source = await db.query<{ id: string }>("select id from public.budget_months where household_id = $1 and year = 2026 and month = 8", [household]);
    await db.query("insert into public.budget_categories(household_id, budget_month_id, name, planned_amount, sort_order) values($1, $2, 'Utilities', 200, 0)", [household, source.rows[0].id]);

    const results = await Promise.all([
      db.query<{ created: boolean }>("select created from public.get_or_create_budget_month($1, 2026, 9)", [household]),
      db.query<{ created: boolean }>("select created from public.get_or_create_budget_month($1, 2026, 9)", [household]),
    ]);
    assert.equal(results.filter((result) => result.rows[0].created).length, 1);

    await db.query("insert into public.bank_connections(id, household_id, provider, provider_enrollment_id, provider_user_id, institution_name, encrypted_access_token, environment, created_by) values($1, $2, 'plaid', 'item', 'user', 'Bank', 'encrypted', 'sandbox', 'user')", [connection, household]);
    const accounts = [{ providerAccountId: "account", name: "Checking", type: "checking", balance: -25, status: "open", lastFour: "1234" }];
    const transactions = [{ providerAccountId: "account", providerTransactionId: "tx-carry", description: "Utilities", amount: 25, category: "BILLS_UTILITIES", status: "posted", date: "2026-10-09", raw: {} }];
    await db.query("select public.apply_bank_sync($1, $2, $3, $4::jsonb, $5::jsonb, $6::text[])", [connection, null, "cursor-1", JSON.stringify(accounts), JSON.stringify(transactions), []]);
    const syncedMonth = await db.query<{ id: string }>("select id from public.budget_months where household_id = $1 and year = 2026 and month = 10", [household]);
    assert.equal((await db.query<{ count: number }>("select count(*)::int as count from public.budget_categories where household_id = $1 and budget_month_id = $2 and name = 'Utilities'", [household, syncedMonth.rows[0].id])).rows[0].count, 1);
  } finally {
    await db.close();
  }
});
