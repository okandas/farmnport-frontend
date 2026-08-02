import type { Metadata } from "next"
import { serverFetch } from "@/lib/serverFetch"
import { notFound } from "next/navigation"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { SprayProgramDetailClient } from "./SprayProgramDetailClient"

interface SprayProgramDetailPageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: SprayProgramDetailPageProps): Promise<Metadata> {
    const { slug } = await params
    let program: any = null
    try {
        program = await serverFetch(`/sprayprograms/${slug}`)
    } catch {}

    const name = program?.name || capitalizeFirstLetter(slug.replace(/-/g, ' '))
    const description = `${name} spray program for Zimbabwe crops. View application timings, recommended agrochemicals, and dosage rates for each growth stage.`

    return {
        title: `${name} Spray Program Zimbabwe | farmnport.com`,
        description,
        keywords: `${name.toLowerCase()} spray program, ${name.toLowerCase()} crop protection, spray schedule zimbabwe, ${slug} agrochemical program`,
        alternates: { canonical: `/spray-programs/${slug}` },
        openGraph: {
            title: `${name} Spray Program Zimbabwe`,
            description,
            url: `https://farmnport.com/spray-programs/${slug}`,
            siteName: "farmnport",
            type: "website",
        },
    }
}

export default async function SprayProgramDetailPage({ params }: SprayProgramDetailPageProps) {
    const { slug } = await params

    let program: any = null

    try {
        program = await serverFetch(`/sprayprograms/${slug}`)
    } catch (error) {
        console.error("Error fetching spray program:", error)
    }

    if (!program) {
        notFound()
    }

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Spray Programs", "item": "https://farmnport.com/spray-programs" },
            { "@type": "ListItem", "position": 3, "name": program.name || capitalizeFirstLetter(slug.replace(/-/g, ' ')), "item": `https://farmnport.com/spray-programs/${slug}` },
        ],
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <SprayProgramDetailClient program={program} slug={slug} />
        </>
    )
}
