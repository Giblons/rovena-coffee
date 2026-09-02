import type { Metadata, Viewport } from 'next';
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';
import { PreferencesProvider } from '@/context/PreferencesContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { WhatsAppBar } from '@/components/layout/WhatsAppBar';
import { SITE } from '@/lib/site';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://rovena-coffee.example.com'),
  title: `${SITE.name} | Specialty Coffee Roasted in Bogor`,
  description:
    'ROVENA Coffee Roastery — specialty coffee roasted to order in Taman Yasmin, Bogor. Browse Indonesian origins, order via WhatsApp, and dial in your brew with our interactive guide.',
  keywords: [
    'Rovena',
    'kopi Bogor',
    'roastery Bogor',
    'specialty coffee Indonesia',
    'Taman Yasmin',
    'sangrai kopi',
    'WhatsApp order',
  ],
  authors: [{ name: SITE.name }],
  icons: {
    icon: '/favicon.png',
    apple: '/brand/logo-circular-white.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-canvas text-primary" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Source+Sans+3:ital,wght@0,300..700;1,300..700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=JSON.parse(localStorage.getItem('rovena-preferences')||'{}');if(p.theme==='dark')document.documentElement.classList.add('dark');if(p.locale==='id')document.documentElement.lang='id';}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-canvas text-primary font-sans selection:bg-bronze-200 selection:text-espresso-950">
        <PreferencesProvider>
          <ToastProvider>
            <CartProvider>
              <Header />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
              <CartDrawer />
              <WhatsAppBar />
            </CartProvider>
          </ToastProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
