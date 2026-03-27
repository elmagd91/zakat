# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zakat Calculator — an Ionic/Angular mobile app (Capacitor for Android) that calculates Islamic Zakat obligations. It fetches live gold prices and exchange rates, converts all assets to EGP (Egyptian Pounds), checks against the Nisab threshold (85g of 24k gold), and computes obligatory + hedged Zakat amounts. Supports Arabic/English with RTL layout.

## Commands

```bash
npm start          # Dev server (ng serve)
npm run build      # Production build → www/
npm run lint       # ESLint (Angular plugin)
npm test           # Karma/Jasmine unit tests
npx cap sync       # Sync web build to Android project
npx cap open android  # Open in Android Studio
```

## Architecture

**Angular 20 standalone components** with Ionic 8 UI, no NgModules. All components use `standalone: true` and import Ionic components individually.

### Routing (lazy-loaded)

| Route       | Component      | Purpose                          |
|-------------|----------------|----------------------------------|
| `/home`     | `HomePage`     | Main calculator with asset inputs |
| `/settings` | `SettingsPage` | Hedge % slider, language toggle  |
| `/hawl`     | `HawlPage`     | Hawl (lunar year) progress ring  |

### Core Services (`src/app/core/services/`)

- **PriceService** — fetches exchange rates (open.er-api.com) and gold prices (goldapi.io) via `forkJoin`. Falls back to hardcoded rates on failure. Exposes `prices$`, `loading$`, `error$` as BehaviorSubjects.
- **ZakatCalculatorService** — pure calculation engine. Converts currencies to EGP, sums gold wealth, computes Nisab, obligatory Zakat (2.5%), and hedged Zakat.
- **HawlService** — tracks the 354-day Islamic lunar year period. Persists start date to localStorage, computes elapsed/remaining days and progress fraction.
- **HijriService** — Gregorian-to-Hijri conversion using the Kuwaiti algorithm. Supports a day offset (-2 to +2) for moon-sighting correction.
- **SettingsService** — in-memory BehaviorSubjects for hedge percentage (1-10%) and Hijri day offset.
- **StorageService** — localStorage wrapper for persisting user input (balances, currencies, gold amounts, prices).
- **TranslationService** — custom i18n using a typed translations map (`src/app/core/i18n/translations.ts`). Sets `lang`/`dir` attributes on `<html>` for RTL support. Uses `t(key)` for simple lookups and `tr(key, params)` for parameterized strings.

### Domain Model (`src/app/core/models/zakat.models.ts`)

Key types: `MarketPrices`, `ZakatResult`, `GoldAssets`, `CurrencyEntry`, `HawlRecord`, `HawlState`, `HijriDate`. All exchange rates are stored as "EGP per 1 unit of foreign currency" (e.g., USD = 52.4).

### Key Design Decisions

- **EGP as base currency**: All wealth is converted to EGP before Zakat calculation. Exchange rates map `currency_code -> EGP per 1 unit`.
- **Gold price ranges**: International spot price (min) vs. Egyptian local market price with ~3% premium (max). Users can quick-fill either value.
- **Hedge Zakat**: Optional additional calculation applying a configurable percentage (1-10%) on top of total wealth to account for potential undervaluation.
- **Nisab threshold**: 85 grams of 24k gold at current prices.
- **No backend**: All data stays in localStorage. API calls are read-only (exchange rates + gold prices).

## Conventions

- Component class suffix: `Page` or `Component` (enforced by ESLint)
- Component selector prefix: `app-` (kebab-case)
- Styling: SCSS with Ionic CSS variables (`src/theme/variables.scss`)
- Build output: `www/` (not `dist/`)
- TypeScript strict mode enabled
- Ionic mode forced to `ios` in `app.config.ts`
