import { NextRequest } from "next/server";

const ranges = {
  "1M": { interval: "1day", outputsize: 22 },
  "3M": { interval: "1day", outputsize: 66 },
  "1Y": { interval: "1week", outputsize: 53 },
  "5Y": { interval: "1month", outputsize: 60 },
} as const;

type TwelveDataResponse = {
  status?: string;
  code?: number;
  message?: string;
  meta?: { symbol?: string; currency?: string; exchange?: string; type?: string };
  values?: Array<{ datetime: string; close: string }>;
};

export async function GET(request: NextRequest) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) return Response.json({ error: "Market data is not configured." }, { status: 503 });

  const symbol = request.nextUrl.searchParams.get("symbol")?.trim().toUpperCase() ?? "";
  const range = request.nextUrl.searchParams.get("range") ?? "1Y";
  if (!/^[A-Z0-9./-]{1,15}$/.test(symbol)) return Response.json({ error: "Enter a valid ticker symbol." }, { status: 400 });
  const settings = ranges[range as keyof typeof ranges] ?? ranges["1Y"];
  const url = new URL("https://api.twelvedata.com/time_series");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("interval", settings.interval);
  url.searchParams.set("outputsize", settings.outputsize.toString());
  url.searchParams.set("order", "ASC");

  try {
    const response = await fetch(url, {
      headers: { Authorization: `apikey ${apiKey}` },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(8000),
    });
    const data = await response.json() as TwelveDataResponse;
    if (!response.ok || data.status === "error" || !data.values?.length) {
      const status = response.status === 429 || data.code === 429 ? 429 : 502;
      return Response.json({ error: status === 429 ? "Market-data limit reached. Try again shortly." : data.message ?? "Market history is unavailable." }, { status });
    }
    const points = data.values.map((point) => ({ date: point.datetime, close: Number(point.close) })).filter((point) => Number.isFinite(point.close));
    return Response.json({ symbol: data.meta?.symbol ?? symbol, currency: data.meta?.currency ?? "USD", exchange: data.meta?.exchange, type: data.meta?.type, price: points.at(-1)?.close, points });
  } catch {
    return Response.json({ error: "Market data did not respond in time." }, { status: 504 });
  }
}
