export type ReviewQueueItem = {
  id: string;
  description: string;
  amount: number;
  providerCategory: string | null;
  transactionDate: string;
  accountId: string;
  budgetEntryId: string | null;
};

export function countUnreviewedTransactions(items: readonly ReviewQueueItem[]) {
  return items.length;
}

export function sortReviewQueue(items: readonly ReviewQueueItem[]) {
  return [...items].sort((a, b) => b.transactionDate.localeCompare(a.transactionDate) || a.description.localeCompare(b.description));
}
