export const SITE = {
  name: 'Rovena Coffee Roastery',
  shortName: 'Rovena',
  tagline: 'Coffee Roastery',
  address: 'Taman Yasmin Sektor 7, Jln. Bambu Apus VI no. 9, Bogor',
  addressLines: [
    'Taman Yasmin Sektor 7',
    'Jln. Bambu Apus VI no. 9',
    'Bogor',
  ] as const,
  /** Digits only, country code included (no +) */
  phoneE164: '6285287847076',
  phoneDisplay: '+62 852-8784-7076',
  /** Display conversion only — catalog prices remain USD internally */
  usdToIdr: 16000,
} as const;

export type CurrencyCode = 'USD' | 'IDR';
export type LocaleCode = 'en' | 'id';
export type ThemeMode = 'light' | 'dark';
