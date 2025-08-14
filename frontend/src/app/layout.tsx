import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'greensteel - ESG Management Platform',
  description:
    'Comprehensive ESG management platform for LCA, CBAM, and sustainability reporting',
  keywords: 'ESG, LCA, CBAM, sustainability, carbon footprint, green steel',
  authors: [{ name: 'greensteel Team' }],
  creator: 'greensteel',
  publisher: 'greensteel',
  robots: 'index, follow',
  openGraph: {
    title: 'greensteel - ESG Management Platform',
    description:
      'Comprehensive ESG management platform for LCA, CBAM, and sustainability reporting',
    url: 'https://greensteel.site',
    siteName: 'greensteel',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'greensteel - ESG Management Platform',
    description:
      'Comprehensive ESG management platform for LCA, CBAM, and sustainability reporting',
  },
  other: {
    'csrf-token': '{{csrf_token}}',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'greensteel',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-2GFHCRYLT8"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-2GFHCRYLT8');
            `,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
