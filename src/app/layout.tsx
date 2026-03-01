import type { Metadata } from 'next';
import { Bebas_Neue } from 'next/font/google';
import './globals.css';
import { ToasterProvider } from '@/components/Toaster';

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Drinking DJ',
  description: 'Play music and trigger sound effects together in drinking meetings',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={bebas.variable}>
      <body className="min-h-screen font-sans">
        <ToasterProvider>{children}</ToasterProvider>
      </body>
    </html>
  );
}
