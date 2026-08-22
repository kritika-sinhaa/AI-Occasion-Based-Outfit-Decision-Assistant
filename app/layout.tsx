import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StyleEase — AI Occasion-Based Outfit Decision Assistant",
  description:
    "Tell us where you're going, and we'll help you decide what to wear in minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <NavBar />
        <main className="pb-24 sm:pb-16">{children}</main>
      </body>
    </html>
  );
}
