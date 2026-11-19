import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("budget advice quota is household scoped, shared, bounded and fails without membership", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated;
      create schema auth;
      create function auth.jwt() returns jsonb language sql as $$ select current_setting('test.jwt', true)::jsonb $$;
      create table public.households(id uuid primary key, clerk_org_id text unique);
      insert into public.households values ('11111111-1111-4111-8111-111111111111','org_a'), ('22222222-2222-4222-8222-222222222222','org_b');`);
    await db.exec(await readFile(new URL("../../supabase/migrations/20261119000100_budget_advice_rate_limits.sql", import.meta.url), "utf8"));
    const jwt = async (value: object) => { await db.query("select set_config('test.jwt', $1, false)", [JSON.stringify(value)]); };
    const consume = async () => (await db.query<{ allowed: boolean }>("select public.consume_budget_advice_quota() as allowed")).rows[0].allowed;
    await jwt({ sub: "user_a", org_id: "missing" });
    assert.equal(await consume(), false);
    await jwt({ org_id: "org_a" });
    assert.equal(await consume(), false);
    await jwt({ sub: "user_a", org_id: "org_a" });
    assert.equal(await consume(), true);
    await jwt({ sub: "user_b", org_id: "org_a" });
    assert.equal(await consume(), false);
    await jwt({ sub: "user_b", o: { id: "org_b" } });
    assert.equal(await consume(), true);
    await jwt({ sub: "user_a", org_id: "org_a" });
    for (let i = 1; i < 20; i++) {
      await db.exec("update public.budget_advice_rate_limits set last_request = now() - interval '2 minutes'");
      assert.equal(await consume(), true);
    }
    await db.exec("update public.budget_advice_rate_limits set last_request = now() - interval '2 minutes'");
    assert.equal(await consume(), false);
    await db.exec("update public.budget_advice_rate_limits set day_start = current_date - 1");
    assert.equal(await consume(), true);
    const permissions = await db.query<{ allowed: boolean }>("select has_table_privilege('authenticated', 'public.budget_advice_rate_limits', 'UPDATE') as allowed");
    assert.equal(permissions.rows[0].allowed, false);
    await db.exec("set role anon");
    await assert.rejects(consume(), /permission denied/);
  } finally { await db.close(); }
});
