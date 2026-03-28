import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonIcon,
  AlertController,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  calendarOutline,
  checkmarkCircleOutline,
  refreshOutline,
  timeOutline,
  leafOutline,
  createOutline,
} from 'ionicons/icons';

import { HawlService } from '../../core/services/hawl.service';
import { HijriService } from '../../core/services/hijri.service';
import { SettingsService } from '../../core/services/settings.service';
import { TranslationService } from '../../core/services/translation.service';
import { HawlState } from '../../core/models/zakat.models';

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qi'dah", 'Dhul Hijjah',
];
const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

@Component({
  selector: 'app-hawl',
  templateUrl: './hawl.page.html',
  styleUrls: ['./hawl.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButton, IonButtons, IonCard, IonCardContent,
    IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonIcon,
  ],
})
export class HawlPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  hawlState: HawlState = {
    record: null, isComplete: false,
    elapsedDays: 0, remainingDays: 354, progressFraction: 0,
  };

  hijriDateStr = '';

  get hawlDays(): number { return this.hawlService.hawlDays; }

  /** SVG ring params */
  readonly RADIUS = 90;
  readonly CIRCUMFERENCE = 2 * Math.PI * this.RADIUS;

  get strokeDashoffset(): number {
    return this.CIRCUMFERENCE * (1 - this.hawlState.progressFraction);
  }

  constructor(
    private router: Router,
    private hawlService: HawlService,
    private hijriService: HijriService,
    private settingsService: SettingsService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    public ts: TranslationService,
  ) {
    addIcons({ arrowBackOutline, calendarOutline, checkmarkCircleOutline, refreshOutline, timeOutline, leafOutline, createOutline });
  }

  ngOnInit(): void {
    this.hawlService.hawlState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(s => this.hawlState = s);

    const offset = this.settingsService.hijriDayOffset;
    // Show local fallback instantly, then update from Aladhan API
    this.hijriDateStr = this.hijriService.todayHijri(offset).formatted(this.ts.currentLanguage);
    this.hijriService.todayHijriAsync(offset).then(h => {
      this.hijriDateStr = h.formatted(this.ts.currentLanguage);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  async startHawl(): Promise<void> {
    this.hawlService.startHawl(0, 0);
  }

  /**
   * Opens an Ionic alert with three selects to choose a Hijri date.
   * On confirm, converts the Hijri date to Gregorian (via Aladhan API)
   * and starts/updates the Hawl with that date.
   *
   * NOTE: Ionic AlertController sanitizes the 'message' field, so we inject
   * HTML into the alert's DOM manually after alert.present() resolves.
   */
  async openDatePicker(isEdit = false): Promise<void> {
    const offset = this.settingsService.hijriDayOffset;
    const today = this.hijriService.todayHijri(offset);

    const isAr = this.ts.currentLanguage === 'ar';
    const monthNames = isAr ? HIJRI_MONTHS_AR : HIJRI_MONTHS_EN;

    // Pre-fill values
    let preYear  = today.year;
    let preMonth = today.month;
    let preDay   = today.day;

    if (isEdit && this.hawlState.record) {
      const startGreg = new Date(this.hawlState.record.startDate);
      // Use UTC parts so timezone doesn't shift the date
      const h = this.hijriService.convertUTC(startGreg);
      preYear  = h.year;
      preMonth = h.month;
      preDay   = h.day;
    }

    // Captured inside handler closure
    let savedHd = preDay, savedHm = preMonth, savedHy = preYear;

    const alert = await this.alertCtrl.create({
      header: this.ts.t('setStartDateTitle'),
      cssClass: 'hijri-datepicker-alert',
      // Leave message empty — we inject HTML directly after present()
      message: ' ',
      buttons: [
        { text: this.ts.t('cancel'), role: 'cancel' },
        {
          text: this.ts.t('confirm'),
          handler: () => {
            this.applyHijriStartDate(savedHd, savedHm, savedHy);
            return true;
          },
        },
      ],
    });
    await alert.present();

    // After the alert is in the DOM, replace its message div with our picker HTML
    const msgEl = document.querySelector('.hijri-datepicker-alert .alert-message') as HTMLElement | null;
    if (msgEl) {
      msgEl.innerHTML = this.buildPickerHTML(preDay, preMonth, preYear, monthNames);

      // Wire up change events to keep savedH* in sync
      const dayEl   = msgEl.querySelector('#picker-day')   as HTMLSelectElement | null;
      const monthEl = msgEl.querySelector('#picker-month') as HTMLSelectElement | null;
      const yearEl  = msgEl.querySelector('#picker-year')  as HTMLSelectElement | null;

      dayEl?.addEventListener('change',   () => { savedHd = parseInt(dayEl.value,   10); });
      monthEl?.addEventListener('change', () => { savedHm = parseInt(monthEl.value, 10); });
      yearEl?.addEventListener('change',  () => { savedHy = parseInt(yearEl.value,  10); });
    }
  }

  /** Build the picker HTML string (not bound by Angular's sanitizer here). */
  private buildPickerHTML(
    preDay: number, preMonth: number, preYear: number,
    monthNames: string[],
  ): string {
    const todayYear = this.hijriService.todayHijri(0).year;

    const dayOpts = Array.from({ length: 30 }, (_, i) => i + 1)
      .map(d => `<option value="${d}"${d === preDay ? ' selected' : ''}>${d}</option>`)
      .join('');

    const monthOpts = monthNames
      .map((name, i) => {
        const m = i + 1;
        return `<option value="${m}"${m === preMonth ? ' selected' : ''}>${m} - ${name}</option>`;
      })
      .join('');

    const yearOpts = Array.from({ length: todayYear - 1420 + 2 }, (_, i) => 1420 + i)
      .map(y => `<option value="${y}"${y === preYear ? ' selected' : ''}>${y}</option>`)
      .join('');

    const dayLabel   = this.ts.t('hijriDay');
    const monthLabel = this.ts.t('hijriMonth');
    const yearLabel  = this.ts.t('hijriYear');

    return `
      <div class="picker-row">
        <label>${dayLabel}</label>
        <select id="picker-day">${dayOpts}</select>
      </div>
      <div class="picker-row">
        <label>${monthLabel}</label>
        <select id="picker-month">${monthOpts}</select>
      </div>
      <div class="picker-row">
        <label>${yearLabel}</label>
        <select id="picker-year">${yearOpts}</select>
      </div>`;
  }

  /** Convert the chosen Hijri date to Gregorian and update the Hawl record. */
  private async applyHijriStartDate(hd: number, hm: number, hy: number): Promise<void> {
    const loading = await this.loadingCtrl.create({ duration: 5000, spinner: 'crescent' });
    await loading.present();
    try {
      const isoDate = await this.hijriService.hijriToGregorianAsync(hd, hm, hy);
      // Preserve existing nisab/wealth if editing
      const nisab  = this.hawlState.record?.nisabAtStart  ?? 0;
      const wealth = this.hawlState.record?.wealthAtStart ?? 0;
      this.hawlService.startHawl(nisab, wealth, isoDate + 'T00:00:00.000Z');
    } finally {
      await loading.dismiss();
    }
  }

  async confirmReset(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: this.ts.t('resetHawlTitle'),
      message: this.ts.t('resetHawlConfirm'),
      buttons: [
        { text: this.ts.t('cancel'), role: 'cancel' },
        {
          text: this.ts.t('resetHawl'),
          role: 'destructive',
          handler: () => this.hawlService.clearHawl(),
        },
      ],
      cssClass: 'nisab-alert',
    });
    await alert.present();
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(
      this.ts.currentLanguage === 'ar' ? 'ar-EG' : 'en-GB',
      { year: 'numeric', month: 'long', day: 'numeric' },
    );
  }

  formatHijriDate(iso: string): string {
    const date = new Date(iso);
    // Use UTC parts to avoid timezone shifting the date (ISO strings are UTC midnight)
    const h = this.hijriService.convertUTC(date);
    return h.formatted(this.ts.currentLanguage);
  }

  formatEGP(n: number): string {
    return new Intl.NumberFormat('en-EG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  }
}
