import type { Metadata } from "next";
import { Inter, Cinzel, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Sans-serif variable font layer
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

// Luxury Editorial/Display font layer (Exported so other components can import it directly)
export const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
});

// Premium Terminal Monospace font layer (Fixes Serif Fallback)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "V&K Prism Console",
  description: "Enterprise Operations & Infrastructure Diagnostic Terminal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className={`${inter.variable} ${cinzel.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[#0A0A0C] text-[#E4E4E7] font-mono antialiased selection:bg-[#C5A880]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}