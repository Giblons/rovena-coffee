# 4-Tier Automated Test Infrastructure & Verification Specification

**Project**: Artisan Specialty Coffee Roastery Storefront  
**Test Framework**: Vitest + React Testing Library + JSDOM  
**Target Coverage**: 100% Core Business Logic, Pricing Formulas, Multi-Criteria Filtering, Cart State Reducers, Order APIs, and End-to-End Customer Workflows.

---

## 1. Overview & Architectural Philosophy

The testing infrastructure follows a rigorous **4-Tier Progressive Verification Hierarchy** designed to validate deterministic mathematical accuracy, defensive boundary resilience, multi-component state management, and real-world multi-channel checkout lifecycles.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Tier 4: E2E User Journeys                       │
│      (Catalog Filter ➔ Variant Picker ➔ Brew Guide ➔ Cart ➔ Checkout) │
│      (Bi-Weekly Subscription ➔ WhatsApp Sync ➔ Admin Queue Tracking)   │
├────────────────────────────────────────────────────────────────────────┤
│                 Tier 3: Module & Integration Tests                     │
│      - Cart Context composite keying, variant updates, promo codes    │
│      - Order creation REST API, payment statuses, inventory locks     │
├────────────────────────────────────────────────────────────────────────┤
│                 Tier 2: Boundary & Edge Case Tests                     │
│      - $50.00 free shipping exact threshold, $0 subtotal, negative dose│
│      - Zero dose brew yields, non-matching search, special characters  │
├────────────────────────────────────────────────────────────────────────┤
│                 Tier 1: Pure Unit & Calculation Tests                  │
│      - Weight tiers (200g, 250g, 500g, 1kg) & multipliers              │
│      - 10% subscription discounts, promo code engines                  │
│      - V60, AeroPress, French Press, Espresso, Cold Brew ratios & bloom│
│      - wa.me URL generator & message markdown formatting               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Test Suite File Structure & Coverage Map

```text
tests/
├── setup.ts                              # JSDOM global setup & jest-dom matchers
├── unit/
│   ├── pricing.test.ts                   # Tier 1 & 2: Weight multipliers, subscriptions, promo codes, boundaries
│   ├── catalog-filter.test.ts            # Tier 1 & 2: Multi-criteria faceted search, sorting, edge cases
│   ├── brew-calculator.test.ts           # Tier 1 & 2: Coffee-to-water ratios, water yield, bloom, durations
│   └── whatsapp-builder.test.ts          # Tier 1 & 2: wa.me link generation, percent-encoding, subscriptions tag
├── integration/
│   ├── cart-context.test.tsx             # Tier 3: Composite keys, quantity steppers, variant swap, discounts
│   └── api-orders.test.ts                # Tier 3: Web vs WhatsApp orders, ORD-YYYY-XXXX ID, stock reservations
└── e2e/
    └── user-journeys.test.ts             # Tier 4: Scenario 1 (Web Checkout) & Scenario 2 (WhatsApp Subscription)
```

---

## 3. Tier-by-Tier Specification & Test Matrix

### Tier 1: Pure Calculations & Formatting (Unit)

| Test Suite | File | Core Behaviors Verified |
|---|---|---|
| **Pricing Engine** | `tests/unit/pricing.test.ts` | • 4 Weight tiers: 200g (`0.85x`), 250g (`1.00x`), 500g (`1.85x-1.88x`), 1kg (`3.40x-3.50x`)<br>• 10% recurring subscription discount on individual items and mixed baskets<br>• Promo codes: `ROASTMASTER10` (10%), `FIRSTSIP` (15% min $30), `BARISTA20` ($20 min $75), `FREESHIP` ($0 shipping) |
| **Catalog Filter** | `tests/unit/catalog-filter.test.ts` | • Filter by Roast Level (`Light`, `Medium-Light`, `Medium`, `Medium-Dark`, `Dark`)<br>• Filter by Processing Method (`Washed`, `Natural`, `Anaerobic`, `Honey`, `Thermal Shock`, `Wet Hulled`)<br>• Filter by Origin Country & SCA Cupping Score (80 to 90+)<br>• Search matching across name, origin, region, varietal, tasting notes<br>• Sorting: `sca_desc`, `price_asc`, `price_desc`, `newest`, `featured`, `name_asc` |
| **Brew Calculator** | `tests/unit/brew-calculator.test.ts` | • Standard ratios: V60 (`1:16`), AeroPress (`1:13`), French Press (`1:15`), Espresso (`1:2`), Cold Brew (`1:8`)<br>• Bean water absorption (2x coffee dose) & net beverage yield<br>• Bloom water computation (`3x dose`) & multi-phase step timers |
| **WhatsApp Builder** | `tests/unit/whatsapp-builder.test.ts` | • `https://wa.me/{phone}?text={encoded}` URL generation<br>• Formatted markdown receipt with Order ID, customer, itemized variant lines, and totals |

---

### Tier 2: Defensive Boundary & Extreme Stress (Unit)

| Scenario | File | Boundary Condition Tested |
|---|---|---|
| **$50 Free Shipping Boundary** | `pricing.test.ts` | • `$49.99` ➔ `$5.00` standard shipping fee, `$0.01` needed for free shipping<br>• `$50.00` ➔ `$0.00` shipping fee, `$0.00` needed<br>• `$50.01` ➔ `$0.00` shipping fee |
| **Zero & Empty States** | `pricing.test.ts`, `catalog-filter.test.ts` | • Empty cart ➔ `$0.00` totals with `$50.00` needed for free shipping<br>• Empty or whitespace search query ➔ returns all 8 products<br>• Non-matching query ➔ returns empty array `[]` |
| **Zero & Negative Doses** | `brew-calculator.test.ts` | • 0g dose ➔ 0g water, 0ml yield, 0g bloom<br>• Negative dose ➔ clamped to 0 without throwing NaN |
| **Special Character Escaping** | `whatsapp-builder.test.ts` | • Accented characters (e.g. `François & Renée O’Connor #1`), quotes, emojis, and phone sanitization |

---

### Tier 3: State Management & API Integration

| Module | File | Integration Behaviors Verified |
|---|---|---|
| **Cart Context Engine** | `cart-context.test.tsx` | • Composite Keying: `${slug}-${weight}-${grind}-${frequency}` prevents erroneous merging of differing grind/weight variants<br>• Merge quantity on identical additions<br>• Auto-removal when quantity decremented to 0<br>• Promo code lifecycle (apply, recalculate, remove)<br>• Drawer toggle and clearCart state cleanup |
| **Order Creation API** | `api-orders.test.ts` | • Web orders created with `paymentStatus: 'paid'` and `status: 'Pending'`<br>• WhatsApp orders created with `paymentStatus: 'pending_manual'` and `source: 'WhatsApp Direct Order'`<br>• Unique sequential ID format `ORD-YYYY-XXXX`<br>• Real-time bean inventory stock reservation<br>• Full order lifecycle mutations (`Pending` ➔ `Roasting` ➔ `Dispatched` ➔ `Delivered`) |

---

### Tier 4: End-to-End Real-World Simulation (E2E)

| Scenario | File | Complete Workflow Verified |
|---|---|---|
| **Scenario 1: Simulated Web Checkout** | `user-journeys.test.ts` | 1. Customer searches catalog for Light Roast Washed Ethiopian micro-lot.<br>2. Selects 500g package with V60 grind.<br>3. Computes extraction metrics on interactive Brew Guide (20g dose ➔ 320g water, 60g bloom).<br>4. Adds to persistent cart drawer and applies `ROASTMASTER10` promo code.<br>5. Fills shipping details & simulated card `4242 4242 4242 4242`.<br>6. Submits order and receives Order Confirmation receipt `#ORD-2026-XXXX` with live roast batch tracker. |
| **Scenario 2: WhatsApp Subscription Sync** | `user-journeys.test.ts` | 1. Customer selects Costa Rica Tarrazú Mozart (Honey).<br>2. Configures Bi-Weekly recurring subscription with 10% subscriber discount.<br>3. Selects WhatsApp Direct Ordering.<br>4. Server synchronizes order into database with `channel: 'whatsapp'` and `paymentStatus: 'pending_manual'`.<br>5. Generates valid `https://wa.me/` URL with formatted subscription tag `🔄 (Bi-Weekly Subscription)`.<br>6. Admin Operations Dashboard verifies order appears in pending fulfillment queue. |

---

## 4. Execution Commands

```bash
# Run all 4 tiers of tests
npm test

# Run Vitest in standalone execution mode
npx vitest run

# Run specific tier or file
npx vitest run tests/unit/pricing.test.ts
npx vitest run tests/unit/catalog-filter.test.ts
npx vitest run tests/unit/brew-calculator.test.ts
npx vitest run tests/unit/whatsapp-builder.test.ts
npx vitest run tests/integration/cart-context.test.tsx
npx vitest run tests/integration/api-orders.test.ts
npx vitest run tests/e2e/user-journeys.test.ts

# Run with coverage report
npx vitest run --coverage
```
