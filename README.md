# ☕ Rovena Coffee — Specialty Coffee Roastery

A fully functional specialty coffee roastery e-commerce web application built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

## Features

- 🫘 **Rich Coffee Specifications** — Origin, altitude, varietals, processing method, SCA cupping score, tasting notes, flavor radar
- 🛒 **Multi-Channel Ordering** — Web checkout, WhatsApp direct order sync, Stripe-ready architecture
- 🔄 **Subscription System** — Weekly, Bi-Weekly, Monthly recurring orders with automatic discounts
- 📊 **Admin Dashboard** — Order management, inventory tracking, roast batch scheduling
- 🎨 **Tokenized Design System** — Centralized CSS variables & Tailwind tokens for instant re-skinning
- ♿ **Accessible** — WCAG AA compliant, semantic HTML, responsive across all viewports
- ☕ **Brew Guide Calculator** — Interactive brewing instructions with water-to-coffee ratios

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/Giblons/rovena-coffee.git
cd rovena-coffee

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with featured coffees |
| `/catalog` | Full catalog with search, filter & sort |
| `/coffee/[slug]` | Product detail with specs & variant selector |
| `/checkout` | Multi-channel checkout |
| `/about` | Roastery story & philosophy |
| `/guide` | Brewing guides |
| `/admin` | Admin order & inventory dashboard |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Custom Properties
- **Testing**: Vitest + React Testing Library
- **Icons**: Lucide React

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run test       # Run test suite
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint
```

## Customizing the Design

All visual styling is centralized in:
- `src/styles/tokens.css` — CSS custom properties (colors, typography, spacing)
- `tailwind.config.ts` — Tailwind theme tokens

Update these files to apply your brand identity — no business logic changes needed.

## License

Private — All rights reserved.
