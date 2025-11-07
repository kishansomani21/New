// Pricing calculation utilities

const BASE_PRICE = parseFloat(process.env.NEXT_PUBLIC_BASE_CONTACT_PRICE || '5.00');
const POINTS_PER_REVIEW = parseInt(process.env.NEXT_PUBLIC_POINTS_PER_REVIEW || '10');
const DISCOUNT_RATE = parseFloat(process.env.NEXT_PUBLIC_DISCOUNT_RATE || '0.01');

export interface PriceCalculation {
  basePrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
  pointsUsed: number;
}

/**
 * Calculate the price for accessing a worker's contact information
 * The more points a company has (from leaving reviews), the cheaper the price
 *
 * Formula:
 * - Base price: $5
 * - Discount: 1% per 10 points (max 50% discount)
 * - Points are earned by leaving reviews (10 points per review)
 *
 * Examples:
 * - 0 points: $5.00
 * - 100 points (10 reviews): $4.50 (10% discount)
 * - 500 points (50 reviews): $2.50 (50% discount - max)
 */
export function calculateContactPrice(companyPoints: number): PriceCalculation {
  const discountPercentage = Math.min(
    (companyPoints * DISCOUNT_RATE) * 100,
    50 // Max 50% discount
  );

  const discountAmount = BASE_PRICE * (discountPercentage / 100);
  const finalPrice = Math.max(BASE_PRICE - discountAmount, BASE_PRICE * 0.5);

  return {
    basePrice: BASE_PRICE,
    discountPercentage,
    discountAmount,
    finalPrice: parseFloat(finalPrice.toFixed(2)),
    pointsUsed: 0, // Points are not consumed, they just provide discounts
  };
}

/**
 * Calculate points awarded for leaving a review
 */
export function calculateReviewPoints(rating: number): number {
  // Award 10 points for any review (encourages companies to leave reviews)
  return POINTS_PER_REVIEW;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Get pricing tier description
 */
export function getPricingTier(points: number): {
  tier: string;
  discount: number;
  pricePerContact: number;
  reviewsNeeded: number;
} {
  const calculation = calculateContactPrice(points);
  const reviewsNeeded = Math.ceil((points / POINTS_PER_REVIEW));

  let tier = 'Starter';
  if (points >= 500) tier = 'Elite';
  else if (points >= 300) tier = 'Premium';
  else if (points >= 100) tier = 'Plus';

  return {
    tier,
    discount: calculation.discountPercentage,
    pricePerContact: calculation.finalPrice,
    reviewsNeeded,
  };
}
