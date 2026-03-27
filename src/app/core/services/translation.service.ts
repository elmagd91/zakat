import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Language, Translations, TRANSLATIONS } from '../i18n/translations';

const STORAGE_KEY = 'zakah_language';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly _language$ = new BehaviorSubject<Language>(this.loadLanguage());

  readonly language$ = this._language$.asObservable();

  get currentLanguage(): Language {
    return this._language$.getValue();
  }

  get isRTL(): boolean {
    return this.currentLanguage === 'ar';
  }

  constructor() {
    this.applyDirection(this.currentLanguage);
  }

  setLanguage(lang: Language): void {
    localStorage.setItem(STORAGE_KEY, lang);
    this._language$.next(lang);
    this.applyDirection(lang);
  }

  /** Main translation method — resolves a key for the current language */
  t(key: keyof Translations): string {
    return TRANSLATIONS[this.currentLanguage][key] as string;
  }

  /**
   * Translation with simple placeholder substitution.
   * Example: ts.tr('noZakatText', { wealth: '10,000', nisab: '20,000' })
   */
  tr(key: keyof Translations, params: Record<string, string>): string {
    let str = this.t(key);
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, v);
    }
    return str;
  }

  applyDirection(lang: Language): void {
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }

  private loadLanguage(): Language {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    return stored === 'en' ? 'en' : 'ar';
  }
}
