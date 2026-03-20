import { Injectable } from '@angular/core';
import { MarketPrices, CurrencyEntry, GoldAssets, ZakatResult } from '../models/zakat.models';

// Number of grams for Nisab calculation (85 grams of pure gold)
const NISAB_GOLD_GRAMS = 85;
// Zakat rate
const ZAKAT_RATE = 0.025;
// Troy ounce to grams
const TROY_OZ_TO_GRAMS = 31.1035;

@Injectable({
  providedIn: 'root',
})
export class ZakatCalculatorService {

  /**
   * Convert a foreign currency amount to EGP.
   * exchangeRates[code] = EGP per 1 unit of that currency (e.g. USD=52.4)
   * So: amountEGP = foreignAmount * exchangeRates[code]
   */
  convertCurrencyToEGP(amount: number, currencyCode: string, exchangeRates: Record<string, number>): number {
    const rate = exchangeRates[currencyCode];
    if (!rate || rate === 0) return 0;
    return amount * rate;
  }

  /**
   * Calculate total gold wealth in EGP.
   */
  calculateGoldWealthEGP(gold: GoldAssets, goldPrices: MarketPrices['goldPrices']): number {
    return (
      gold.grams24k * goldPrices['24k'] +
      gold.grams21k * goldPrices['21k'] +
      gold.grams18k * goldPrices['18k']
    );
  }

  /**
   * Main calculation engine.
   * Returns a ZakatResult given inputs and current market prices.
   */
  calculate(
    egpBalance: number,
    currencies: CurrencyEntry[],
    gold: GoldAssets,
    prices: MarketPrices,
    hedgePercentage: number,
  ): ZakatResult {
    // Sum all foreign currencies into EGP
    const currencyWealthEGP = currencies.reduce((sum, entry) => {
      return sum + this.convertCurrencyToEGP(entry.amount, entry.code, prices.exchangeRates);
    }, 0);

    // Gold wealth in EGP
    const goldWealthEGP = this.calculateGoldWealthEGP(gold, prices.goldPrices);

    // Total wealth
    const totalWealthEGP = egpBalance + currencyWealthEGP + goldWealthEGP;

    // Nisab: 85g of 24k gold
    const nisabThresholdEGP = NISAB_GOLD_GRAMS * prices.goldPrices['24k'];

    const isAboveNisab = totalWealthEGP >= nisabThresholdEGP;

    // Obligatory Zakat: 2.5% of total wealth
    const obligatoryZakat = isAboveNisab ? totalWealthEGP * ZAKAT_RATE : 0;

    // Hedged wealth: total × (1 + hedge%)
    const hedgedWealth = totalWealthEGP * (1 + hedgePercentage / 100);
    const hedgeZakat = isAboveNisab ? hedgedWealth * ZAKAT_RATE : 0;

    return {
      totalWealthEGP,
      nisabThresholdEGP,
      isAboveNisab,
      obligatoryZakat,
      hedgeZakat,
      hedgePercentage,
      egpBalance,
      currencyWealthEGP,
      goldWealthEGP,
    };
  }
}
