import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, map, tap, catchError, of } from 'rxjs';
import { MarketPrices } from '../models/zakat.models';

// ─── API Configuration ────────────────────────────────────────
// open.er-api.com: free, CORS-enabled, no signup needed
const ER_API_BASE  = 'https://open.er-api.com/v6/latest';
const GOLDAPI_KEY  = 'goldapi-d69ksmmospkk4-io';
const GOLDAPI_URL  = 'https://www.goldapi.io/api/XAU/EGP';

// Egyptian local market typically trades at ~3% above international spot
const EG_LOCAL_PREMIUM = 0.03;

// ─── Response interfaces ──────────────────────────────────────

interface ErApiResponse {
  result: string;
  rates: Record<string, number>;
}

interface GoldApiResponse {
  price_gram_24k: number;
  price_gram_21k: number;
  price_gram_18k: number;
  price_gram_22k: number;
  price_gram_18k_bis?: number;
}

// ─── Helpers ──────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Service ──────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class PriceService {
  private readonly _prices$  = new BehaviorSubject<MarketPrices | null>(null);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _error$   = new BehaviorSubject<string | null>(null);

  readonly prices$  = this._prices$.asObservable();
  readonly loading$ = this._loading$.asObservable();
  readonly error$   = this._error$.asObservable();

  constructor(private http: HttpClient) {}

  fetchMarketPrices(): Observable<MarketPrices> {
    this._loading$.next(true);
    this._error$.next(null);

    const goldHeaders = new HttpHeaders({
      'x-access-token': GOLDAPI_KEY,
      'Content-Type': 'application/json',
    });

    return forkJoin({
      // Exchange rates: EGP as base → gives us units of foreign per 1 EGP
      // We invert to get EGP per 1 foreign unit
      egpRates: this.http.get<ErApiResponse>(`${ER_API_BASE}/EGP`)
        .pipe(catchError(() => of(null))),

      // Gold spot in EGP
      gold: this.http.get<GoldApiResponse>(GOLDAPI_URL, { headers: goldHeaders })
        .pipe(catchError(() => of(null))),
    }).pipe(
      map(({ egpRates, gold }) => {

        // ── Exchange Rates ──────────────────────────────────────
        // open.er-api returns: { rates: { USD: 0.0191, EUR: 0.0176, ... } }
        // where 0.0191 means "1 EGP = 0.0191 USD"
        // We want EGP per 1 foreign unit, so invert: 1 / 0.0191 ≈ 52.4 EGP/USD
        const exchangeRates: Record<string, number> = {};

        if (egpRates?.rates) {
          for (const [code, ratePerEGP] of Object.entries(egpRates.rates)) {
            if (ratePerEGP && ratePerEGP > 0) {
              exchangeRates[code] = round2(1 / ratePerEGP);
            }
          }
        }

        if (Object.keys(exchangeRates).length < 5) {
          // Fell back fully — use offline fallback
          return this.buildFallback();
        }

        // ── Gold Prices ─────────────────────────────────────────
        // GoldAPI gives international spot price per gram in EGP
        const spot24k = gold?.price_gram_24k ?? FALLBACK_GOLD.g24k;
        const spot21k = gold?.price_gram_21k ?? FALLBACK_GOLD.g21k;
        const spot18k = gold?.price_gram_18k ?? FALLBACK_GOLD.g18k;

        // Egyptian local market premium (~3% above spot for 24K, same ratio for others)
        const local24k = round2(spot24k * (1 + EG_LOCAL_PREMIUM));
        const local21k = round2(spot21k * (1 + EG_LOCAL_PREMIUM));
        const local18k = round2(spot18k * (1 + EG_LOCAL_PREMIUM));

        const prices: MarketPrices = {
          // Default gold = local estimate (what Egyptians typically pay)
          goldPrices: {
            '24k': local24k,
            '21k': local21k,
            '18k': local18k,
          },
          goldRanges: {
            '24k': { min: round2(spot24k), max: local24k },
            '21k': { min: round2(spot21k), max: local21k },
            '18k': { min: round2(spot18k), max: local18k },
          },
          // EGP per 1 unit of foreign currency
          exchangeRates,
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
        console.error('PriceService error:', err);
        const msg = 'Could not fetch live prices. Using built-in estimates.';
        this._error$.next(msg);
        this._loading$.next(false);

        const fallback = this.buildFallback();
        this._prices$.next(fallback);
        return of(fallback);
      }),
    );
  }

  get currentPrices(): MarketPrices | null {
    return this._prices$.getValue();
  }

  /** Offline fallback — approximate rates as of March 2026 */
  private buildFallback(): MarketPrices {
    const s24 = FALLBACK_GOLD.g24k;
    const s21 = FALLBACK_GOLD.g21k;
    const s18 = FALLBACK_GOLD.g18k;
    const l24 = round2(s24 * (1 + EG_LOCAL_PREMIUM));
    const l21 = round2(s21 * (1 + EG_LOCAL_PREMIUM));
    const l18 = round2(s18 * (1 + EG_LOCAL_PREMIUM));

    return {
      baseCurrency: 'EGP',
      timestamp: new Date().toISOString(),
      exchangeRates: {
        USD: 52.4,  EUR: 57.0,  GBP: 67.5,  SAR: 13.97,
        AED: 14.27, KWD: 170.5, QAR: 14.39, BHD: 139.0,
        OMR: 136.2, JOD: 73.9,  LYD: 10.8,  TND: 16.8,
        MAD: 5.2,   CHF: 58.9,  CAD: 36.7,  AUD: 33.3,
        JPY: 0.35,  CNY: 7.2,   TRY: 1.5,   INR: 0.61,
        PKR: 0.19,  NGN: 0.034, MYR: 11.9,  SGD: 39.1,
        HKD: 6.73,  NOK: 4.8,   SEK: 4.97,  DKK: 7.6,
        NZD: 30.7,  ZAR: 2.88,
      },
      goldPrices:  { '24k': l24, '21k': l21, '18k': l18 },
      goldRanges: {
        '24k': { min: s24, max: l24 },
        '21k': { min: s21, max: l21 },
        '18k': { min: s18, max: l18 },
      },
    };
  }
}

const FALLBACK_GOLD = { g24k: 7890, g21k: 6903, g18k: 5917 };
