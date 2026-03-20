export interface GoldPriceRange {
  min: number; // international spot price (GoldAPI.io)
  max: number; // Egyptian local market price (egrates.com)
}

export interface MarketPrices {
  exchangeRates: Record<string, number>; // currency_code -> EGP per 1 unit of that currency (e.g. USD -> ~52)
  goldPrices: {
    '24k': number; // recommended price per gram in EGP (Egyptian local)
    '21k': number;
    '18k': number;
  };
  goldRanges: {
    '24k': GoldPriceRange;
    '21k': GoldPriceRange;
    '18k': GoldPriceRange;
  };
  baseCurrency: string;
  timestamp: string;
}

export interface CurrencyEntry {
  code: string;   // e.g. "USD"
  name: string;   // e.g. "US Dollar"
  amount: number; // user entered amount in that currency
}

export type GoldKarat = '24k' | '21k' | '18k';

export interface GoldAssets {
  grams24k: number;
  grams21k: number;
  grams18k: number;
}

export interface ZakatResult {
  totalWealthEGP: number;
  nisabThresholdEGP: number;
  isAboveNisab: boolean;
  obligatoryZakat: number;   // 2.5% of total wealth
  hedgeZakat: number;        // 2.5% of (total wealth × (1 + hedge%))
  hedgePercentage: number;
  egpBalance: number;
  currencyWealthEGP: number;
  goldWealthEGP: number;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  flag?: string;
}

// Top currencies users might have, especially common in Egypt
export const POPULAR_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'QAR', name: 'Qatari Riyal' },
  { code: 'BHD', name: 'Bahraini Dinar' },
  { code: 'OMR', name: 'Omani Rial' },
  { code: 'JOD', name: 'Jordanian Dinar' },
  { code: 'LYD', name: 'Libyan Dinar' },
  { code: 'TND', name: 'Tunisian Dinar' },
  { code: 'MAD', name: 'Moroccan Dirham' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'ZAR', name: 'South African Rand' },
];
