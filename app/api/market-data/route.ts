import { auth } from "@clerk/nextjs/server";
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
  meta?: {
    symbol?: string;
    currency?: string;
    exchange?: string;
    type?: string;
  };
  values?: Array<{ datetime: string; close: string }>;
};

type MarketResult =
  | {
      ok: true;
      data: {
        symbol: string;
        currency: string;
        exchange?: string;
        type?: string;
        price?: number;
        points: Array<{ date: string; close: number }>;
      };
    }
  | { ok: false; error: string; status: number };

const tickerPattern = /^[A-Z0-9./-]{1,15}$/;

async function fetchMarketSeries(
  symbol: string,
  range: keyof typeof ranges,
  apiKey: string,
): Promise<MarketResult> {
  const settings = ranges[range];
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
    const data = (await response.json()) as TwelveDataResponse;
    if (!response.ok || data.status === "error" || !data.values?.length) {
      const status = response.status === 429 || data.code === 429 ? 429 : 502;
      return {
        ok: false,
        error:
          status === 429
            ? "Market-data limit reached. Try again shortly."
            : data.message ?? "Market history is unavailable.",
        status,
      };
    }

    const points = data.values
      .map((point) => ({ date: point.datetime, close: Number(point.close) }))
      .filter((point) => Number.isFinite(point.close));
    return {
      ok: true,
      data: {
        symbol: data.meta?.symbol ?? symbol,
        currency: data.meta?.currency ?? "USD",
        exchange: data.meta?.exchange,
        type: data.meta?.type,
        price: points.at(-1)?.close,
        points,
      },
    };
  } catch {
    return {
      ok: false,
      error: "Market data did not respond in time.",
      status: 504,
    };
  }
}

export async function GET(request: NextRequest) {
  const { orgId } = await auth.protect();
  if (!orgId) {
    return Response.json(
      { error: "Select a household before requesting market data." },
      { status: 403 },
    );
  }
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Market data is not configured." },
      { status: 503 },
    );
  }

  const rangeParam = request.nextUrl.searchParams.get("range") ?? "1Y";
  const range = rangeParam in ranges ? (rangeParam as keyof typeof ranges) : "1Y";
  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  if (symbolsParam) {
    const symbols: string[] = [...new Set<string>(
      symbolsParam
        .split(",")
        .map((symbol) => symbol.trim().toUpperCase())
        .filter(Boolean),
    )];
    if (!symbols.length || symbols.length > 25 || symbols.some((symbol) => !tickerPattern.test(symbol))) {
      return Response.json(
        { error: "Request between 1 and 25 valid ticker symbols." },
        { status: 400 },
      );
    }

    const results = await Promise.all(
      symbols.map((symbol) => fetchMarketSeries(symbol, range, apiKey)),
    );
    const prices: Record<string, number> = {};
    const unavailable: string[] = [];
    results.forEach((result, index) => {
      const symbol = symbols[index];
      if (result.ok && Number.isFinite(result.data.price)) {
        prices[symbol] = Number(result.data.price);
      } else {
        unavailable.push(symbol);
      }
    });
    return Response.json({ prices, unavailable });
  }

  const symbol = request.nextUrl.searchParams.get("symbol")?.trim().toUpperCase() ?? "";
  if (!tickerPattern.test(symbol)) {
    return Response.json(
      { error: "Enter a valid ticker symbol." },
      { status: 400 },
    );
  }
  const result = await fetchMarketSeries(symbol, range, apiKey);
  return result.ok
    ? Response.json(result.data)
    : Response.json({ error: result.error }, { status: result.status });
}
