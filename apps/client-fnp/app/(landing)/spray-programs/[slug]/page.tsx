import { querySprayProgramBySlug } from "@/lib/query"
import { notFound } from "next/navigation"
import { SprayProgramDetailClient } from "./SprayProgramDetailClient"

interface SprayProgramDetailPageProps {
    params: Promise<{ slug: string }>
}

export default async function SprayProgramDetailPage({ params }: SprayProgramDetailPageProps) {
    const { slug } = await params

    let program: any = null

    try {
        const response = await querySprayProgramBySlug(slug)
        program = response?.data
    } catch (error) {
        console.error("Error fetching spray program:", error)
    }

    if (!program) {
        notFound()
    }

    return <SprayProgramDetailClient program={program} slug={slug} />
}
