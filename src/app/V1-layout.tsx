import type { Metadata } from "next";
import { Inter, Cinzel, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Sans-serif variable font layer
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

// Luxury Editorial/Display font layer
export const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
});

// Premium Terminal Monospace font layer
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

// -----------------------------------------------------------
// 📍 ADDED HERE: Favicon added to Next.js metadata object
// -----------------------------------------------------------
export const metadata: Metadata = {
  title: "V&K Prism Console",
  description: "Enterprise Operations & Infrastructure Diagnostic Terminal",
  icons: {
    icon: "/knight_only.png",
  },
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