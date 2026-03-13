import { Injectable } from '@angular/core';

const STORAGE_KEY = 'zakah_user_data';

export interface PersistedState {
  egpBalance: number;
  currencies: Array<{ code: string; name: string; amount: number; egpPerUnit: number }>;
  gold: { grams24k: number; grams21k: number; grams18k: number };
  goldPrice24k: number;
  goldPrice21k: number;
  goldPrice18k: number;
  hedgePercentage?: number;
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  save(state: PersistedState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save state to localStorage', e);
    }
  }

  load(): PersistedState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PersistedState;
    } catch (e) {
      console.warn('Could not load state from localStorage', e);
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
