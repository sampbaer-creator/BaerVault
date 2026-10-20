import assert from "node:assert/strict";
import test from "node:test";
import { countUnreviewedTransactions, sortReviewQueue, type ReviewQueueItem } from "../../lib/helpers/reviewQueue";

const rows: ReviewQueueItem[] = [
  { id: "old", description: "Cafe", amount: 12, providerCategory: "FOOD", transactionDate: "2026-10-01", accountId: "acct", budgetEntryId: "entry-1" },
  { id: "new", description: "Market", amount: 45, providerCategory: "GROCERY", transactionDate: "2026-10-03", accountId: "acct", budgetEntryId: "entry-2" },
];

test("review queue count reflects only the provided household rows", () => {
  assert.equal(countUnreviewedTransactions(rows), 2);
  assert.equal(countUnreviewedTransactions([]), 0);
});

test("review queue sorts newest transactions first", () => {
  assert.deepEqual(sortReviewQueue(rows).map(({ id }) => id), ["new", "old"]);
});
