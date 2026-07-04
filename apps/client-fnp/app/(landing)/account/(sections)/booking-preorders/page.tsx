import { notFound } from "next/navigation"
import { bookingsEnabled } from "@/flags"
import BookingPreordersClient from "./BookingPreordersClient"

export default async function BookingPreordersPage() {
    const showBookings = await bookingsEnabled()
    if (!showBookings) notFound()

    return <BookingPreordersClient />
}
