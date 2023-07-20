import { Inter as FontSans } from "next/font/google"

import { cn } from "@/lib/utilities"
import QueryProvider from "@/components/providers/QueryProvider"

import "@/styles/globals.css"

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
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
