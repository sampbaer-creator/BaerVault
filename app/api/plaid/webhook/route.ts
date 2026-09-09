import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";

import { syncBankConnection } from "@/lib/data/bankConnections";
import type { BankConnection } from "@/lib/banking/types";
import { verifyPlaidWebhook } from "@/lib/banking/plaid/webhooks";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
type PlaidWebhook = { webhook_type?: string; webhook_code?: string; item_id?: string; error?: { error_code?: string } };

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("plaid-verification");
  if (!await verifyPlaidWebhook(raw, signature)) return Response.json({ error: "Invalid signature" }, { status: 401 });
  let event: PlaidWebhook;
  try { event = JSON.parse(raw) as PlaidWebhook; } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!event || typeof event !== "object" || !event.webhook_type || !event.webhook_code || !event.item_id) return new Response(null, { status: 204 });
  const admin = createAdminSupabaseClient();
  const eventId = createHash("sha256").update(`${signature}:${raw}`).digest("hex");
  const recorded = await admin.from("bank_webhook_events").insert({ id: eventId, provider: "plaid", event_type: `${event.webhook_type}.${event.webhook_code}` });
  if (recorded.error && recorded.error.code !== "23505") return Response.json({ error: "Could not record webhook" }, { status: 500 });
  // Duplicate deliveries must retry failed processing; sync is idempotent.
  try {
    const result = await admin.from("bank_connections").select("id, household_id, institution_name, encrypted_access_token, environment").eq("provider", "plaid").eq("provider_enrollment_id", event.item_id).maybeSingle();
    if (result.error) throw result.error;
    if (result.data) {
      if (event.webhook_type === "ITEM" && event.webhook_code === "ERROR") {
        const updated = await admin.from("bank_connections").update({ status: "disconnected", disconnected_reason: event.error?.error_code ?? "ITEM_ERROR" }).eq("id", result.data.id);
        if (updated.error) throw updated.error;
      } else if ((event.webhook_type === "TRANSACTIONS" && event.webhook_code === "SYNC_UPDATES_AVAILABLE") || event.webhook_code === "LOGIN_REPAIRED") {
        await syncBankConnection({ id: result.data.id, householdId: result.data.household_id, institutionName: result.data.institution_name, provider: "plaid", encryptedAccessToken: result.data.encrypted_access_token, environment: result.data.environment } as BankConnection);
      }
    }
    const processed = await admin.from("bank_webhook_events").update({ processed_at: new Date().toISOString(), error_message: null }).eq("id", eventId);
    if (processed.error) throw processed.error;
    for (const path of ["/accounts", "/dashboard", "/budget", "/transactions", "/cash-flow", "/recurring"]) revalidatePath(path);
    return new Response(null, { status: 204 });
  } catch (error) {
    await admin.from("bank_webhook_events").update({ error_message: error instanceof Error ? error.message.slice(0, 500) : "Processing failed" }).eq("id", eventId);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
