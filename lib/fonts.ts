import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";

// All three are loaded as variable fonts. Weight (and where supported, optical
// sizing) is applied via CSS using font-weight + font-optical-sizing: auto.
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
