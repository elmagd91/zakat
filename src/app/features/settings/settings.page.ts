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
} from 'ionicons/icons';

import { SettingsService } from '../../core/services/settings.service';

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
    if (h <= 3) return 'Conservative buffer. Best for stable economic conditions.';
    if (h <= 6) return 'Balanced buffer. Recommended for most situations.';
    return 'Generous buffer. Ideal during high inflation or market volatility.';
  }

  constructor(
    private router: Router,
    private settingsService: SettingsService,
  ) {
    addIcons({ arrowBackOutline, shieldCheckmarkOutline, informationCircleOutline, leafOutline });
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

  onHedgeChange(event: CustomEvent): void {
    const value = event.detail.value as number;
    this.settingsService.setHedgePercentage(value);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
