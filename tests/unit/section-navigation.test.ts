import assert from "node:assert/strict";
import { test } from "node:test";

import { sectionHref, selectedTab } from "../../lib/helpers/sectionNavigation";

test("legacy section links retain the selected month", () => {
  assert.equal(sectionHref("/budget", "cash-flow", { year: "2026", month: "8" }), "/budget?tab=cash-flow&year=2026&month=8");
  assert.equal(sectionHref("/demo/transactions", "recurring", { month: "8" }), "/demo/transactions?tab=recurring&month=8");
});

test("unknown tabs fall back to the section overview", () => {
  assert.equal(selectedTab("bogus", ["accounts", "investments"], "accounts"), "accounts");
  assert.equal(selectedTab("investments", ["accounts", "investments"], "accounts"), "investments");
});
