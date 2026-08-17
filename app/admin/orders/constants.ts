export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "in_production",
  "ready",
  "delivered",
  "cancelled",
] as const;

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "partially_paid",
  "refunded",
] as const;