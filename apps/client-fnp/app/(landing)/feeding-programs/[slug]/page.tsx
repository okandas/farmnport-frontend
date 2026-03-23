import { queryFeedingProgramBySlug } from "@/lib/query"
import { notFound } from "next/navigation"
import { FeedingProgramDetailClient } from "./FeedingProgramDetailClient"

interface FeedingProgramDetailPageProps {
    params: Promise<{ slug: string }>
}

export default async function FeedingProgramDetailPage({ params }: FeedingProgramDetailPageProps) {
    const { slug } = await params

    let program: any = null

    try {
        const response = await queryFeedingProgramBySlug(slug)
        program = response?.data
    } catch (error) {
        console.error("Error fetching feeding program:", error)
    }

    if (!program) {
        notFound()
    }

    return <FeedingProgramDetailClient program={program} slug={slug} />
}
