import { notFound } from "next/navigation"
import { auth } from "@/auth"

/**
 * Call this after fetching a product/document on any detail page.
 * If the item has is_test: true, only internal users may view it — everyone else gets a 404.
 */
export async function guardTestItem(isTest: boolean) {
    if (!isTest) return
    const session = await auth()
    if (!session?.user?.is_internal) notFound()
}
