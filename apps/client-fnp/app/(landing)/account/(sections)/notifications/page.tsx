import { notFound } from "next/navigation"
import { notificationsEnabled } from "@/flags"
import NotificationsClient from "./NotificationsClient"

export default async function NotificationsPage() {
    const show = await notificationsEnabled()
    if (!show) notFound()

    return <NotificationsClient />
}
