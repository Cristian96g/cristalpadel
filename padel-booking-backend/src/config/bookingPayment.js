export const BOOKING_TOTAL_PRICE = Number(process.env.BOOKING_TOTAL_PRICE || 12000);
export const BOOKING_DEPOSIT_PERCENT = Number(process.env.BOOKING_DEPOSIT_PERCENT || 25);
export const BOOKING_DEPOSIT_AMOUNT = Math.round(
  Number(process.env.BOOKING_DEPOSIT_AMOUNT || 0) ||
    (BOOKING_TOTAL_PRICE * BOOKING_DEPOSIT_PERCENT) / 100
);
export const BOOKING_PAYMENT_ALIAS = process.env.BOOKING_PAYMENT_ALIAS || "CRISTAL.PADEL";
export const BOOKING_WHATSAPP = process.env.BOOKING_WHATSAPP || "5492966000000";
export const BOOKING_PENDING_MINUTES = Number(process.env.BOOKING_PENDING_MINUTES || 20);

export function getBookingPaymentInfo(expiresAt = null) {
  return {
    totalPrice: BOOKING_TOTAL_PRICE,
    depositAmount: BOOKING_DEPOSIT_AMOUNT,
    depositPercent: BOOKING_DEPOSIT_PERCENT,
    transferAlias: BOOKING_PAYMENT_ALIAS,
    whatsappNumber: BOOKING_WHATSAPP,
    pendingMinutes: BOOKING_PENDING_MINUTES,
    expiresAt,
  };
}
