import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const DEFAULT_HEDGE_PERCENTAGE = 5;
const MIN_HEDGE = 1;
const MAX_HEDGE = 10;

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly _hedgePercentage$ = new BehaviorSubject<number>(DEFAULT_HEDGE_PERCENTAGE);

  readonly hedgePercentage$ = this._hedgePercentage$.asObservable();

  get hedgePercentage(): number {
    return this._hedgePercentage$.getValue();
  }

  setHedgePercentage(value: number): void {
    const clamped = Math.max(MIN_HEDGE, Math.min(MAX_HEDGE, Math.round(value)));
    this._hedgePercentage$.next(clamped);
  }

  get minHedge(): number { return MIN_HEDGE; }
  get maxHedge(): number { return MAX_HEDGE; }
}
