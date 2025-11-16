import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    template: '%s | ResumeRank AI',
    default: 'ResumeRank AI - AI-Powered Resume Screening & Candidate Ranking',
  },
  description:
    'Streamline your recruitment process with AI-powered resume screening, intelligent candidate ranking, and automated job matching. Save time and find the best talent faster.',
  keywords: [
    'resume screening',
    'AI recruitment',
    'candidate ranking',
    'ATS system',
    'applicant tracking',
    'resume parser',
    'job matching',
    'HR automation',
    'talent acquisition',
    'recruitment software',
  ],
  authors: [
    {
      name: 'FenexTech',
      url: 'https://fenextech.com',
    },
  ],
  creator: 'FenexTech',
  publisher: 'FenexTech',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'ResumeRank AI - AI-Powered Resume Screening & Candidate Ranking',
    description:
      'Streamline your recruitment process with AI-powered resume screening, intelligent candidate ranking, and automated job matching.',
    siteName: 'ResumeRank AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ResumeRank AI - AI-Powered Recruitment Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeRank AI - AI-Powered Resume Screening',
    description:
      'Streamline your recruitment process with AI-powered resume screening and intelligent candidate ranking.',
    images: ['/og-image.png'],
    creator: '@resumerankai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
