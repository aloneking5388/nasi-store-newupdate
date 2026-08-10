import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProviderWrapper from "@/components/Wrappers/ProviderWrapper";
import { CurrencyProvider } from "@/components/Wrappers/CurrencyProvider";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PWARegister from "@/components/Wrappers/PWARegister";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { headers } from "next/headers";
import { resolveCurrencyFromCountry } from "@/utils/formatPrice";
import { getRatesFromUGX } from "@/lib/currencyRates";
import { APP_THEME_COLOR } from "@nasi/theme";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

const ConditionalGoogleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) =>
  googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  ) : (
    <>{children}</>
  );

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nasi Store",
  description: "nasi store is a best ecommerce with earning platform",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/appicon-maskable-light.png",
    shortcut: "/appicon-maskable-light.png",
    apple: "/appicon-maskable-light.png",
  },
  applicationName: "Nasi Store",
};

export const viewport: Viewport = {
  themeColor: APP_THEME_COLOR,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const countryCode =
    headerList.get("x-vercel-ip-country") ||
    headerList.get("cf-ipcountry") ||
    headerList.get("x-country-code") ||
    "";
  const currencyCode = resolveCurrencyFromCountry(countryCode);
  const ratesFromUGX = await getRatesFromUGX();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConditionalGoogleProvider>
          <CurrencyProvider
            currencyCode={currencyCode}
            ratesFromUGX={ratesFromUGX}
          >
            <ProviderWrapper>
              {children}
              <Toaster position="top-center" reverseOrder={false} />
              <SpeedInsights />
              <PWARegister />
            </ProviderWrapper>
          </CurrencyProvider>
        </ConditionalGoogleProvider>
      </body>
    </html>
  );
}
