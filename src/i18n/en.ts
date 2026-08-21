export const en = {
  'nav.catalog': 'Coffee Catalog',
  'nav.subscriptions': 'Coffee Subscriptions',
  'nav.batches': 'Roasting Schedule',
  'nav.brewGuides': 'Brew Guides',
  'nav.impact': 'Direct Trade Impact',
  'nav.admin': 'Roastery Admin',
  'nav.menu': 'Roastery Menu',
  'nav.openCart': 'Open Shopping Cart ({count} items)',
  'nav.openMenu': 'Open mobile menu',
  'nav.themeLight': 'Switch to dark mode',
  'nav.themeDark': 'Switch to light mode',
  'nav.language': 'Language',
  'nav.currency': 'Currency',

  'footer.freshnessTitle': 'Roast-to-Order Freshness',
  'footer.freshnessBody':
    'We batch roast every Monday & Thursday morning. Orders dispatch within 24 hours of cooling and QC testing.',
  'footer.tradeTitle': '100% Direct-Trade Verified',
  'footer.tradeBody':
    'We pay up to 145% above Fair Trade minimums directly to micro-lot producers and farming cooperatives.',
  'footer.scaTitle': 'SCA Certified 80+ Scores',
  'footer.scaBody':
    'Every single-origin lot is cupped, scored, and profiled under Specialty Coffee Association standards.',
  'footer.tagline':
    'Dedicated to the relentless pursuit of sweetness, terroir clarity, and sustainable farmer partnerships across high-altitude coffee origins.',
  'footer.addressLabel': 'Micro-Roastery & Lab',
  'footer.specialty': 'Specialty Coffee',
  'footer.singleOrigin': 'Single-Origin Micro-lots',
  'footer.blends': 'Signature Espresso Blends',
  'footer.anaerobics': 'Experimental Anaerobics',
  'footer.presidential': 'Presidential Lots (SCA 90+)',
  'footer.craft': 'Craft & Knowledge',
  'footer.brewGuide': 'Interactive Brew Guide',
  'footer.transparency': 'Direct-Trade Transparency',
  'footer.schedule': 'Roasting Schedule',
  'footer.admin': 'Operations Admin',
  'footer.dispatch': "The Roaster's Dispatch",
  'footer.dispatchBody':
    'Receive cupping notes on new crop arrivals and exclusive micro-lot pre-releases.',
  'footer.emailPlaceholder': 'Your email address',
  'footer.welcome': 'Welcome to the Roastery Circle!',
  'footer.rights': 'All rights reserved.',
  'footer.freshRoast': 'Fresh Roast Certified',
  'footer.directTrade': 'Direct Trade',
  'footer.scaMember': 'Specialty Coffee Association Member',

  'cart.title': 'Your Fresh Coffee Cart',
  'cart.item': 'item',
  'cart.items': 'items',
  'cart.close': 'Close cart drawer',
  'cart.addForShipping': 'Add {amount} for Free Shipping',
  'cart.freeShipping': 'You unlocked FREE Roastery Shipping!',
  'cart.empty': 'Your cart is empty',
  'cart.browse': 'Browse the Catalog',
  'cart.subtotal': 'Subtotal',
  'cart.shipping': 'Shipping',
  'cart.tax': 'Tax',
  'cart.total': 'Total',
  'cart.checkout': 'Proceed to Checkout',
  'cart.whatsapp': 'Order via WhatsApp',
  'cart.clear': 'Clear cart',

  'cta.addToBag': 'Add to Bag',
  'cta.from': 'From',
  'search.placeholder': 'Search coffees…',
  'catalog.filters': 'Filters',
  'catalog.sort': 'Sort',

  'about.intro':
    'Rovena Coffee Roastery was founded on an uncompromising conviction: specialty coffee is not an industrial commodity. It is a seasonal agricultural art shaped by volcanic soil, high-altitude microclimates, multi-generational farming expertise, and precision roasting.',

  'admin.title': 'Rovena Coffee Roastery — Operations Command Center',
  'pay.brand': 'ROVENA PAY',
} as const;

export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey, string>;
