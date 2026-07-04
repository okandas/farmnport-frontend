import { notFound } from "next/navigation"
import { bookingsEnabled } from "@/flags"
import BookingFormClient from "./BookingFormClient"

export default async function BookPage() {
    const showBookings = await bookingsEnabled()
    if (!showBookings) notFound()

    return <BookingFormClient />
}
