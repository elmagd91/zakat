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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  calendarOutline,
  checkmarkCircleOutline,
  refreshOutline,
  timeOutline,
  leafOutline,
} from 'ionicons/icons';

import { HawlService } from '../../core/services/hawl.service';
import { HijriService } from '../../core/services/hijri.service';
import { SettingsService } from '../../core/services/settings.service';
import { TranslationService } from '../../core/services/translation.service';
import { HawlState } from '../../core/models/zakat.models';

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
    public ts: TranslationService,
  ) {
    addIcons({ arrowBackOutline, calendarOutline, checkmarkCircleOutline, refreshOutline, timeOutline, leafOutline });
  }

  ngOnInit(): void {
    this.hawlService.hawlState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(s => this.hawlState = s);

    const offset = this.settingsService.hijriDayOffset;
    const hd = this.hijriService.todayHijri(offset);
    this.hijriDateStr = hd.formatted(this.ts.currentLanguage);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  async startHawl(): Promise<void> {
    // Start with placeholder values — user typically comes here after calculating on home
    this.hawlService.startHawl(0, 0);
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

  formatEGP(n: number): string {
    return new Intl.NumberFormat('en-EG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  }
}
