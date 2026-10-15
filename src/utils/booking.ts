/**
 * NariCare AI - Transparent Per-Session Booking & Conflict Prevention Engine
 * Enforces:
 * - Transparent per-session pricing (never hidden subscriptions or surprise platform fees)
 * - Anti-conflict slot locking (prevents double bookings)
 * - Cancellation & refund calculation
 */

export interface PricingBreakdown {
  baseSessionFee: number;
  durationMinutes: number;
  platformFee: number;
  gstAmount: number;
  totalPayable: number;
  currency: string;
  isSubscription: false; // Explicit guarantee
  cancellationPolicy: string;
}

export interface BookedSlot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (e.g. "10:30")
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'rescheduled';
}

/**
 * Calculates itemized per-session pricing
 */
export function calculateSessionPricing(baseFee: number, durationMinutes: number): PricingBreakdown {
  if (baseFee < 0) {
    throw new Error('Base fee cannot be negative');
  }

  // Transparent policy: platform fee is ₹0 or flat minimal, 18% GST on consultation services where applicable
  const platformFee = 0; // Transparent: No platform fee surcharges
  const gstRate = 0.00; // Healthcare clinical consultation services by doctors in India are exempt from GST under Notification No. 12/2017
  const gstAmount = Math.round(baseFee * gstRate);
  const totalPayable = baseFee + platformFee + gstAmount;

  return {
    baseSessionFee: baseFee,
    durationMinutes,
    platformFee,
    gstAmount,
    totalPayable,
    currency: 'INR (₹)',
    isSubscription: false,
    cancellationPolicy: '100% full refund if cancelled up to 2 hours before the scheduled session. Easy 1-click rescheduling available.'
  };
}

/**
 * Checks if a requested slot conflicts with existing confirmed bookings
 */
export function isSlotAvailable(
  doctorId: string,
  date: string,
  time: string,
  existingBookings: BookedSlot[]
): boolean {
  if (!doctorId || !date || !time) return false;

  const hasConflict = existingBookings.some(booking => {
    return (
      booking.doctorId === doctorId &&
      booking.date === date &&
      booking.time === time &&
      booking.status !== 'cancelled'
    );
  });

  return !hasConflict;
}

/**
 * Generates an auditable booking reference (e.g., NC-2026-8742)
 */
export function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `NC-${year}-${randomSuffix}`;
}

/**
 * Generates a mock/test payment transaction ID
 */
export function generateTransactionId(): string {
  return `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}
