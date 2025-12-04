import './globals.css';
import { Cinzel, Noto_Serif_TC } from 'next/font/google';

// Load the fonts from your reference
const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' });
const noto = Noto_Serif_TC({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-noto' });

export const metadata = {
  title: 'Lumina Tarot',
  description: 'AI Fortune Teller',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full w-full">
      <body className={`${cinzel.variable} ${noto.variable} h-full w-full bg-[#0a0a12] overflow-hidden m-0 p-0`}>
        {children}
      </body>
    </html>
  );
}