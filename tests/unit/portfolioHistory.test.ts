import assert from "node:assert/strict";
import test from "node:test";
import { portfolioHistory } from "../../lib/helpers/portfolioHistory";

test("portfolio history compares the same trading date across holdings", () => {
  const result = portfolioHistory([
    { shares: 2, points: [{ date: "2026-10-01", close: 10 }, { date: "2026-10-02", close: 12 }] },
    { shares: 3, points: [{ date: "2026-09-30", close: 100 }, { date: "2026-10-02", close: 20 }] },
  ]);
  assert.deepEqual(result, [{ date: "2026-10-02", value: 84 }]);
});

test("a missing constituent prevents presenting a partial portfolio as a complete history", () => {
  assert.deepEqual(portfolioHistory([
    { shares: 1, points: [{ date: "2026-10-02", close: 50 }] },
    { shares: 2, points: [] },
  ]), []);
  assert.deepEqual(portfolioHistory([]), []);
});

test("history remains chronological when provider dates arrive out of order", () => {
  assert.deepEqual(portfolioHistory([{ shares: 2, points: [
    { date: "2026-10-02", close: 30 }, { date: "2026-10-01", close: 20 },
  ] }]), [{ date: "2026-10-01", value: 40 }, { date: "2026-10-02", value: 60 }]);
});
