import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonRange,
  IonIcon,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  shieldCheckmarkOutline,
  informationCircleOutline,
  leafOutline,
  languageOutline,
} from 'ionicons/icons';

import { SettingsService } from '../../core/services/settings.service';
import { TranslationService } from '../../core/services/translation.service';
import { Language } from '../../core/i18n/translations';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonRange,
    IonIcon,
    IonButtons,
    IonBackButton,
  ],
})
export class SettingsPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  hedgePercentage: number = 5;

  get minHedge(): number { return this.settingsService.minHedge; }
  get maxHedge(): number { return this.settingsService.maxHedge; }

  get hedgeExplanation(): string {
    const h = this.hedgePercentage;
    if (h <= 3) return this.ts.t('hedgeConservative');
    if (h <= 6) return this.ts.t('hedgeBalanced');
    return this.ts.t('hedgeGenerous');
  }

  constructor(
    private router: Router,
    private settingsService: SettingsService,
    public ts: TranslationService,
  ) {
    addIcons({ arrowBackOutline, shieldCheckmarkOutline, informationCircleOutline, leafOutline, languageOutline });
  }

  ngOnInit(): void {
    this.settingsService.hedgePercentage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => (this.hedgePercentage = val));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setLanguage(lang: Language): void {
    this.ts.setLanguage(lang);
  }

  onHedgeChange(event: CustomEvent): void {
    const value = event.detail.value as number;
    this.settingsService.setHedgePercentage(value);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
