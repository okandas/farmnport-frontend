import { notFound } from "next/navigation"
import { bookingsEnabled, preorderDepositEnabled } from "@/flags"
import PreOrderDetailClient from "./PreOrderDetailClient"

export default async function PreOrderDetailPage() {
    const showBookings = await bookingsEnabled()
    if (!showBookings) notFound()

    const depositEnabled = await preorderDepositEnabled()

    return <PreOrderDetailClient depositEnabled={depositEnabled} />
}
