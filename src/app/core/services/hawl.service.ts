import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HawlRecord, HawlState, HAWL_DAYS } from '../models/zakat.models';

const HAWL_STORAGE_KEY = 'zakah_hawl';

function computeState(record: HawlRecord | null): HawlState {
  if (!record) {
    return { record: null, isComplete: false, elapsedDays: 0, remainingDays: HAWL_DAYS, progressFraction: 0 };
  }
  const startMs = new Date(record.startDate).getTime();
  const nowMs   = Date.now();
  const elapsedDays    = Math.floor((nowMs - startMs) / 86_400_000);
  const clampedElapsed = Math.max(0, elapsedDays);
  const remainingDays  = Math.max(0, HAWL_DAYS - clampedElapsed);
  const isComplete     = clampedElapsed >= HAWL_DAYS;
  const progressFraction = Math.min(1, clampedElapsed / HAWL_DAYS);
  return { record, isComplete, elapsedDays: clampedElapsed, remainingDays, progressFraction };
}

@Injectable({ providedIn: 'root' })
export class HawlService {

  private readonly _state$ = new BehaviorSubject<HawlState>(
    computeState(this.loadRecord())
  );

  readonly hawlState$: Observable<HawlState> = this._state$.asObservable();

  get state(): HawlState {
    return this._state$.getValue();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  startHawl(nisabAtStart: number, wealthAtStart: number): void {
    const record: HawlRecord = {
      startDate:    new Date().toISOString(),
      nisabAtStart,
      wealthAtStart,
    };
    this.saveRecord(record);
    this._state$.next(computeState(record));
  }

  clearHawl(): void {
    this.saveRecord(null);
    this._state$.next(computeState(null));
  }

  /** Re-compute state from stored record (call after app resume). */
  refresh(): void {
    const record = this.loadRecord();
    this._state$.next(computeState(record));
  }

  // ── Persistence ───────────────────────────────────────────────────────────

  private saveRecord(record: HawlRecord | null): void {
    try {
      if (record) {
        localStorage.setItem(HAWL_STORAGE_KEY, JSON.stringify(record));
      } else {
        localStorage.removeItem(HAWL_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('HawlService: could not persist to localStorage', e);
    }
  }

  private loadRecord(): HawlRecord | null {
    try {
      const raw = localStorage.getItem(HAWL_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as HawlRecord;
    } catch {
      return null;
    }
  }
}
