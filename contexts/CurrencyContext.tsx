
import React, { createContext, useContext, useState } from 'react';
import { CurrencyCode, formatCurrency, getCurrencySymbol } from '../lib/currency';

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  format: (amount: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'ZAR',
  setCurrency: () => {},
  format: (n) => String(n),
  symbol: 'R',
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('currency') as CurrencyCode | null;
    return saved ?? 'ZAR';
  });

  const setCurrency = (c: CurrencyCode) => {
    localStorage.setItem('currency', c);
    setCurrencyState(c);
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      format: (amount: number) => formatCurrency(amount, currency),
      symbol: getCurrencySymbol(currency),
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
