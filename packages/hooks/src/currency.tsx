"use client";

import { createContext, useContext, useMemo } from "react";
import {
  CurrencyCode,
  formatCurrency as formatCurrencyValue,
  getDefaultRatesFromUGX,
  getCurrencySymbol,
  RatesFromUGX,
} from "@nasi/utils/formatPrice";

type CurrencyContextValue = {
  currencyCode: CurrencyCode;
  currencySymbol: string;
  formatCurrency: (value?: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currencyCode: "USD",
  currencySymbol: "$",
  formatCurrency: (value?: number) =>
    formatCurrencyValue(value, "USD", getDefaultRatesFromUGX()),
});

export function CurrencyProvider({
  currencyCode,
  ratesFromUGX,
  children,
}: {
  currencyCode: CurrencyCode;
  ratesFromUGX?: RatesFromUGX;
  children: React.ReactNode;
}) {
  const value = useMemo<CurrencyContextValue>(() => {
    const rates = ratesFromUGX || getDefaultRatesFromUGX();

    return {
      currencyCode,
      currencySymbol: getCurrencySymbol(currencyCode),
      formatCurrency: (price?: number) =>
        formatCurrencyValue(price, currencyCode, rates),
    };
  }, [currencyCode, ratesFromUGX]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
