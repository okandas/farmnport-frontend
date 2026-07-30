import type { Metadata } from "next"

const siteUrl = "https://farmnport.com"

export const metadata: Metadata = {
  title: "Resources — Learn How to Sell, Buy & Trade on Farmnport",
  description:
    "Step-by-step guides to help you list lots, create bookings, find buyers, and start selling on farmnport.com.",
  alternates: { canonical: `${siteUrl}/resources` },
  openGraph: {
    title: "Resources — Learn How to Sell, Buy & Trade on Farmnport",
    description:
      "Step-by-step guides to help you list lots, create bookings, find buyers, and start selling on farmnport.com.",
    url: `${siteUrl}/resources`,
    siteName: "farmnport",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resources — Learn How to Sell, Buy & Trade on Farmnport",
    description:
      "Step-by-step guides to help you list lots, create bookings, find buyers, and start selling on farmnport.com.",
  },
}

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children
}
