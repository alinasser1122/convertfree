import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://freeconvertx.app'),
  title: {
    default: 'FreeConvertX - All formats, free forever',
    template: '%s | FreeConvertX'
  },
  description:
    'Free, private, browser-based image converter. Convert HEIC, PNG, JPG, WEBP, AVIF, PDF and more without uploading.',
  applicationName: 'FreeConvertX',
  authors: [{ name: 'FreeConvertX' }],
  keywords: [
    'image converter',
    'HEIC to JPG',
    'PNG to WEBP',
    'image to PDF',
    'free image converter',
    'محول صور',
    'تحويل HEIC',
    'تحويل الصور إلى PDF'
  ],
  openGraph: {
    type: 'website',
    title: 'FreeConvertX - All formats, free forever',
    description:
      'Convert HEIC, PNG, JPG, WEBP, AVIF, PDF in your browser. Private, fast, free.',
    siteName: 'FreeConvertX'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreeConvertX',
    description:
      'Convert HEIC, PNG, JPG, WEBP, AVIF, PDF in your browser. Private, fast, free.'
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#070c18' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
