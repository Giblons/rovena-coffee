export const en = {
  'nav.catalog': 'Coffee Catalog',
  'nav.about': 'About Rovena',
  'nav.subscriptions': 'Coffee Subscriptions',
  'nav.batches': 'Roasting Schedule',
  'nav.brewGuides': 'Brew Guides',
  'nav.impact': 'Our Story',
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
    'We batch roast every Monday & Thursday. Orders ship within 24 hours after cooling and QC.',
  'footer.tradeTitle': 'Indonesian & Origin Sourcing',
  'footer.tradeBody':
    'From Bogor to Gayo, Toraja, and beyond — we work directly with farmers and cooperatives we know by name.',
  'footer.scaTitle': 'Cup Quality You Can Taste',
  'footer.scaBody':
    'Every lot is cupped and profiled before it reaches your cup — scored, dated, and traceable.',
  'footer.tagline':
    'Specialty coffee roasted in Bogor. Small batches, honest sourcing, and a cup you can trust every morning.',
  'footer.addressLabel': 'Roastery',
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
  'footer.location': 'Bogor, West Java, Indonesia',
  'footer.freshRoast': 'Fresh Roast',
  'footer.directTrade': 'Direct Sourcing',
  'footer.scaMember': 'Specialty Coffee',

  'cta.whatsappOrder': 'Order via WhatsApp',
  'cta.whatsappShort': 'WhatsApp',
  'whatsapp.prefill': 'Halo Rovena, saya ingin pesan kopi.',

  'home.hero.eyebrow': 'Bogor Specialty Roastery',
  'home.hero.title': 'Roasted with care in Yasmin, Bogor.',
  'home.hero.subtitle':
    'ROVENA is a small-batch roastery in Taman Yasmin Sektor 7. We source Indonesian origins and select international micro-lots, then roast to order so your coffee arrives fresh — not from a warehouse shelf.',
  'home.hero.ctaCatalog': 'Browse Our Coffees',
  'home.hero.ctaGuide': 'Brew Guide & Calculator',
  'home.batch.title': 'Next roast: Monday & Thursday',
  'home.batch.body': 'Orders before 23:59 WIB join the next batch. Freshly roasted, rested, then shipped.',
  'home.featured.title': 'Current Selection',
  'home.featured.subtitle': 'Seasonal lots and house favorites, roasted in small batches at our Bogor roastery.',
  'home.story.title': 'From our roastery in Bogor',
  'home.story.body':
    'We started ROVENA because good coffee should feel personal — not corporate. Visit us in Taman Yasmin, message us on WhatsApp, or browse the catalog. Every bag is roasted here in Bogor.',
  'home.story.cta': 'Our Story',
  'home.guide.title': 'Dial in your brew',
  'home.guide.body':
    'Use our interactive brew calculator for V60, AeroPress, French press, and more — ratios, timing, and step-by-step guidance tuned to each coffee.',
  'home.testimonial.title': 'What customers say',

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
    'ROVENA Coffee Roastery is a specialty roastery in Bogor, West Java — founded by Muhammad Rizky Permana. We roast in small batches at Taman Yasmin Sektor 7, sourcing Indonesian coffees alongside select international micro-lots. Every bag is roasted to order, not pulled from a warehouse shelf.',

  'admin.title': 'Rovena Coffee Roastery — Operations Command Center',
  'pay.brand': 'ROVENA PAY',
} as const;

export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey, string>;
