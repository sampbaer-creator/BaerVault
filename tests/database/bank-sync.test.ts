import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("bank sync is atomic, idempotent, household scoped, and handles removals", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role;
      create schema auth;
      create function auth.jwt() returns jsonb language sql as $$ select '{"org_id":"org_test"}'::jsonb $$;
      create function auth.role() returns text language sql as $$ select 'service_role'::text $$;`);
    const folder = new URL("../../supabase/migrations/", import.meta.url);
    for (const file of (await readdir(folder)).filter((f) => f.endsWith(".sql")).sort()) {
      const sql = (await readFile(new URL(file, folder), "utf8")).replace("create extension if not exists pgcrypto;", "");
      await db.exec(sql);
    }
    const household = "11111111-1111-4111-8111-111111111111";
    const connection = "22222222-2222-4222-8222-222222222222";
    await db.query(`insert into public.households(id,clerk_org_id,name) values($1,'org_test','Test');`, [household]);
    await db.query(`insert into public.bank_connections(id,household_id,provider,provider_enrollment_id,provider_user_id,institution_name,encrypted_access_token,environment,created_by) values($1,$2,'plaid','item','user','Bank','encrypted','sandbox','user')`, [connection, household]);
    const accounts = [{ providerAccountId: "account", name: "Checking", type: "checking", balance: -25, status: "open", lastFour: "1234" }];
    const transaction = { providerAccountId: "account", providerTransactionId: "tx-1", description: "Groceries", amount: 25, category: "FOOD_AND_DRINK_GROCERIES", status: "posted", date: "2026-09-09", raw: {} };
    const sync = (expected: string | null, next: string, rows = [transaction], removed: string[] = []) => db.query("select public.apply_bank_sync($1,$2,$3,$4::jsonb,$5::jsonb,$6::text[])", [connection, expected, next, JSON.stringify(accounts), JSON.stringify(rows), removed]);
    await sync(null, "cursor-1");
    await sync("cursor-1", "cursor-2");
    assert.equal((await db.query<{ count: number }>("select count(*)::int as count from budget_entries")).rows[0].count, 1);
    assert.equal(Number((await db.query<{ balance: string }>("select balance from financial_accounts")).rows[0].balance), -25);
    await assert.rejects(sync(null, "stale-cursor"), /cursor changed/);
    await assert.rejects(sync("cursor-2", "broken", [{ ...transaction, amount: 999, date: "invalid" }]), /date/);
    assert.equal(Number((await db.query<{ amount: string }>("select amount from budget_entries")).rows[0].amount), 25);
    // Equal-looking real purchases with different bank IDs must both survive.
    await sync("cursor-2", "cursor-3", [transaction, { ...transaction, providerTransactionId: "tx-2" }]);
    assert.equal((await db.query<{ count: number }>("select count(*)::int as count from budget_entries")).rows[0].count, 2);
    await sync("cursor-3", "cursor-4", [{ ...transaction, amount: 30 }]);
    assert.equal(Number((await db.query<{ amount: string }>("select amount from budget_entries order by amount desc limit 1")).rows[0].amount), 30);
    const transactionId = (await db.query<{ id: string }>("select id from bank_transactions limit 1")).rows[0].id;
    assert.equal((await db.query<{ reviewed_at: string | null }>("select reviewed_at from bank_transactions where id=$1", [transactionId])).rows[0].reviewed_at, null);
    await sync("cursor-4", "cursor-5", [], ["tx-1"]);
    assert.equal((await db.query<{ count: number }>("select count(*)::int as count from budget_entries")).rows[0].count, 1);
    // Review state is writable only inside the active Clerk household.
    await db.query("insert into households(id,clerk_org_id,name) values('33333333-3333-4333-8333-333333333333','org_other','Other')");
    await db.exec(`create or replace function auth.jwt() returns jsonb language sql as $$ select current_setting('request.jwt.claims', true)::jsonb $$;`);
    await db.exec("grant usage on schema auth to authenticated; grant execute on function auth.jwt() to authenticated");
    await db.query("select set_config('request.jwt.claims', '{\"org_id\":\"org_test\"}', false)");
    await db.exec("set role authenticated");
    assert.equal((await db.query<{ count: number }>("select count(*)::int as count from bank_transactions where reviewed_at is null")).rows[0].count, 1);
    const review = await db.query<{ id: string }>("update bank_transactions set reviewed_at=now() where id=$1 returning id", [transactionId]);
    assert.equal(review.rows.length, 1);
    await assert.rejects(db.query("update bank_transactions set description='changed' where id=$1", [transactionId]), /permission denied/);
    await db.query("select set_config('request.jwt.claims', '{\"org_id\":\"org_other\"}', false)");
    assert.equal((await db.query<{ count: number }>("select count(*)::int as count from bank_transactions where id=$1", [transactionId])).rows[0].count, 0);
    const foreignReview = await db.query<{ id: string }>("update bank_transactions set reviewed_at=null where id=$1 returning id", [transactionId]);
    assert.equal(foreignReview.rows.length, 0);
    await db.query("select set_config('request.jwt.claims', '{\"org_id\":\"org_test\"}', false)");
    // Authenticated clients cannot call the service-only importer.
    await assert.rejects(sync("cursor-5", "forbidden"), /permission denied/);
    await db.exec("reset role");
    // Deleting a connection no longer tries to null a non-null household ID.
    await db.query("delete from bank_connections where id=$1", [connection]);
    assert.equal((await db.query<{ count: number }>("select count(*)::int as count from bank_transactions")).rows[0].count, 0);
  } finally { await db.close(); }
});
