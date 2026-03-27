import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const DEFAULT_HEDGE_PERCENTAGE = 5;
const MIN_HEDGE = 1;
const MAX_HEDGE = 10;

const MIN_HIJRI_OFFSET = -2;
const MAX_HIJRI_OFFSET =  2;

const HIJRI_OFFSET_KEY = 'zakah_hijri_offset';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly _hedgePercentage$ = new BehaviorSubject<number>(DEFAULT_HEDGE_PERCENTAGE);
  readonly hedgePercentage$ = this._hedgePercentage$.asObservable();

  private readonly _hijriDayOffset$ = new BehaviorSubject<number>(this.loadHijriOffset());
  readonly hijriDayOffset$ = this._hijriDayOffset$.asObservable();

  private loadHijriOffset(): number {
    const v = parseInt(localStorage.getItem(HIJRI_OFFSET_KEY) ?? '0', 10);
    return isNaN(v) ? 0 : Math.max(MIN_HIJRI_OFFSET, Math.min(MAX_HIJRI_OFFSET, v));
  }

  get hedgePercentage(): number {
    return this._hedgePercentage$.getValue();
  }

  setHedgePercentage(value: number): void {
    const clamped = Math.max(MIN_HEDGE, Math.min(MAX_HEDGE, Math.round(value)));
    this._hedgePercentage$.next(clamped);
  }

  get hijriDayOffset(): number {
    return this._hijriDayOffset$.getValue();
  }

  setHijriDayOffset(value: number): void {
    const clamped = Math.max(MIN_HIJRI_OFFSET, Math.min(MAX_HIJRI_OFFSET, Math.round(value)));
    localStorage.setItem(HIJRI_OFFSET_KEY, String(clamped));
    this._hijriDayOffset$.next(clamped);
  }

  get minHedge(): number { return MIN_HEDGE; }
  get maxHedge(): number { return MAX_HEDGE; }
  get minHijriOffset(): number { return MIN_HIJRI_OFFSET; }
  get maxHijriOffset(): number { return MAX_HIJRI_OFFSET; }
}
