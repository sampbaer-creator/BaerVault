import "server-only";

import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "node:crypto";

import { digestNonce, encryptBankToken } from "@/lib/banking/crypto";
import { tellerProvider } from "@/lib/banking/teller/provider";
import { verifyTellerEnrollment, type TellerEnrollmentResult } from "@/lib/banking/teller/signatures";
import type { BankConnection } from "@/lib/banking/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

import { DataAccessError, throwDataError } from "./errors";
import { getCurrentHousehold } from "./households";

const environment = "development" as const;

export type BankConnectionSummary = {
  id: string; institutionName: string; status: "connected" | "disconnected" | "sync_error";
  disconnectedReason: string | null; lastSyncedAt: string | null; providerEnrollmentId: string;
};

export async function getBankConnections(): Promise<BankConnectionSummary[]> {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("bank_connections")
    .select("id, institution_name, status, disconnected_reason, last_synced_at, provider_enrollment_id")
    .eq("household_id", household.id).order("created_at");
  if (result.error) throwDataError(result.error, "Could not load bank connections.");
  return (result.data ?? []).map((row) => ({ id: row.id, institutionName: row.institution_name,
    status: row.status, disconnectedReason: row.disconnected_reason, lastSyncedAt: row.last_synced_at,
    providerEnrollmentId: row.provider_enrollment_id })) as BankConnectionSummary[];
}

export async function createConnectionNonce() {
  const { userId } = await auth.protect();
  if (!userId) throw new DataAccessError("Sign in before connecting a bank.");
  const household = await getCurrentHousehold();
  const nonce = randomBytes(32).toString("base64url");
  const result = await createServerSupabaseClient().from("bank_connection_nonces").insert({
    household_id: household.id, nonce_digest: digestNonce(nonce), created_by: userId,
    environment, expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
  });
  if (result.error) throwDataError(result.error, "Could not start a secure bank connection.");
  return { nonce, environment, applicationId: process.env.NEXT_PUBLIC_TELLER_APPLICATION_ID ?? "" };
}

export async function completeTellerEnrollment(nonce: string, enrollment: TellerEnrollmentResult) {
  const { userId } = await auth.protect();
  if (!userId) throw new DataAccessError("Sign in before connecting a bank.");
  const household = await getCurrentHousehold();
  const supabase = createServerSupabaseClient();
  const consumed = await supabase.from("bank_connection_nonces").update({ consumed_at: new Date().toISOString() })
    .eq("household_id", household.id).eq("created_by", userId).eq("nonce_digest", digestNonce(nonce))
    .is("consumed_at", null).gt("expires_at", new Date().toISOString()).select("id").maybeSingle();
  if (consumed.error) throwDataError(consumed.error, "Could not validate the bank connection session.");
  if (!consumed.data) throw new DataAccessError("This bank connection session expired or was already used.");
  if (!verifyTellerEnrollment(enrollment, nonce, environment)) throw new DataAccessError("Teller enrollment signature verification failed.");

  const admin = createAdminSupabaseClient();
  const existing = await admin.from("bank_connections").select("household_id")
    .eq("provider", "teller").eq("provider_enrollment_id", enrollment.enrollment.id).maybeSingle();
  if (existing.error) throwDataError(existing.error, "Could not validate the existing bank connection.");
  if (existing.data && existing.data.household_id !== household.id) throw new DataAccessError("That Teller enrollment already belongs to another household.");
  const saved = await admin.from("bank_connections").upsert({ household_id: household.id, provider: "teller",
    provider_enrollment_id: enrollment.enrollment.id, provider_user_id: enrollment.user.id,
    institution_name: enrollment.enrollment.institution.name, encrypted_access_token: encryptBankToken(enrollment.accessToken),
    environment, status: "connected", disconnected_reason: null, created_by: userId },
    { onConflict: "provider,provider_enrollment_id" }).select("id, household_id, encrypted_access_token, environment").single();
  if (saved.error) throwDataError(saved.error, "Could not save the bank connection.");
  await syncBankConnection({ id: saved.data.id, householdId: saved.data.household_id, provider: "teller",
    encryptedAccessToken: saved.data.encrypted_access_token, environment: saved.data.environment } as BankConnection);
}

async function getAuthorizedConnection(connectionId: string): Promise<BankConnection> {
  const household = await getCurrentHousehold();
  const result = await createAdminSupabaseClient().from("bank_connections")
    .select("id, household_id, encrypted_access_token, environment")
    .eq("id", connectionId).eq("household_id", household.id).single();
  if (result.error) throwDataError(result.error, "That bank connection could not be found.");
  return { id: result.data.id, householdId: result.data.household_id, provider: "teller",
    encryptedAccessToken: result.data.encrypted_access_token, environment: result.data.environment } as BankConnection;
}

export async function refreshBankConnection(connectionId: string) {
  await syncBankConnection(await getAuthorizedConnection(connectionId));
}

export async function disconnectBankConnection(connectionId: string) {
  const connection = await getAuthorizedConnection(connectionId);
  await tellerProvider.disconnect(connection);
  const result = await createAdminSupabaseClient().from("bank_connections").delete()
    .eq("id", connection.id).eq("household_id", connection.householdId);
  if (result.error) throwDataError(result.error, "Teller was disconnected, but BearVault could not remove the local connection.");
}

export async function syncBankConnection(connection: BankConnection) {
  const supabase = createAdminSupabaseClient();
  try {
    const accounts = await tellerProvider.getAccounts(connection);
    for (const account of accounts) {
      const balance = await tellerProvider.getBalances(connection, account.providerAccountId);
      const saved = await supabase.from("financial_accounts").upsert({ household_id: connection.householdId,
        bank_connection_id: connection.id, provider_account_id: account.providerAccountId, name: account.name,
        institution: account.institution, account_type: account.type, ownership: "joint",
        balance: Math.abs(balance.ledger), credit_limit: null, provider_status: account.status,
        last_four: account.lastFour, sync_status: "synced" },
        { onConflict: "bank_connection_id,provider_account_id" }).select("id").single();
      if (saved.error) throw saved.error;
      const start = new Date(); start.setUTCDate(start.getUTCDate() - 90);
      const transactions = await tellerProvider.getTransactions(connection, account.providerAccountId, start.toISOString().slice(0, 10));
      if (transactions.length) {
        const imported = await supabase.from("bank_transactions").upsert(transactions.map((transaction) => ({
          household_id: connection.householdId, financial_account_id: saved.data.id, provider: "teller",
          provider_transaction_id: transaction.providerTransactionId, amount: transaction.amount,
          description: transaction.description, category: transaction.category, counterparty_name: transaction.counterpartyName,
          transaction_type: transaction.transactionType, status: transaction.status, transaction_date: transaction.date,
          running_balance: transaction.runningBalance, raw_provider_data: transaction.raw,
        })), { onConflict: "financial_account_id,provider_transaction_id" });
        if (imported.error) throw imported.error;
      }
    }
    const updated = await supabase.from("bank_connections").update({ status: "connected", disconnected_reason: null,
      last_synced_at: new Date().toISOString() }).eq("id", connection.id).eq("household_id", connection.householdId);
    if (updated.error) throw updated.error;
  } catch (error) {
    await supabase.from("bank_connections").update({ status: "sync_error" }).eq("id", connection.id).eq("household_id", connection.householdId);
    throw error;
  }
}
