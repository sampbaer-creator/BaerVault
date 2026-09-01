import "server-only";

import { decryptBankToken } from "@/lib/banking/crypto";
import type { BankConnection } from "@/lib/banking/types";

type PlaidError = { error_code?: string; error_message?: string; request_id?: string };

function configuration(environment = process.env.PLAID_ENV ?? "sandbox") {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  if (!clientId || !secret) throw new Error("Plaid is not configured.");
  if (environment !== "sandbox" && environment !== "production") throw new Error("PLAID_ENV must be sandbox or production.");
  return { clientId, secret, baseUrl: `https://${environment}.plaid.com` };
}

export async function plaidRequest<T>(path: string, body: Record<string, unknown>, environment?: string): Promise<T> {
  const config = configuration(environment);
  const response = await fetch(`${config.baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "PLAID-CLIENT-ID": config.clientId, "PLAID-SECRET": config.secret },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const payload = await response.json() as T & PlaidError;
  if (!response.ok) throw new Error(payload.error_message ?? payload.error_code ?? `Plaid request failed (${response.status}).`);
  return payload;
}

export function plaidConnectionRequest<T>(connection: BankConnection, path: string, body: Record<string, unknown> = {}) {
  return plaidRequest<T>(path, { ...body, access_token: decryptBankToken(connection.encryptedAccessToken) }, connection.environment);
}
