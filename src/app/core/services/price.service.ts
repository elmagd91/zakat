import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, map, tap, catchError, throwError } from 'rxjs';
import { MarketPrices } from '../models/zakat.models';

// ─── Free APIs — no key required, CORS-enabled ────────────
// open.er-api.com: free, 1500 req/month, no signup needed
const EGP_RATES_URL = 'https://open.er-api.com/v6/latest/EGP';
const XAU_RATES_URL = 'https://open.er-api.com/v6/latest/XAU';

const TROY_OZ_TO_GRAMS = 31.1035;

interface ErApiResponse {
  result: string;
  rates: Record<string, number>;
  'error-type'?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PriceService {
  private readonly _prices$ = new BehaviorSubject<MarketPrices | null>(null);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _error$ = new BehaviorSubject<string | null>(null);

  readonly prices$ = this._prices$.asObservable();
  readonly loading$ = this._loading$.asObservable();
  readonly error$ = this._error$.asObservable();

  constructor(private http: HttpClient) {}

  fetchMarketPrices(): Observable<MarketPrices> {
    this._loading$.next(true);
    this._error$.next(null);

    // Fetch exchange rates and gold price in parallel — both free, no key
    return forkJoin({
      egpRates: this.http.get<ErApiResponse>(EGP_RATES_URL),
      xauRates: this.http.get<ErApiResponse>(XAU_RATES_URL),
    }).pipe(
      map(({ egpRates, xauRates }) => {
        // egpRates.rates: { USD: 0.0196, EUR: 0.018, ... } — foreign per 1 EGP
        // xauRates.rates: { EGP: XXXXX, ... } — EGP per 1 troy oz of gold
        const egpPerOz = xauRates.rates['EGP'];
        const pricePerGram24k = egpPerOz / TROY_OZ_TO_GRAMS;

        const prices: MarketPrices = {
          exchangeRates: egpRates.rates,
          goldPrices: {
            '24k': Math.round(pricePerGram24k * 100) / 100,
            '21k': Math.round((pricePerGram24k * 21 / 24) * 100) / 100,
            '18k': Math.round((pricePerGram24k * 18 / 24) * 100) / 100,
          },
          baseCurrency: 'EGP',
          timestamp: new Date().toISOString(),
        };

        return prices;
      }),
      tap((prices) => {
        this._prices$.next(prices);
        this._loading$.next(false);
      }),
      catchError((err) => {
        console.error('Error fetching market prices:', err);
        const errorMessage = 'Could not fetch live prices. Using built-in estimates.';
        this._error$.next(errorMessage);
        this._loading$.next(false);

        // Fall back to offline estimates
        const fallback = this.getOfflineFallback();
        this._prices$.next(fallback);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  get currentPrices(): MarketPrices | null {
    return this._prices$.getValue();
  }

  /** Offline fallback — approximate rates as of early 2026 */
  private getOfflineFallback(): MarketPrices {
    return {
      baseCurrency: 'EGP',
      timestamp: new Date().toISOString(),
      exchangeRates: {
        USD: 0.0196,  // 1 EGP ≈ 0.0196 USD → 1 USD ≈ 51 EGP
        EUR: 0.0181,
        GBP: 0.0155,
        SAR: 0.0735,
        AED: 0.072,
        KWD: 0.006,
        QAR: 0.0714,
        BHD: 0.0074,
        OMR: 0.0075,
        JOD: 0.0139,
        LYD: 0.0964,
        TND: 0.0625,
        MAD: 0.197,
        CHF: 0.0177,
        CAD: 0.0272,
        AUD: 0.0310,
        JPY: 2.99,
        CNY: 0.1425,
        TRY: 0.68,
        INR: 1.69,
        PKR: 5.48,
        NGN: 31.5,
        MYR: 0.0875,
        SGD: 0.0264,
        HKD: 0.153,
        NOK: 0.215,
        SEK: 0.207,
        DKK: 0.135,
        NZD: 0.0337,
        ZAR: 0.36,
      },
      goldPrices: {
        '24k': 5800,
        '21k': 5075,
        '18k': 4350,
      },
    };
  }
}
