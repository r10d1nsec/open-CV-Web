import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans-loader',
  weight: ['400', '500', '600', '700'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono-loader',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Folio — Portfolio · Digital Card · Booking',
  description:
    'Folio te permite publicar un portfolio profesional, una tarjeta digital con QR/NFC y un sistema de booking sincronizado con tu calendario — en minutos.',
  metadataBase: new URL('http://localhost:3000'),
};

const themeBootstrap = `
(function() {
  try {
    var saved = localStorage.getItem('folio-theme');
    var system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    var theme = saved === 'light' || saved === 'dark' ? saved : system;
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <style>{`
          :root {
            --font-sans: ${sans.style.fontFamily}, 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
            --font-mono: ${mono.style.fontFamily}, 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
          }
        `}</style>
      </head>
      <body className={`${sans.variable} ${mono.variable} fol`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
