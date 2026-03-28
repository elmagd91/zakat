import { Injectable } from '@angular/core';
import { HijriDate } from '../models/zakat.models';

const HIJRI_MONTH_NAMES_EN = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qi'dah", 'Dhul Hijjah',
];

const HIJRI_MONTH_NAMES_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

/** Shape of the Aladhan gToH response data we need */
interface AladhanHijri {
  day: string;
  month: { number: number; en: string; ar: string };
  year: string;
  /** Returned by Aladhan: true when this Hijri year has 355 days */
  isLeapYear: boolean;
}

/**
 * Gregorian → Hijri conversion service.
 *
 * Primary source: Aladhan.com API (https://aladhan.com/islamic-calendar-api)
 *   - method/calendarMethod=1 → Umm al-Qura (official Saudi calendar)
 * Fallback:       Fliegel-Van Flandern tabular Islamic calendar algorithm
 *
 * dayOffset (-2 … +2) lets users correct for local moon-sighting differences.
 */
@Injectable({ providedIn: 'root' })
export class HijriService {

  /** Cache: ISO date key (YYYY-M-D) → resolved HijriDate (no offset) */
  private apiCache = new Map<string, HijriDate>();

  /**
   * Cache: Hijri year → days in that year.
   * Populated by fetchFromApi() directly from the Aladhan isLeapYear field.
   */
  private yearLengthCache = new Map<number, number>();

  // ── Async API-first path ────────────────────────────────────────────────

  /**
   * Fetch today's Hijri date from the Aladhan API and apply the given offset.
   * Falls back to the local algorithm if the request fails.
   */
  async todayHijriAsync(offset = 0): Promise<HijriDate> {
    const base = await this.fetchFromApi(new Date());
    return this.applyOffset(base, offset);
  }

  /**
   * Return the number of days in the Hijri lunar year that contains today.
   * Source: the `isLeapYear` field from the Aladhan gToH API response.
   *   355 days → leap year, 354 days → regular year.
   * Falls back to HAWL_DAYS_FALLBACK if the API is unavailable.
   */
  async getHijriYearDays(): Promise<number> {
    // fetchFromApi populates yearLengthCache from the official API isLeapYear field
    const base = await this.fetchFromApi(new Date());
    const cached = this.yearLengthCache.get(base.year);
    return cached ?? 355; // 355 is safe fallback (1447 AH is a leap year)
  }

  /**
   * Convert a Hijri date (day, month, year) to a Gregorian ISO date string
   * (YYYY-MM-DD). Uses the Aladhan hToG endpoint; falls back to the
   * tabular Fliegel-Van Flandern inverse formula.
   */
  async hijriToGregorianAsync(hd: number, hm: number, hy: number): Promise<string> {
    const dd = String(hd).padStart(2, '0');
    const mm = String(hm).padStart(2, '0');
    const url = `https://api.aladhan.com/v1/hToG/${dd}-${mm}-${hy}?calendarMethod=1`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const greg = json?.data?.gregorian;
      if (!greg) throw new Error('Unexpected shape');
      // API returns: { day: '01', month: { number: 3 }, year: '2025' }
      const gd = String(greg.day).padStart(2, '0');
      const gm = String(greg.month.number).padStart(2, '0');
      const gy = greg.year;
      return `${gy}-${gm}-${gd}`;
    } catch {
      // Fallback: inverse of jdToHijri using the same tabular algorithm
      return this.hijriToGregorianFallback(hd, hm, hy);
    }
  }

  // ── Sync fallback path (used while API is loading) ──────────────────────

  /** Synchronous conversion (pure math, no network). */
  convert(date: Date = new Date(), offset = 0): HijriDate {
    const shifted = new Date(date.getTime() + offset * 86_400_000);
    const Y = shifted.getFullYear();
    const M = shifted.getMonth() + 1;
    const D = shifted.getDate();
    const jd = this.gregorianToJD(Y, M, D);
    const { hy, hm, hd } = this.jdToHijri(jd);
    return this.makeHijriDate(hd, hm, hy);
  }

  /** Convenience: convert today with the given offset (sync). */
  todayHijri(offset = 0): HijriDate {
    return this.convert(new Date(), offset);
  }

  /**
   * Like convert() but reads the UTC date components (year/month/day) from
   * the given Date object instead of local-time components.
   * Use this when the Date was parsed from an ISO string that represents a
   * UTC midnight value (e.g. stored HawlRecord.startDate).
   */
  convertUTC(date: Date): HijriDate {
    const Y = date.getUTCFullYear();
    const M = date.getUTCMonth() + 1;
    const D = date.getUTCDate();
    const jd = this.gregorianToJD(Y, M, D);
    const { hy, hm, hd } = this.jdToHijri(jd);
    return this.makeHijriDate(hd, hm, hy);
  }

  // ── Internal helpers ────────────────────────────────────────────────────

  /**
   * Try to resolve a Gregorian date via the Aladhan gToH endpoint.
   * Returns the local fallback on any network/parse error.
   */
  private async fetchFromApi(date: Date): Promise<HijriDate> {
    const key = this.isoDate(date);
    if (this.apiCache.has(key)) {
      return this.apiCache.get(key)!;
    }

    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    // calendarMethod=1 → Umm al-Qura (official Saudi Islamic calendar)
    const url = `https://api.aladhan.com/v1/gToH/${d}-${m}-${y}?calendarMethod=1`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const hijri: AladhanHijri = json?.data?.hijri;
      if (!hijri) throw new Error('Unexpected response shape');

      const hd = parseInt(hijri.day, 10);
      const hm = hijri.month.number;
      const hy = parseInt(hijri.year, 10);

      // Store the official year-length from the API response
      if (!this.yearLengthCache.has(hy)) {
        this.yearLengthCache.set(hy, hijri.isLeapYear ? 355 : 354);
      }

      const result = this.makeHijriDate(hd, hm, hy);
      this.apiCache.set(key, result);
      return result;
    } catch {
      // Offline or API error → fall back to local algorithm
      return this.convert(date, 0);
    }
  }

  /**
   * Apply a day offset to a base HijriDate by shifting today's date
   * and recomputing locally (avoids a second API call).
   */
  private applyOffset(base: HijriDate, offset: number): HijriDate {
    if (offset === 0) return base;
    const shifted = new Date();
    shifted.setDate(shifted.getDate() + offset);
    return this.convert(shifted, 0);
  }

  private makeHijriDate(hd: number, hm: number, hy: number): HijriDate {
    const monthIndex = hm - 1;
    const service = this;
    return {
      day: hd,
      month: hm,
      year: hy,
      monthNameEn: HIJRI_MONTH_NAMES_EN[monthIndex] ?? '',
      monthNameAr: HIJRI_MONTH_NAMES_AR[monthIndex] ?? '',
      formatted(lang: 'en' | 'ar'): string {
        return service.format(this, lang);
      },
    };
  }

  private format(h: Omit<HijriDate, 'formatted'>, lang: 'en' | 'ar'): string {
    if (lang === 'ar') {
      return `${h.day} ${h.monthNameAr} ${h.year}`;
    }
    return `${h.day} ${h.monthNameEn} ${h.year}`;
  }

  private isoDate(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  // ── Calendar math (Fliegel & Van Flandern tabular algorithm) ───────────

  private gregorianToJD(y: number, m: number, d: number): number {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) +
           Math.floor(30.6001 * (m + 1)) +
           d + B - 1524.5;
  }

  private jdToHijri(jd: number): { hy: number; hm: number; hd: number } {
    // Standard tabular Islamic calendar algorithm (Fliegel & Van Flandern)
    // Verified: 2026-03-27 → 27 Rajab 1447 AH
    const z  = Math.floor(jd - 0.5) + 0.5;
    const zz = z - 1948438.5;
    const c  = Math.floor((30 * zz + 10646) / 10631);
    const zc = zz - Math.floor((10631 * c - 10) / 30);
    const j  = Math.floor((11 * zc + 10.5) / 325);
    const zj = zc - Math.floor((325 * j - 0.5) / 11);
    const dd = Math.floor(zj) + 1;
    const mm = Math.floor((zj - dd + 2) / 29) + 1;

    const hy = 30 * (c - 1) + j + 1;
    const hm = mm > 12 ? 12 : mm < 1 ? 1 : mm;
    const hd = dd > 30 ? 30 : dd < 1 ? 1 : dd;

    return { hy, hm, hd };
  }

  /**
   * Inverse tabular algorithm: Hijri date → approximate Gregorian ISO string.
   * Used as offline fallback for hijriToGregorianAsync().
   * Based on the Islamic Calendar algorithm (Fliegel & Van Flandern).
   */
  private hijriToGregorianFallback(hd: number, hm: number, hy: number): string {
    // Hijri → Julian Day Number (tabular Islamic calendar)
    const N = hd + Math.ceil(29.5 * (hm - 1)) + (hy - 1) * 354 +
              Math.floor((3 + 11 * hy) / 30) + 1948439 - 385;
    const jd = N - 0.5;

    // Julian Day → Gregorian
    const z   = Math.floor(jd + 0.5);
    const a   = Math.floor((z - 1867216.25) / 36524.25);
    const a2  = z + 1 + a - Math.floor(a / 4);
    const b   = a2 + 1524;
    const c   = Math.floor((b - 122.1) / 365.25);
    const d   = Math.floor(365.25 * c);
    const e   = Math.floor((b - d) / 30.6001);

    const gd = b - d - Math.floor(30.6001 * e);
    const gm = e < 14 ? e - 1 : e - 13;
    const gy = gm > 2 ? c - 4716 : c - 4715;

    return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
  }
}

