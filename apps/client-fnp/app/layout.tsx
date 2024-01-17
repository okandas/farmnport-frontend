import { Inter as FontSans } from "next/font/google"
import localFont from "next/font/local"

// @ts-expect-error package creators need to fix this.
import { GoogleTagManager } from '@next/third-parties/google'

import { QueryProvider } from "@/components/providers/QueryProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { Toaster } from "@/components/ui/sonner"

import { cn } from "@/lib/utilities"
import { auth } from "@/auth"


import "@/styles/globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
})

export const metadata = {
  title: "Farmnport - Getting you to market",
  description: "Buyers, Exporters, Farmers, Importers in the livestock, cattle, horticulture, poultry, aquaculture, grain, seed, dairy and plantation Agriculture Agri Business.",
}
interface RootLayoutProps {
  children: React.ReactNode
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth()

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
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
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
