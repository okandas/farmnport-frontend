import { ProduceGradeBoard } from "@/components/structures/produce-grade-board"
import type { Metadata } from "next"
import { capitalizeFirstLetter } from "@/lib/utilities"

interface ProducePageProps {
  params: Promise<{ produce: string }>
  searchParams: Promise<{ code?: string; type?: string }>
}

export async function generateMetadata({ params }: ProducePageProps): Promise<Metadata> {
  const { produce } = await params
  const produceName = capitalizeFirstLetter(produce.replace(/-/g, ' '))
  return {
    title: `${produceName} Prices Zimbabwe – Current Market Rates | farmnport.com`,
    description: `Browse current ${produceName.toLowerCase()} prices from buyers across Zimbabwe.`,
    alternates: { canonical: `/prices/${produce}` },
    openGraph: {
      title: `${produceName} Prices Zimbabwe – Current Market Rates`,
      description: `Browse current ${produceName.toLowerCase()} prices from buyers across Zimbabwe.`,
      url: `/prices/${produce}`,
      siteName: 'farmnport',
      type: 'website',
    },
  }
}

export default async function ProducePricePage({ params, searchParams }: ProducePageProps) {
  const { produce } = await params
  const { code, type } = await searchParams

  return (
    <>
      <h1 className="sr-only">{capitalizeFirstLetter(produce)} Prices Zimbabwe</h1>
      <ProduceGradeBoard produce={produce} code={code ?? ""} priceType={type ?? ""} />
    </>
  )
}
