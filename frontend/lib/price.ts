export const formatPrice = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount ?? 0);

export const CASHBACK_RATE = 0.4; // 40% on first order

export const calcCashback = (total: number): number => Math.round(total * CASHBACK_RATE);
