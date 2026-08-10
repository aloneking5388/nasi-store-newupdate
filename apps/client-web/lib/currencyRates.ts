import "server-only";
import { getDefaultRatesFromUGX, RatesFromUGX } from "@/utils/formatPrice";

type CurrencyRatesCache = {
  rates: RatesFromUGX;
  fetchedAt: number;
  source: "live" | "fallback";
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const globalForRates = globalThis as typeof globalThis & {
  __nasiRatesCache?: CurrencyRatesCache;
};

function readRate(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function fetchRatesFromApi(
  defaultRates: RatesFromUGX,
): Promise<RatesFromUGX> {
  const response = await fetch("https://open.er-api.com/v6/latest/UGX", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch currency rates");
  }

  const payload = (await response.json()) as {
    result?: string;
    rates?: Record<string, number>;
  };

  if (!payload?.rates) {
    throw new Error("Currency rates response is missing rates");
  }

  return {
    UGX: 1,
    INR: readRate(payload.rates.INR, defaultRates.INR),
    USD: readRate(payload.rates.USD, defaultRates.USD),
  };
}

export async function getRatesFromUGX(): Promise<RatesFromUGX> {
  const now = Date.now();
  const defaultRates = getDefaultRatesFromUGX();
  const cached = globalForRates.__nasiRatesCache;

  if (cached && now - cached.fetchedAt < ONE_DAY_MS) {
    return cached.rates;
  }

  try {
    const rates = await fetchRatesFromApi(defaultRates);
    globalForRates.__nasiRatesCache = {
      rates,
      fetchedAt: now,
      source: "live",
    };
    return rates;
  } catch {
    if (cached) {
      return cached.rates;
    }

    globalForRates.__nasiRatesCache = {
      rates: defaultRates,
      fetchedAt: now,
      source: "fallback",
    };

    return defaultRates;
  }
}

export async function getCurrencyRatesDebugInfo() {
  const rates = await getRatesFromUGX();
  const defaultRates = getDefaultRatesFromUGX();
  const cached = globalForRates.__nasiRatesCache;

  return {
    rates,
    defaultRates,
    fetchedAt: cached?.fetchedAt || null,
    fetchedAtIso: cached?.fetchedAt
      ? new Date(cached.fetchedAt).toISOString()
      : null,
    source: cached?.source || "fallback",
    cacheAgeMinutes: cached?.fetchedAt
      ? Math.round((Date.now() - cached.fetchedAt) / 60000)
      : null,
  };
}
