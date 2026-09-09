import "server-only";

import { auth } from "@clerk/nextjs/server";

import { decryptBankToken, encryptBankToken } from "@/lib/banking/crypto";
import { plaidRequest } from "@/lib/banking/plaid/client";
import { getPlaidAccountsWithBalances, getPlaidTransactionChanges, plaidProvider } from "@/lib/banking/plaid/provider";
import type { BankConnection } from "@/lib/banking/types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DataAccessError, throwDataError } from "./errors";
import { getCurrentHousehold } from "./households";

const environment = (process.env.PLAID_ENV === "production" ? "production" : "sandbox") as BankConnection["environment"];
export type BankConnectionSummary = { id: string; institutionName: string; status: "connected" | "disconnected" | "sync_error"; disconnectedReason: string | null; lastSyncedAt: string | null; providerEnrollmentId: string };

export async function getBankConnections(): Promise<BankConnectionSummary[]> {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("bank_connections").select("id, institution_name, status, disconnected_reason, last_synced_at, provider_enrollment_id").eq("household_id", household.id).order("created_at");
  if (result.error) throwDataError(result.error, "Could not load bank connections.");
  return (result.data ?? []).map((row) => ({ id: row.id, institutionName: row.institution_name, status: row.status, disconnectedReason: row.disconnected_reason, lastSyncedAt: row.last_synced_at, providerEnrollmentId: row.provider_enrollment_id })) as BankConnectionSummary[];
}

export async function createPlaidLinkToken(connectionId?: string) {
  const { userId } = await auth.protect();
  if (!userId) throw new DataAccessError("Sign in before connecting a bank.");
  const household = await getCurrentHousehold();
  const connection = connectionId ? await getAuthorizedConnection(connectionId) : null;
  const response = await plaidRequest<{ link_token: string }>("/link/token/create", {
    client_name: "BaerVault", language: "en", country_codes: ["US"], user: { client_user_id: `${household.id}:${userId}` },
    ...(connection ? { access_token: decryptBankToken(connection.encryptedAccessToken) } : { products: ["transactions"], transactions: { days_requested: 90 } }),
    ...(process.env.PLAID_WEBHOOK_URL ? { webhook: process.env.PLAID_WEBHOOK_URL } : {}),
  }, environment);
  return { linkToken: response.link_token };
}

export async function completePlaidConnection(publicToken: string, institution: { id: string; name: string }) {
  const { userId } = await auth.protect();
  if (!userId || !publicToken || !institution.id || !institution.name.trim()) throw new DataAccessError("Plaid did not return a valid bank connection.");
  const household = await getCurrentHousehold();
  const exchanged = await plaidRequest<{ access_token: string; item_id: string }>("/item/public_token/exchange", { public_token: publicToken }, environment);
  const admin = createAdminSupabaseClient();
  const existing = await admin.from("bank_connections").select("household_id").eq("provider", "plaid").eq("provider_enrollment_id", exchanged.item_id).maybeSingle();
  if (existing.error) throwDataError(existing.error, "Could not validate the existing bank connection.");
  if (existing.data && existing.data.household_id !== household.id) throw new DataAccessError("That Plaid Item already belongs to another household.");
  const saved = await admin.from("bank_connections").upsert({ household_id: household.id, provider: "plaid", provider_enrollment_id: exchanged.item_id, provider_user_id: userId,
    institution_name: institution.name.trim().slice(0, 160), encrypted_access_token: encryptBankToken(exchanged.access_token), environment, status: "connected", disconnected_reason: null, created_by: userId },
    { onConflict: "provider,provider_enrollment_id" }).select("id, household_id, institution_name, encrypted_access_token, environment").single();
  if (saved.error) throwDataError(saved.error, "Could not save the bank connection.");
  await syncBankConnection({ id: saved.data.id, householdId: saved.data.household_id, institutionName: saved.data.institution_name, provider: "plaid", encryptedAccessToken: saved.data.encrypted_access_token, environment: saved.data.environment } as BankConnection);
}

export async function getAuthorizedConnection(connectionId: string): Promise<BankConnection> {
  const household = await getCurrentHousehold();
  const result = await createAdminSupabaseClient().from("bank_connections").select("id, household_id, institution_name, encrypted_access_token, environment").eq("id", connectionId).eq("household_id", household.id).eq("provider", "plaid").single();
  if (result.error) throwDataError(result.error, "That bank connection could not be found.");
  return { id: result.data.id, householdId: result.data.household_id, institutionName: result.data.institution_name, provider: "plaid", encryptedAccessToken: result.data.encrypted_access_token, environment: result.data.environment } as BankConnection;
}

export async function refreshBankConnection(connectionId: string) { await syncBankConnection(await getAuthorizedConnection(connectionId)); }
export async function disconnectBankConnection(connectionId: string) {
  const connection = await getAuthorizedConnection(connectionId);
  await plaidProvider.disconnect(connection);
  const result = await createAdminSupabaseClient().from("bank_connections").delete().eq("id", connection.id).eq("household_id", connection.householdId);
  if (result.error) throwDataError(result.error, "Plaid was disconnected, but BaerVault could not remove the local connection.");
}

export async function syncBankConnection(connection: BankConnection) {
  const admin = createAdminSupabaseClient();
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const saved = await admin.from("bank_connections").select("sync_cursor").eq("id", connection.id).eq("household_id", connection.householdId).single();
      if (saved.error) throw saved.error;
      const changes = await getPlaidTransactionChanges(connection, saved.data.sync_cursor);
      const accounts = await getPlaidAccountsWithBalances(connection);
      const result = await admin.rpc("apply_bank_sync", {
        connection_id: connection.id,
        expected_cursor: saved.data.sync_cursor,
        next_cursor: changes.cursor,
        account_rows: accounts,
        transaction_rows: changes.rows,
        removed_ids: changes.removed,
      });
      if (!result.error) return;
      if (result.error.code !== "40001" || attempt === 2) throw result.error;
    }
  } catch (error) {
    await admin.from("bank_connections").update({ status: "sync_error" }).eq("id", connection.id).eq("household_id", connection.householdId);
    throw error;
  }
}
