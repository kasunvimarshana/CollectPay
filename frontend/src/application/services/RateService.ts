import { RateVersion } from '../../domain/entities';

export class RateService {
  /**
   * Get the active rate for a product at a specific date
   */
  getActiveRate(
    rates: RateVersion[],
    productId: string,
    date: Date = new Date()
  ): RateVersion | null {
    const applicableRates = rates
      .filter(rate => {
        if (rate.productId !== productId) {
          return false;
        }

        const effectiveFrom = new Date(rate.effectiveFrom);
        const effectiveTo = rate.effectiveTo ? new Date(rate.effectiveTo) : null;

        // Check if the date is within the rate's effective period
        if (date < effectiveFrom) {
          return false;
        }

        if (effectiveTo && date > effectiveTo) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by effective_from descending to get the most recent rate
        return new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime();
      });

    return applicableRates[0] || null;
  }

  /**
   * Get all rates for a product
   */
  getRatesForProduct(rates: RateVersion[], productId: string): RateVersion[] {
    return rates
      .filter(rate => rate.productId === productId)
      .sort((a, b) => {
        return new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime();
      });
  }

  /**
   * Check if a rate is currently active
   */
  isRateActive(rate: RateVersion, date: Date = new Date()): boolean {
    const effectiveFrom = new Date(rate.effectiveFrom);
    const effectiveTo = rate.effectiveTo ? new Date(rate.effectiveTo) : null;

    if (date < effectiveFrom) {
      return false;
    }

    if (effectiveTo && date > effectiveTo) {
      return false;
    }

    return true;
  }

  /**
   * Get the latest rate for a product (most recent effective_from)
   */
  getLatestRate(rates: RateVersion[], productId: string): RateVersion | null {
    const productRates = this.getRatesForProduct(rates, productId);
    return productRates[0] || null;
  }

  /**
   * Validate if a new rate period overlaps with existing rates
   */
  checkRateOverlap(
    existingRates: RateVersion[],
    productId: string,
    effectiveFrom: Date,
    effectiveTo: Date | null,
    excludeRateId?: string
  ): boolean {
    const productRates = existingRates
      .filter(rate => rate.productId === productId && rate.id !== excludeRateId);

    for (const rate of productRates) {
      const rateFrom = new Date(rate.effectiveFrom);
      const rateTo = rate.effectiveTo ? new Date(rate.effectiveTo) : null;

      // Check if the new rate period overlaps with this existing rate
      // Case 1: New rate starts during existing period
      if (effectiveFrom >= rateFrom && (rateTo === null || effectiveFrom <= rateTo)) {
        return true;
      }

      // Case 2: New rate ends during existing period
      if (effectiveTo !== null) {
        if (effectiveTo >= rateFrom && (rateTo === null || effectiveTo <= rateTo)) {
          return true;
        }
      }

      // Case 3: New rate completely encompasses existing period
      if (effectiveFrom <= rateFrom && (effectiveTo === null || (rateTo !== null && effectiveTo >= rateTo))) {
        return true;
      }
    }

    return false;
  }
}
