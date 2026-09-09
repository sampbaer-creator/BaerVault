import "server-only";
import { revalidatePath } from "next/cache";

/** Finance screens share balances and entries; invalidate them as one read model. */
export function refreshFinanceViews() {
  for (const path of ["/accounts", "/investments", "/budget", "/transactions", "/cash-flow", "/dashboard", "/recurring", "/goals"]) revalidatePath(path);
}
