import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { verifyTellerWebhook } from "@/lib/banking/teller/webhooks";

export const runtime = "nodejs";

type WebhookTransaction = {
  id: string; account_id: string; amount: string; description: string; date: string;
  status: "pending" | "posted"; type?: string; running_balance: string | null;
  details?: { category?: string; counterparty?: { name?: string } };
  [key: string]: unknown;
};
type TellerWebhook = {
  id: string; type: "webhook.test" | "transactions.processed" | "enrollment.disconnected";
  payload: { enrollment_id?: string; reason?: string; transactions?: WebhookTransaction[] };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyTellerWebhook(rawBody, request.headers.get("teller-signature"))) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }
  let event: TellerWebhook;
  try { event = JSON.parse(rawBody) as TellerWebhook; }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!event.id || !event.type || !event.payload) return Response.json({ error: "Invalid event" }, { status: 400 });

  const supabase = createAdminSupabaseClient();
  const recorded = await supabase.from("bank_webhook_events").insert({ id: event.id, provider: "teller", event_type: event.type });
  if (recorded.error?.code === "23505") return new Response(null, { status: 204 });
  if (recorded.error) return Response.json({ error: "Could not record event" }, { status: 500 });

  try {
    if (event.type === "enrollment.disconnected" && event.payload.enrollment_id) {
      const result = await supabase.from("bank_connections").update({ status: "disconnected", disconnected_reason: event.payload.reason ?? "disconnected" })
        .eq("provider", "teller").eq("provider_enrollment_id", event.payload.enrollment_id);
      if (result.error) throw result.error;
    }
    if (event.type === "transactions.processed" && event.payload.transactions?.length) {
      for (const transaction of event.payload.transactions) {
        const account = await supabase.from("financial_accounts").select("id, household_id")
          .eq("provider_account_id", transaction.account_id).not("bank_connection_id", "is", null).maybeSingle();
        if (account.error) throw account.error;
        if (!account.data) continue;
        const saved = await supabase.from("bank_transactions").upsert({ household_id: account.data.household_id,
          financial_account_id: account.data.id, provider: "teller", provider_transaction_id: transaction.id,
          amount: Number(transaction.amount), description: transaction.description,
          category: transaction.details?.category ?? null, counterparty_name: transaction.details?.counterparty?.name ?? null,
          transaction_type: transaction.type ?? null, status: transaction.status, transaction_date: transaction.date,
          running_balance: transaction.running_balance === null ? null : Number(transaction.running_balance), raw_provider_data: transaction,
        }, { onConflict: "financial_account_id,provider_transaction_id" });
        if (saved.error) throw saved.error;
      }
    }
    await supabase.from("bank_webhook_events").update({ processed_at: new Date().toISOString() }).eq("id", event.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    await supabase.from("bank_webhook_events").update({ error_message: error instanceof Error ? error.message.slice(0, 500) : "Processing failed" }).eq("id", event.id);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
