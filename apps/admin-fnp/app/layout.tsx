import { Inter as FontSans } from "next/font/google"
import Script from "next/script"

import { cn } from "@/lib/utilities"
import QueryProvider from "@/components/providers/QueryProvider"

import "@/styles/globals.css"

import React from "react"

var GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "farmnport - Welcome Administrator",
  description: "Manage Farmnport",
}
interface RootLayoutProps {
  children: React.ReactNode
  modal: React.ReactNode
}

export default function RootLayout({ children, modal }: RootLayoutProps) {
  return (
    <html lang="en">
      <Script id="google-tagmanager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer', ${GTM_ID});
        `}
      </Script>

      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display: none; visibility: hidden;"></iframe>`,
          }}
        />
        <QueryProvider>
          {children}
          {modal}
        </QueryProvider>
      </body>
    </html>
  )
}
