import type { Metadata } from "next"
import { serverFetch } from "@/lib/serverFetch"
import { notFound } from "next/navigation"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { FeedingProgramDetailClient } from "./FeedingProgramDetailClient"

interface FeedingProgramDetailPageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: FeedingProgramDetailPageProps): Promise<Metadata> {
    const { slug } = await params
    let program: any = null
    try {
        program = await serverFetch(`/feedingprograms/${slug}`)
    } catch {}

    const name = program?.name || program?.farm_produce_name || capitalizeFirstLetter(slug.replace(/-/g, ' '))
    const description = `${name} feeding program for Zimbabwe farmers. View feed formulations, schedules, and nutritional targets for optimal livestock performance.`

    return {
        title: `${name} Feeding Program Zimbabwe | farmnport.com`,
        description,
        keywords: `${name.toLowerCase()} feeding program, ${name.toLowerCase()} feed schedule zimbabwe, livestock nutrition ${name.toLowerCase()}, ${slug} feed plan`,
        alternates: { canonical: `/feeding-programs/${slug}` },
        openGraph: {
            title: `${name} Feeding Program Zimbabwe`,
            description,
            url: `https://farmnport.com/feeding-programs/${slug}`,
            siteName: "farmnport",
            type: "website",
        },
    }
}

export default async function FeedingProgramDetailPage({ params }: FeedingProgramDetailPageProps) {
    const { slug } = await params

    let program: any = null

    try {
        program = await serverFetch(`/feedingprograms/${slug}`)
    } catch (error) {
        console.error("Error fetching feeding program:", error)
    }

    if (!program) {
        notFound()
    }

    const programName = program.name || program.farm_produce_name || capitalizeFirstLetter(slug.replace(/-/g, ' '))

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Feeding Programs", "item": "https://farmnport.com/feeding-programs" },
            { "@type": "ListItem", "position": 3, "name": programName, "item": `https://farmnport.com/feeding-programs/${slug}` },
        ],
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <FeedingProgramDetailClient program={program} slug={slug} />
        </>
    )
}
