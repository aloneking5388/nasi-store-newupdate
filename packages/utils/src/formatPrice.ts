export function formatPrice(value?: number): string {
  const num = value ?? 0;

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  } else {
    return num.toString();
  }
}

export type CurrencyCode = "UGX" | "INR" | "USD";

export type RatesFromUGX = Record<CurrencyCode, number>;

const defaultRateConfig = {
  INR: Number(process.env.NEXT_PUBLIC_RATE_UGX_TO_INR || "0.022"),
  USD: Number(process.env.NEXT_PUBLIC_RATE_UGX_TO_USD || "0.00027"),
};

function ensureRate(rate: number, fallback: number): number {
  return Number.isFinite(rate) && rate > 0 ? rate : fallback;
}

export function getDefaultRatesFromUGX(): RatesFromUGX {
  return {
    UGX: 1,
    INR: ensureRate(defaultRateConfig.INR, 0.022),
    USD: ensureRate(defaultRateConfig.USD, 0.00027),
  };
}

function convertFromUGX(
  value: number,
  currencyCode: CurrencyCode,
  rates: RatesFromUGX,
): number {
  const safeValue = Number.isFinite(value) ? value : 0;
  const rate = Number.isFinite(rates[currencyCode]) ? rates[currencyCode] : 1;
  return safeValue * rate;
}

export function convertAmountFromUGX(
  value: number,
  currencyCode: CurrencyCode,
  rates: RatesFromUGX = getDefaultRatesFromUGX(),
): number {
  return convertFromUGX(value, currencyCode, rates);
}

export function resolveCurrencyFromCountry(countryCode?: string): CurrencyCode {
  const country = (countryCode || "").toUpperCase();

  if (country === "UG") return "UGX";
  if (country === "IN") return "INR";
  return "USD";
}

export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  if (currencyCode === "INR") return "₹";
  if (currencyCode === "USD") return "$";
  return "UGX";
}

export function formatCurrency(
  value: number | undefined,
  currencyCode: CurrencyCode,
  rates: RatesFromUGX = getDefaultRatesFromUGX(),
): string {
  const rawValue = Number(value ?? 0);
  const converted = convertAmountFromUGX(rawValue, currencyCode, rates);

  if (currencyCode === "UGX") {
    const amount = formatPrice(Math.round(converted));
    return `UGX ${amount}`;
  }

  const compactAmount = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(converted);

  if (currencyCode === "INR") return `₹${compactAmount}`;
  return `$${compactAmount}`;
}
