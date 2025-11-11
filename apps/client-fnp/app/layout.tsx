import { Open_Sans } from "next/font/google"
import localFont from "next/font/local"

import { GoogleTagManager } from '@next/third-parties/google'
import { Analytics } from "@vercel/analytics/react"

import { QueryProvider } from "@/components/providers/QueryProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { Toaster } from "@/components/ui/sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { cn } from "@/lib/utilities"
import { auth } from "@/auth"


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
  title: "Farmnport - Getting you to market",
  description: "Buyers, Exporters, Farmers, Importers in the livestock, cattle, horticulture, poultry, aquaculture, grain, seed, dairy and plantation Agriculture Agri Business.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://farmnport.com",
    siteName: "Farmnport",
    title: "Farmnport - Getting you to market",
    description: "Buyers, Exporters, Farmers, Importers in the livestock, cattle, horticulture, poultry, aquaculture, grain, seed, dairy and plantation Agriculture Agri Business.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Farmnport - Getting you to market",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Farmnport - Getting you to market",
    description: "Buyers, Exporters, Farmers, Importers in the livestock, cattle, horticulture, poultry, aquaculture, grain, seed, dairy and plantation Agriculture Agri Business.",
    images: ["/og-image.png"],
  },
  other: {
    "facebook-domain-verification": "3stp1ph9qmao37d0k25dqq002nmfd8",
  },
}
interface RootLayoutProps {
  children: React.ReactNode
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID as string
const NEXT_ENV = process.env.NEXT_ENV as string

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth()

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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <GoogleTagManager gtmId={GTM_ID} />
              <Toaster />
              {NEXT_ENV !== 'production' && <SpeedInsights />}
              {NEXT_ENV !== 'production' && <Analytics />}
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
