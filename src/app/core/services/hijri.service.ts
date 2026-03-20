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

/**
 * Pure Gregorian → Hijri conversion using the Kuwaiti algorithm,
 * which closely approximates the Umm al-Qura calendar.
 *
 * dayOffset (-2 … +2) lets users correct for local moon-sighting
 * differences without changing any other logic.
 */
@Injectable({ providedIn: 'root' })
export class HijriService {

  /**
   * Convert a Gregorian Date to a Hijri date object.
   * @param date    Gregorian date to convert (defaults to today)
   * @param offset  Day offset (-2 … +2) for moon-sighting correction
   */
  convert(date: Date = new Date(), offset = 0): HijriDate {
    // Apply offset by shifting the Gregorian date
    const shifted = new Date(date.getTime() + offset * 86_400_000);

    const Y = shifted.getFullYear();
    const M = shifted.getMonth() + 1; // 1-based
    const D = shifted.getDate();

    // Julian Day Number
    const jd = this.gregorianToJD(Y, M, D);

    // Julian Day to Hijri
    const { hy, hm, hd } = this.jdToHijri(jd);

    const monthIndex = hm - 1; // 0-based

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

  /** Convenience: convert today with the given offset. */
  todayHijri(offset = 0): HijriDate {
    return this.convert(new Date(), offset);
  }

  private format(h: Omit<HijriDate, 'formatted'>, lang: 'en' | 'ar'): string {
    if (lang === 'ar') {
      return `${h.day} ${h.monthNameAr} ${h.year}`;
    }
    return `${h.day} ${h.monthNameEn} ${h.year}`;
  }

  // ── Calendar math ──────────────────────────────────────────────────────────

  private gregorianToJD(y: number, m: number, d: number): number {
    // Standard algorithm (Meeus, "Astronomical Algorithms")
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) +
           Math.floor(30.6001 * (m + 1)) +
           d + B - 1524.5;
  }

  private jdToHijri(jd: number): { hy: number; hm: number; hd: number } {
    // Kuwaiti algorithm (used by many Islamic calendar implementations)
    const z    = Math.floor(jd) + 0.5;
    const l    = z - 1948438.5;
    const n    = Math.floor(l / 10631);
    const l2   = l - 10631 * n;
    const j    = Math.floor(l2 / 354);
    const k    = Math.floor(j / 30);
    const r    = j - 30 * k;
    const hj   = 30 * n + j;
    const hn   = Math.floor(l2 - 354 * j + 30 - (30 * k + r + 1 > 30 ? 1 : 0));

    // Alternative direct computation (simpler branch-free)
    const N  = Math.floor(jd) - 1948439 + 10632;
    const Nc = Math.floor((N - 1) / 10631);
    const N2 = N - 10631 * Nc + 354;
    const Q  = Math.floor(N2 / 10631);
    const W  = Math.floor((N2 - Q * 10631) / 354.367);
    const Q2 = Math.floor(N2 / 354.367);
    const A2 = Math.floor((11 * Q2 + 3) / 30);
    const W2 = N2 - Q2 * 354 - A2;
    const Q3 = Math.floor(W2 / 29.5);
    const D  = W2 - Math.floor(Q3 * 29.5);
    const M  = Q3 + 1;
    const Yr = 30 * Nc + Q2 + 1;

    void hj; void hn; void l; void n; void l2; void j; void k; void r; // suppress unused

    return { hy: Yr, hm: M, hd: D };
  }
}
