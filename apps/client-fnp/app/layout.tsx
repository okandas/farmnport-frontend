import { Inter as FontSans } from "next/font/google"

import "@/styles/globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "Farmnport - Getting you to market",
  description: "",
}
interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={"min-h-screen bg-background font-sans antialiased"}>
        {children}
      </body>
    </html>
  )
}
