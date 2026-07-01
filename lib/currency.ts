
export const SUPPORTED_CURRENCIES = [
  { code: 'ZAR', label: 'South African Rand', symbol: 'R', locale: 'en-ZA' },
  { code: 'USD', label: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'EUR', label: 'Euro', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', label: 'British Pound', symbol: '£', locale: 'en-GB' },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const config = SUPPORTED_CURRENCIES.find(c => c.code === currency)!;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  return SUPPORTED_CURRENCIES.find(c => c.code === currency)!.symbol;
}
