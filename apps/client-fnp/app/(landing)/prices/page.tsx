import { PricesBoard } from "@/components/structures/prices-board"

export const metadata = {
  title: 'Agricultural Market Prices Zimbabwe – Livestock, Produce & More | farmnport.com',
  description: 'Compare current agricultural prices from verified buyers across Zimbabwe. Liveweight cattle, cold dress mass, beef, lamb, mutton, goat, chicken, pork — updated weekly in USD and ZiG.',
  alternates: { canonical: '/prices' },
  openGraph: {
    title: 'Agricultural Market Prices Zimbabwe',
    description: 'Compare current agricultural prices from verified buyers across Zimbabwe.',
    url: '/prices',
    siteName: 'farmnport',
    type: 'website',
  },
}

export default function PricesPage() {
  return (
    <>
      <h1 className="sr-only">Agricultural Market Prices Zimbabwe – Livestock, Produce &amp; More</h1>
      <PricesBoard />
    </>
  )
}
