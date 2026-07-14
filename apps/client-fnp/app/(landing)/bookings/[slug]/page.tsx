import { notFound } from "next/navigation"
import { bookingsEnabled, preorderDepositEnabled } from "@/flags"
import { serverFetch } from "@/lib/serverFetch"
import { guardTestItem } from "@/lib/guardTestItem"
import PreOrderDetailClient from "./PreOrderDetailClient"

interface Props {
    params: Promise<{ slug: string }>
}

export default async function PreOrderDetailPage({ params }: Props) {
    const { slug } = await params
    const showBookings = await bookingsEnabled()
    if (!showBookings) notFound()

    const res = await serverFetch(`/booking/preorders/${slug}`).catch(() => null)
    const preorder = res?.preorder ?? null
    if (!preorder) notFound()
    await guardTestItem(!!preorder.is_test)

    const depositEnabled = await preorderDepositEnabled()

    return <PreOrderDetailClient preorder={preorder} depositEnabled={depositEnabled} />
}
