import { Open_Sans } from "next/font/google"
import localFont from "next/font/local"

import { GoogleTagManager } from '@next/third-parties/google'
import { Analytics } from "@vercel/analytics/react"
import Script from "next/script"

import { QueryProvider } from "@/components/providers/QueryProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { Toaster } from "@/components/ui/sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import { cn } from "@/lib/utilities"
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider"
import { CartProvider } from "@/contexts/cart-context"
import { CartDrawer } from "@/components/cart/cart-drawer"


import "@/styles/globals.css"

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-opensans',
})

const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
  preload: true
})

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://farmnport.com'),
  title: "Farmnport - Getting you to market",
  description: "Buyers, Exporters, Farmers, Importers in the livestock, cattle, horticulture, poultry, aquaculture, grain, seed, dairy and plantation Agriculture Agri Business.",
  openGraph: {
    title: 'Farmnport - Buy & Sell Farm Produce Directly in Zimbabwe',
    description: 'Connect farmers and buyers across Zimbabwe. Browse produce prices, find buyers and sellers, and access agrochemical guides.',
    siteName: 'farmnport',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Farmnport - Buy & Sell Farm Produce Directly in Zimbabwe',
    description: 'Connect farmers and buyers across Zimbabwe. Browse produce prices, find buyers and sellers, and access agrochemical guides.',
  },
  other: {
    'google-adsense-account': 'ca-pub-9685248262342396'
  }
}
interface RootLayoutProps {
  children: React.ReactNode
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID as string
const NEXT_ENV = process.env.NEXT_ENV as string

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background antialiased font-sans",
            openSans.variable,
            fontHeading.variable
          )}
        >
          <AuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <CartProvider>
              <NuqsAdapter>
                {children}
                <CartDrawer />
                <Script
                  id="facebook-sdk-init"
                  strategy="lazyOnload"
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.fbAsyncInit = function() {
                        FB.init({
                          appId      : '512373632579287',
                          cookie     : true,
                          xfbml      : true,
                          version    : 'v22.0'
                        });
                        FB.AppEvents.logPageView();
                      };

                      (function(d, s, id){
                        var js, fjs = d.getElementsByTagName(s)[0];
                        if (d.getElementById(id)) {return;}
                        js = d.createElement(s); js.id = id;
                        js.src = "https://connect.facebook.net/en_US/sdk.js";
                        fjs.parentNode.insertBefore(js, fjs);
                      }(document, 'script', 'facebook-jssdk'));
                    `,
                  }}
                />
                <GoogleTagManager gtmId={GTM_ID} />
                <Toaster />
                {NEXT_ENV !== 'production' && <SpeedInsights />}
                {NEXT_ENV !== 'production' && <Analytics />}
              </NuqsAdapter>
              </CartProvider>
            </QueryProvider>
          </ThemeProvider>
          </AuthSessionProvider>
        </body>
      </html>
    </>
  )
}
