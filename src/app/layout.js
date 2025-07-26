import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import SessionProviderWrapper from '@/components/shared/SessionProviderWrapper'
import Header from "@/components/Header";
import ToastProvider from '@/components/ToastProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {

  return {
    title: 'Bhuvan Environment',
    icons: '/bhuvanIcon.ico',
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <Header />
      <ToastProvider />
        <SessionProviderWrapper>
        {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
