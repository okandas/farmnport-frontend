import Link from "next/link"
import type { Metadata } from "next"
import { serverFetch } from "@/lib/serverFetch"
import { SprayProgramsClient } from "./SprayProgramsClient"

export const metadata: Metadata = {
    title: "Spray Programs Zimbabwe — Crop Protection Schedules | farmnport.com",
    description: "Browse spray program schedules for Zimbabwe crops. Step-by-step agrochemical application timings for every growth stage, from planting to harvest.",
    keywords: "spray programs zimbabwe, crop protection schedule, agrochemical spray program, crop spraying schedule zimbabwe, pest control program, fungicide spray schedule",
    alternates: { canonical: "/spray-programs" },
    openGraph: {
        title: "Spray Programs Zimbabwe — Crop Protection Schedules",
        description: "Browse spray program schedules for Zimbabwe crops. Step-by-step agrochemical application timings for every growth stage.",
        url: "https://farmnport.com/spray-programs",
        siteName: "farmnport",
        type: "website",
        images: [{ url: "https://farmnport.com/og-image.png", width: 1200, height: 630, alt: "farmnport" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Spray Programs Zimbabwe — Crop Protection Schedules",
        description: "Browse spray program schedules for Zimbabwe crops. Step-by-step agrochemical application timings for every growth stage.",
        images: ["/og-image.png"],
    },
}

export default async function SprayProgramsPage() {
    let programs: any[] = []

    try {
        const data = await serverFetch("/sprayprograms/")
        programs = data?.data || []
    } catch (error) {
        console.error("Error fetching spray programs:", error)
    }

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Programs", "item": "https://farmnport.com/programs" },
            { "@type": "ListItem", "position": 3, "name": "Spray Programs", "item": "https://farmnport.com/spray-programs" },
        ],
    }

    return (
        <main>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            {/* Header */}
            <section className="border-b">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10 pb-8">
                    <nav className="flex text-sm text-muted-foreground mb-4">
                        <Link href="/programs" className="hover:text-foreground transition-colors">Programs</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">Spray Programs</span>
                    </nav>
                    <p className="text-xs font-semibold text-primary tracking-wide uppercase">Crop Protection</p>
                    <h1 className="mt-1 text-3xl font-bold font-heading tracking-tight">
                        Spray Programs
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Step-by-step agrochemical application schedules for every growth stage.
                    </p>
                </div>
            </section>

            <SprayProgramsClient programs={programs} />
        </main>
    )
}
