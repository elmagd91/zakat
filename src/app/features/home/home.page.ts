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
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonAccordionGroup,
  IonAccordion,
  IonSpinner,
  IonButtons,
  IonList,
  IonSearchbar,
  IonModal,
  IonToast,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  addCircleOutline,
  closeCircleOutline,
  refreshOutline,
  leafOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  searchOutline,
  cashOutline,
  diamondOutline,
  informationCircleOutline,
  createOutline,
  trashOutline,
} from 'ionicons/icons';

import { PriceService } from '../../core/services/price.service';
import { SettingsService } from '../../core/services/settings.service';
import { ZakatCalculatorService } from '../../core/services/zakat-calculator.service';
import { StorageService } from '../../core/services/storage.service';
import { CurrencyEntry, GoldAssets, ZakatResult, POPULAR_CURRENCIES, CurrencyInfo, MarketPrices } from '../../core/models/zakat.models';

interface CurrencyEntryWithRate extends CurrencyEntry {
  egpPerUnit: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonIcon,
    IonAccordionGroup,
    IonAccordion,
    IonSpinner,
    IonButtons,
    IonList,
    IonSearchbar,
    IonModal,
    IonToast,
  ],
})
export class HomePage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Asset state
  egpBalance = 0;
  currencies: CurrencyEntryWithRate[] = [];
  gold: GoldAssets = { grams24k: 0, grams21k: 0, grams18k: 0 };

  // Editable gold prices
  goldPrice24k = 0;
  goldPrice21k = 0;
  goldPrice18k = 0;

  // UI state
  result: ZakatResult | null = null;
  prices: MarketPrices | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  showToast = false;
  toastMessage = '';
  hasCalculated = false;
  showSavedIndicator = false;

  // Currency picker
  isCurrencyModalOpen = false;
  currencySearch = '';
  allCurrencies: CurrencyInfo[] = POPULAR_CURRENCIES;

  get filteredCurrencies(): CurrencyInfo[] {
    const search = this.currencySearch.toLowerCase();
    const usedCodes = new Set(this.currencies.map(c => c.code));
    return this.allCurrencies.filter(c =>
      !usedCodes.has(c.code) &&
      (c.code.toLowerCase().includes(search) || c.name.toLowerCase().includes(search))
    );
  }

  get nisabProgress(): number {
    if (!this.result) return 0;
    return Math.min(this.result.totalWealthEGP / this.result.nisabThresholdEGP, 1);
  }

  get hedgePercentage(): number {
    return this.settingsService.hedgePercentage;
  }

  constructor(
    private router: Router,
    private priceService: PriceService,
    private settingsService: SettingsService,
    private zakatService: ZakatCalculatorService,
    private storageService: StorageService,
    private alertCtrl: AlertController,
  ) {
    addIcons({
      settingsOutline, addCircleOutline, closeCircleOutline, refreshOutline,
      leafOutline, alertCircleOutline, checkmarkCircleOutline, searchOutline,
      cashOutline, diamondOutline, informationCircleOutline, createOutline, trashOutline,
    });
  }

  ngOnInit(): void {
    // 1. Restore saved state FIRST (before API prices arrive)
    this.restoreState();

    // 2. Subscribe to API prices
    this.priceService.prices$
      .pipe(takeUntil(this.destroy$))
      .subscribe((prices) => {
        this.prices = prices;
        if (prices) {
          // Seed gold prices only if they weren't restored from storage
          if (this.goldPrice24k === 0) {
            this.goldPrice24k = prices.goldPrices['24k'];
            this.goldPrice21k = prices.goldPrices['21k'];
            this.goldPrice18k = prices.goldPrices['18k'];
          }
          // Seed exchange rates for any currency added after a save
          this.currencies.forEach(c => {
            if (c.egpPerUnit === 0 && prices.exchangeRates[c.code]) {
              c.egpPerUnit = Math.round((1 / prices.exchangeRates[c.code]) * 100) / 100;
            }
          });
        }
        if (this.hasCalculated) this.runCalculation();
      });

    this.priceService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(l => this.isLoading = l);

    this.priceService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(e => this.errorMessage = e);

    this.loadPrices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Persistence ────────────────────────────────────────────

  private restoreState(): void {
    const saved = this.storageService.load();
    if (!saved) return;

    this.egpBalance   = saved.egpBalance   ?? 0;
    this.currencies   = saved.currencies   ?? [];
    this.gold         = saved.gold         ?? { grams24k: 0, grams21k: 0, grams18k: 0 };
    this.goldPrice24k = saved.goldPrice24k ?? 0;
    this.goldPrice21k = saved.goldPrice21k ?? 0;
    this.goldPrice18k = saved.goldPrice18k ?? 0;

    if (saved.hedgePercentage != null) {
      this.settingsService.setHedgePercentage(saved.hedgePercentage);
    }
  }

  private saveState(): void {
    this.storageService.save({
      egpBalance:   this.egpBalance,
      currencies:   this.currencies,
      gold:         this.gold,
      goldPrice24k: this.goldPrice24k,
      goldPrice21k: this.goldPrice21k,
      goldPrice18k: this.goldPrice18k,
      hedgePercentage: this.settingsService.hedgePercentage,
    });

    // Flash "Saved" indicator briefly
    this.showSavedIndicator = true;
    setTimeout(() => this.showSavedIndicator = false, 1500);
  }

  async clearSavedData(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Clear All Data?',
      message: 'This will remove all your saved balances, currencies, and gold entries.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Clear',
          role: 'destructive',
          handler: () => {
            this.storageService.clear();
            this.egpBalance   = 0;
            this.currencies   = [];
            this.gold         = { grams24k: 0, grams21k: 0, grams18k: 0 };
            this.goldPrice24k = this.prices?.goldPrices['24k'] ?? 0;
            this.goldPrice21k = this.prices?.goldPrices['21k'] ?? 0;
            this.goldPrice18k = this.prices?.goldPrices['18k'] ?? 0;
            this.result       = null;
            this.hasCalculated = false;
          },
        },
      ],
      cssClass: 'nisab-alert',
    });
    await alert.present();
  }

  // ── Prices ─────────────────────────────────────────────────

  loadPrices(): void {
    this.priceService.fetchMarketPrices().subscribe();
  }

  refreshPrices(): void {
    this.goldPrice24k = 0;
    this.goldPrice21k = 0;
    this.goldPrice18k = 0;
    this.currencies.forEach(c => c.egpPerUnit = 0);
    this.loadPrices();
  }

  // ── Calculation ────────────────────────────────────────────

  calculate(): void {
    this.hasCalculated = true;
    this.runCalculation();
    this.saveState();
  }

  private runCalculation(): void {
    const effectivePrices: MarketPrices = {
      baseCurrency: 'EGP',
      timestamp: new Date().toISOString(),
      goldPrices: {
        '24k': this.goldPrice24k || 0,
        '21k': this.goldPrice21k || 0,
        '18k': this.goldPrice18k || 0,
      },
      exchangeRates: this.buildExchangeRates(),
    };

    this.result = this.zakatService.calculate(
      this.egpBalance,
      this.currencies,
      this.gold,
      effectivePrices,
      this.settingsService.hedgePercentage,
    );
  }

  private buildExchangeRates(): Record<string, number> {
    const overrides: Record<string, number> = { ...(this.prices?.exchangeRates ?? {}) };
    this.currencies.forEach(c => {
      if (c.egpPerUnit > 0) overrides[c.code] = 1 / c.egpPerUnit;
    });
    return overrides;
  }

  // ── Inputs ─────────────────────────────────────────────────

  onAmountChange(): void {
    if (this.hasCalculated) this.runCalculation();
    this.saveState();
  }

  onGoldPriceChange(): void {
    if (this.hasCalculated) this.runCalculation();
    this.saveState();
  }

  autoFillKaratPrices(): void {
    if (this.goldPrice24k > 0) {
      this.goldPrice21k = Math.round(this.goldPrice24k * 21 / 24);
      this.goldPrice18k = Math.round(this.goldPrice24k * 18 / 24);
      if (this.hasCalculated) this.runCalculation();
      this.saveState();
    }
  }

  openCurrencyModal(): void {
    this.currencySearch = '';
    this.isCurrencyModalOpen = true;
  }

  addCurrency(currency: CurrencyInfo): void {
    const apiRate = this.prices?.exchangeRates[currency.code];
    const egpPerUnit = apiRate ? Math.round((1 / apiRate) * 100) / 100 : 0;
    this.currencies.push({ code: currency.code, name: currency.name, amount: 0, egpPerUnit });
    this.isCurrencyModalOpen = false;
    this.saveState();
    if (this.hasCalculated) this.runCalculation();
  }

  removeCurrency(index: number): void {
    this.currencies.splice(index, 1);
    this.saveState();
    if (this.hasCalculated) this.runCalculation();
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  // ── Helpers ────────────────────────────────────────────────

  formatEGP(amount: number): string {
    return new Intl.NumberFormat('en-EG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  getCurrencyFlag(code: string): string {
    const flagMap: Record<string, string> = {
      USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', SAR: '🇸🇦',
      AED: '🇦🇪', KWD: '🇰🇼', QAR: '🇶🇦', BHD: '🇧🇭',
      OMR: '🇴🇲', JOD: '🇯🇴', LYD: '🇱🇾', TND: '🇹🇳',
      MAD: '🇲🇦', CHF: '🇨🇭', CAD: '🇨🇦', AUD: '🇦🇺',
      JPY: '🇯🇵', CNY: '🇨🇳', TRY: '🇹🇷', INR: '🇮🇳',
      PKR: '🇵🇰', NGN: '🇳🇬', MYR: '🇲🇾', SGD: '🇸🇬',
      HKD: '🇭🇰', NOK: '🇳🇴', SEK: '🇸🇪', DKK: '🇩🇰',
      NZD: '🇳🇿', ZAR: '🇿🇦',
    };
    return flagMap[code] || '🏳️';
  }

  async showNisabInfo(): Promise<void> {
    const nisab = this.result?.nisabThresholdEGP;
    const alert = await this.alertCtrl.create({
      header: 'What is Nisab?',
      message: `The Nisab is the minimum amount of wealth a Muslim must have before Zakat becomes obligatory. It equals the value of 85 grams of gold.${nisab ? '\n\nCurrent Nisab: EGP ' + this.formatEGP(nisab) : ''}`,
      buttons: ['Got it'],
      cssClass: 'nisab-alert',
    });
    await alert.present();
  }
}
