import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono, Outfit } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-logo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chrisamattam.com"),
  title: {
    default: "Chris Mattam — Product Manager",
    template: "%s · Chris Mattam",
  },
  description: "Product manager building AI-native fintech products. Based in Bengaluru.",
  keywords: ["Chris Mattam", "Product Manager", "fintech", "AI", "Bengaluru", "Butter Money", "BITS Pilani"],
  authors: [{ name: "Chris Mattam", url: "https://chrisamattam.com" }],
  creator: "Chris Mattam",
  openGraph: {
    title: "Chris Mattam",
    description: "Product manager building AI-native fintech products.",
    url: "https://chrisamattam.com",
    siteName: "Chris Mattam",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Chris Mattam",
    description: "Product manager building AI-native fintech products.",
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${hanken.variable} ${jetbrains.variable} ${outfit.variable}`}
    >
      <head />
      <body suppressHydrationWarning>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>

        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
