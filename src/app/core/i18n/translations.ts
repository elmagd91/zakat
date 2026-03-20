export type Language = 'en' | 'ar';

export interface Translations {
  // ── Header ──────────────────────────────────────────────────
  appSubtitle: string;
  appTitle: string;
  saved: string;
  clearData: string;
  settings: string;

  // ── Status banners ──────────────────────────────────────────
  fetchingPrices: string;

  // ── Sections ────────────────────────────────────────────────
  sectionEGP: string;
  sectionForeignCurrencies: string;
  sectionGoldAssets: string;
  add: string;

  // ── Currency card ───────────────────────────────────────────
  egpCurrencyName: string;
  rateLabel: string;   // "1 {CODE} ="
  egp: string;
  grams: string;
  pricePerGram: string;
  approx: string;      // "≈"
  addForeignCurrency: string;

  // ── Gold karats ─────────────────────────────────────────────
  gold24kTitle: string;
  gold24kSub: string;
  gold21kTitle: string;
  gold21kSub: string;
  gold18kTitle: string;
  gold18kSub: string;

  // ── Calculate button ────────────────────────────────────────
  calculate: string;
  recalculate: string;

  // ── Results ──────────────────────────────────────────────────
  yourResults: string;
  totalWealth: string;
  breakdownEGP: string;
  cashEGP: string;
  foreignCurrencies: string;
  goldAssets: string;
  total: string;
  nisabThreshold: string;
  noZakatDue: string;
  noZakatText: string;     // takes {wealth} and {nisab} placeholders
  zakatFootnote: string;
  obligatoryZakat: string;
  obligatoryZakatSub: string;
  precautionaryZakat: string;
  precautionaryZakatSub: string; // takes {pct} placeholder
  exactObligation: string;
  accountsFor: string;    // takes {pct} placeholder
  adjustIn: string;

  // ── Currency modal ───────────────────────────────────────────
  selectCurrency: string;
  close: string;
  searchCurrencies: string;
  noCurrenciesFound: string;

  // ── Alerts ───────────────────────────────────────────────────
  clearAllTitle: string;
  clearAllMessage: string;
  cancel: string;
  clear: string;
  nisabInfoTitle: string;
  nisabInfoMessage: string;  // takes optional {nisab} placeholder
  gotIt: string;

  // ── Settings page ────────────────────────────────────────────
  settingsTitle: string;
  back: string;
  language: string;
  languageSectionHeader: string;
  hedgeBufferSection: string;
  precautionaryBuffer: string;
  precautionaryBufferSub: string;
  buffer: string;
  aboutHedge: string;
  whatIsHedge: string;
  hedgeDesc1: string;
  hedgeDesc2: string;
  formula: string;
  formulaValue: string;
  aboutNisab: string;
  whatIsNisab: string;
  nisabDesc1: string;
  nisabDesc2: string;
  nisabNote: string;

  // ── Hedge explanation strings ────────────────────────────────
  hedgeConservative: string;
  hedgeBalanced: string;
  hedgeGenerous: string;

  // ── Hawl tracking ────────────────────────────────────────────────────
  hawlTitle: string;
  hawlSubtitle: string;
  hawlNotStarted: string;
  hawlNotStartedDesc: string;
  startHawl: string;
  hawlInProgress: string;
  hawlComplete: string;
  hawlCompleteDesc: string;
  daysElapsed: string;
  daysRemaining: string;
  startedOn: string;
  nisabAtStart: string;
  wealthAtStart: string;
  resetHawl: string;
  resetHawlTitle: string;
  resetHawlConfirm: string;
  hawlBannerProgress: string;  // takes {days} placeholder
  hawlBannerDue: string;
  viewHawl: string;

  // ── Hijri calendar ───────────────────────────────────────────────────
  todayHijri: string;
  hijriDayOffset: string;
  hijriDayOffsetSub: string;
  hijriSectionHeader: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    // Header
    appSubtitle: 'Smart',
    appTitle: 'Zakat Calculator',
    saved: '✓ Saved',
    clearData: 'Clear all data',
    settings: 'Settings',

    // Status
    fetchingPrices: 'Fetching live market prices...',

    // Sections
    sectionEGP: 'Egyptian Pound (EGP)',
    sectionForeignCurrencies: 'Foreign Currencies',
    sectionGoldAssets: 'Gold Assets',
    add: 'Add',

    // Currency card
    egpCurrencyName: 'Egyptian Pound',
    rateLabel: '1 {CODE} =',
    egp: 'EGP',
    grams: 'grams',
    pricePerGram: 'Price per gram:',
    approx: '≈',
    addForeignCurrency: 'Add a Foreign Currency',

    // Gold karats
    gold24kTitle: 'Pure Gold (24 Karat)',
    gold24kSub: 'Most valuable form',
    gold21kTitle: 'Gold (21 Karat)',
    gold21kSub: 'Most common in Egypt',
    gold18kTitle: 'Gold (18 Karat)',
    gold18kSub: 'Common in jewelry',

    // Calculate
    calculate: 'Calculate Zakat',
    recalculate: 'Recalculate & Save',

    // Results
    yourResults: 'Your Results',
    totalWealth: 'Total Wealth',
    breakdownEGP: 'Breakdown in EGP',
    cashEGP: '🇪🇬 Cash (EGP)',
    foreignCurrencies: '💱 Foreign Currencies',
    goldAssets: '🥇 Gold Assets',
    total: 'Total',
    nisabThreshold: 'Nisab Threshold',
    noZakatDue: 'No Zakat Due',
    noZakatText: 'Your total wealth of {wealth} EGP has not reached the Nisab of {nisab} EGP.',
    zakatFootnote: 'Zakat becomes obligatory when wealth reaches the Nisab.',
    obligatoryZakat: 'Obligatory Zakat',
    obligatoryZakatSub: 'Minimum — 2.5% of your wealth',
    precautionaryZakat: 'Precautionary Zakat',
    precautionaryZakatSub: '+{pct}% hedge buffer',
    exactObligation: 'The exact Zakat obligation you must fulfill.',
    accountsFor: 'Accounts for market fluctuations with a {pct}% buffer. Adjust in',
    adjustIn: 'Settings',

    // Modal
    selectCurrency: 'Select Currency',
    close: 'Close',
    searchCurrencies: 'Search currencies...',
    noCurrenciesFound: 'No currencies found',

    // Alerts
    clearAllTitle: 'Clear All Data?',
    clearAllMessage: 'This will remove all your saved balances, currencies, and gold entries.',
    cancel: 'Cancel',
    clear: 'Clear',
    nisabInfoTitle: 'What is Nisab?',
    nisabInfoMessage: 'The Nisab is the minimum amount of wealth a Muslim must have before Zakat becomes obligatory. It equals the value of 85 grams of gold.{nisab}',
    gotIt: 'Got it',

    // Settings
    settingsTitle: 'Settings',
    back: 'Back',
    language: 'Language',
    languageSectionHeader: 'Language / اللغة',
    hedgeBufferSection: 'Zakat Hedge Buffer',
    precautionaryBuffer: 'Precautionary Buffer',
    precautionaryBufferSub: 'Applied to your total wealth before Zakat calculation',
    buffer: 'Buffer',
    aboutHedge: 'About the Hedge',
    whatIsHedge: 'What is the Hedge Buffer?',
    hedgeDesc1: 'Gold and currency prices fluctuate constantly. The Precautionary Zakat adds a buffer percentage to your total wealth before calculating the 2.5% Zakat obligation.',
    hedgeDesc2: 'This ensures you pay Zakat on a slightly inflated estimate, providing peace of mind that your full obligation is covered even if prices change during the year.',
    formula: 'Formula',
    formulaValue: 'Hedge Zakat = Total Wealth × (1 + Buffer%) × 2.5%',
    aboutNisab: 'About Nisab',
    whatIsNisab: 'What is Nisab?',
    nisabDesc1: 'The Nisab is the minimum threshold of wealth that makes Zakat obligatory. It is equivalent to 85 grams of pure gold (24K).',
    nisabDesc2: 'If your total wealth is below the Nisab, no Zakat is due. Zakat becomes obligatory after holding wealth above the Nisab for a full lunar year (Hawl).',
    nisabNote: 'This calculator does not track Hawl (one-year period). Please consult a scholar for full Zakat guidance.',

    // Hedge explanation levels
    hedgeConservative: 'Conservative buffer. Best for stable economic conditions.',
    hedgeBalanced: 'Balanced buffer. Recommended for most situations.',
    hedgeGenerous: 'Generous buffer. Ideal during high inflation or market volatility.',

    // Hawl tracking
    hawlTitle: 'Hawl Tracker',
    hawlSubtitle: 'One lunar year period (354 days)',
    hawlNotStarted: 'No Hawl Recorded',
    hawlNotStartedDesc: 'Once your wealth is above Nisab, tap "Start Hawl" to begin the one-year countdown.',
    startHawl: 'Start Hawl',
    hawlInProgress: 'Hawl In Progress',
    hawlComplete: 'Hawl Complete — Zakat is Due!',
    hawlCompleteDesc: 'Your wealth has remained above Nisab for a full lunar year. Zakat is now obligatory.',
    daysElapsed: 'days elapsed',
    daysRemaining: 'days remaining',
    startedOn: 'Started on',
    nisabAtStart: 'Nisab at start',
    wealthAtStart: 'Wealth at start',
    resetHawl: 'Reset Hawl',
    resetHawlTitle: 'Reset Hawl?',
    resetHawlConfirm: 'This will delete your Hawl record. Are you sure?',
    hawlBannerProgress: 'Hawl: {days} days left',
    hawlBannerDue: '⚠️ Hawl complete — Zakat is due!',
    viewHawl: 'View Hawl',

    // Hijri calendar
    todayHijri: 'Today (Hijri)',
    hijriDayOffset: 'Hijri Day Adjustment',
    hijriDayOffsetSub: 'Correct for local moon-sighting (±1-2 days)',
    hijriSectionHeader: 'Hijri Calendar',
  },

  ar: {
    // Header
    appSubtitle: 'ذكي',
    appTitle: 'حاسبة الزكاة',
    saved: '✓ تم الحفظ',
    clearData: 'مسح كل البيانات',
    settings: 'الإعدادات',

    // Status
    fetchingPrices: 'جارٍ تحديث أسعار السوق...',

    // Sections
    sectionEGP: 'الجنيه المصري (EGP)',
    sectionForeignCurrencies: 'العملات الأجنبية',
    sectionGoldAssets: 'أصول الذهب',
    add: 'إضافة',

    // Currency card
    egpCurrencyName: 'الجنيه المصري',
    rateLabel: '1 {CODE} =',
    egp: 'جنيه',
    grams: 'جرام',
    pricePerGram: 'السعر للجرام:',
    approx: '≈',
    addForeignCurrency: 'أضف عملة أجنبية',

    // Gold karats
    gold24kTitle: 'ذهب خالص (24 قيراط)',
    gold24kSub: 'أعلى قيمة',
    gold21kTitle: 'ذهب (21 قيراط)',
    gold21kSub: 'الأكثر شيوعاً في مصر',
    gold18kTitle: 'ذهب (18 قيراط)',
    gold18kSub: 'شائع في المجوهرات',

    // Calculate
    calculate: 'حساب الزكاة',
    recalculate: 'إعادة الحساب والحفظ',

    // Results
    yourResults: 'نتائجك',
    totalWealth: 'إجمالي الثروة',
    breakdownEGP: 'تفصيل بالجنيه المصري',
    cashEGP: '🇪🇬 نقد (جنيه)',
    foreignCurrencies: '💱 عملات أجنبية',
    goldAssets: '🥇 أصول ذهبية',
    total: 'الإجمالي',
    nisabThreshold: 'حد النصاب',
    noZakatDue: 'لا تجب الزكاة',
    noZakatText: 'إجمالي ثروتك {wealth} جنيه لم يبلغ النصاب البالغ {nisab} جنيه.',
    zakatFootnote: 'تجب الزكاة حين تبلغ الثروة النصاب.',
    obligatoryZakat: 'زكاة واجبة',
    obligatoryZakatSub: 'الحد الأدنى — 2.5% من ثروتك',
    precautionaryZakat: 'زكاة احتياطية',
    precautionaryZakatSub: '+{pct}% هامش احتياطي',
    exactObligation: 'مقدار الزكاة الواجبة عليك.',
    accountsFor: 'يأخذ بعين الاعتبار تقلبات الأسعار بهامش {pct}٪. اضبط في',
    adjustIn: 'الإعدادات',

    // Modal
    selectCurrency: 'اختر العملة',
    close: 'إغلاق',
    searchCurrencies: 'ابحث عن عملة...',
    noCurrenciesFound: 'لا توجد عملات مطابقة',

    // Alerts
    clearAllTitle: 'مسح كل البيانات؟',
    clearAllMessage: 'سيؤدي هذا إلى حذف جميع الأرصدة والعملات وإدخالات الذهب المحفوظة.',
    cancel: 'إلغاء',
    clear: 'مسح',
    nisabInfoTitle: 'ما هو النصاب؟',
    nisabInfoMessage: 'النصاب هو الحد الأدنى للثروة الذي تجب فيه الزكاة على المسلم، ويعادل قيمة 85 جراماً من الذهب.{nisab}',
    gotIt: 'حسناً',

    // Settings
    settingsTitle: 'الإعدادات',
    back: 'رجوع',
    language: 'اللغة',
    languageSectionHeader: 'Language / اللغة',
    hedgeBufferSection: 'هامش الزكاة الاحتياطي',
    precautionaryBuffer: 'المخصصات الاحتياطية',
    precautionaryBufferSub: 'تُطبَّق على ثروتك الإجمالية قبل حساب الزكاة',
    buffer: 'هامش',
    aboutHedge: 'عن الهامش الاحتياطي',
    whatIsHedge: 'ما هو الهامش الاحتياطي؟',
    hedgeDesc1: 'تتقلب أسعار الذهب والعملات باستمرار. تضيف الزكاة الاحتياطية نسبة هامش إلى إجمالي ثروتك قبل حساب الـ 2.5%.',
    hedgeDesc2: 'يضمن ذلك أن تدفع الزكاة على تقدير مرتفع قليلاً، مما يوفر الطمأنينة بأن التزامك الكامل مغطى حتى لو تغيرت الأسعار خلال العام.',
    formula: 'المعادلة',
    formulaValue: 'زكاة الهامش = إجمالي الثروة × (1 + نسبة الهامش%) × 2.5%',
    aboutNisab: 'عن النصاب',
    whatIsNisab: 'ما هو النصاب؟',
    nisabDesc1: 'النصاب هو الحد الأدنى للثروة الذي تجب فيه الزكاة، ويعادل 85 جراماً من الذهب الخالص (24 قيراط).',
    nisabDesc2: 'إذا كانت ثروتك دون النصاب فلا زكاة عليك. تجب الزكاة بعد بلوغ النصاب واستمراره حولاً هجرياً كاملاً.',
    nisabNote: 'لا تتتبع هذه الآلة الحاسبة الحول. يُرجى استشارة عالم للحصول على توجيه كامل بشأن الزكاة.',

    // Hedge explanation levels
    hedgeConservative: 'هامش محافظ. الأنسب للأوضاع الاقتصادية المستقرة.',
    hedgeBalanced: 'هامش متوازن. موصى به لمعظم الحالات.',
    hedgeGenerous: 'هامش سخي. مثالي في أوقات التضخم المرتفع أو تقلبات السوق.',

    // Hawl tracking
    hawlTitle: 'متابعة الحول',
    hawlSubtitle: 'حول هجري كامل (354 يوماً)',
    hawlNotStarted: 'لم يُسجَّل حول',
    hawlNotStartedDesc: 'بمجرد بلوغ ثروتك النصاب، اضغط “ابدأ الحول” لبدء العد التنازلي.',
    startHawl: 'ابدأ الحول',
    hawlInProgress: 'الحول جارٍ',
    hawlComplete: 'اكتمل الحول — الزكاة واجبة!',
    hawlCompleteDesc: 'ظلَّت ثروتك فوق النصاب حولاً هجرياً كاملاً. وجبت الزكاة.',
    daysElapsed: 'يوماً مضى',
    daysRemaining: 'يوماً متبقياً',
    startedOn: 'بدأ في',
    nisabAtStart: 'النصاب عند البدء',
    wealthAtStart: 'الثروة عند البدء',
    resetHawl: 'إعادة تعيين الحول',
    resetHawlTitle: 'إعادة تعيين الحول؟',
    resetHawlConfirm: 'سيؤدي ذلك إلى حذف سجل الحول. هل أنت متأكد؟',
    hawlBannerProgress: 'الحول: {days} يوماً متبقياً',
    hawlBannerDue: '⚠️ اكتمل الحول — الزكاة واجبة!',
    viewHawl: 'عرض الحول',

    // Hijri calendar
    todayHijri: 'اليوم (هجري)',
    hijriDayOffset: 'تعديل اليوم الهجري',
    hijriDayOffsetSub: 'تصحيح لرؤية الهلال (±1-2 يوم)',
    hijriSectionHeader: 'التقويم الهجري',
  },
};
