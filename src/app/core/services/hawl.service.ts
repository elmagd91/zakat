import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HawlRecord, HawlState, HAWL_DAYS_FALLBACK } from '../models/zakat.models';
import { HijriService } from './hijri.service';

const HAWL_STORAGE_KEY = 'zakah_hawl';

function computeState(record: HawlRecord | null, hawlDays: number = HAWL_DAYS_FALLBACK): HawlState {
  if (!record) {
    return { record: null, isComplete: false, elapsedDays: 0, remainingDays: hawlDays, progressFraction: 0 };
  }
  const startMs = new Date(record.startDate).getTime();
  const nowMs   = Date.now();
  const elapsedDays    = Math.floor((nowMs - startMs) / 86_400_000);
  const clampedElapsed = Math.max(0, elapsedDays);
  const remainingDays  = Math.max(0, hawlDays - clampedElapsed);
  const isComplete     = clampedElapsed >= hawlDays;
  const progressFraction = Math.min(1, clampedElapsed / hawlDays);
  return { record, isComplete, elapsedDays: clampedElapsed, remainingDays, progressFraction };
}

@Injectable({ providedIn: 'root' })
export class HawlService {

  /** The authoritative Hawl length in days (fetched from Aladhan, default 354). */
  hawlDays: number = HAWL_DAYS_FALLBACK;

  private readonly _state$ = new BehaviorSubject<HawlState>(
    computeState(this.loadRecord(), HAWL_DAYS_FALLBACK)
  );

  readonly hawlState$: Observable<HawlState> = this._state$.asObservable();

  get state(): HawlState {
    return this._state$.getValue();
  }

  constructor(private hijriService: HijriService) {
    // Fetch actual lunar year length from API and recompute state
    this.hijriService.getHijriYearDays().then(days => {
      this.hawlDays = days;
      this._state$.next(computeState(this.loadRecord(), days));
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────

  startHawl(nisabAtStart: number, wealthAtStart: number, customStartIso?: string): void {
    const record: HawlRecord = {
      startDate:    customStartIso ?? new Date().toISOString(),
      nisabAtStart,
      wealthAtStart,
    };
    this.saveRecord(record);
    this._state$.next(computeState(record, this.hawlDays));
  }

  clearHawl(): void {
    this.saveRecord(null);
    this._state$.next(computeState(null, this.hawlDays));
  }

  /** Re-compute state from stored record (call after app resume). */
  refresh(): void {
    const record = this.loadRecord();
    this._state$.next(computeState(record, this.hawlDays));
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
      const record = JSON.parse(raw) as HawlRecord;
      // Discard any persisted record with an invalid start date
      if (!record?.startDate || isNaN(new Date(record.startDate).getTime())) {
        localStorage.removeItem(HAWL_STORAGE_KEY);
        return null;
      }
      return record;
    } catch {
      return null;
    }
  }
}
