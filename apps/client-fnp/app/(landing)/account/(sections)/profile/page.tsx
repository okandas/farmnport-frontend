import { notFound } from "next/navigation"
import { profileEnabled } from "@/flags"
import ProfileClient from "./ProfileClient"

export default async function ProfilePage() {
    const show = await profileEnabled()
    if (!show) notFound()

    return <ProfileClient />
}
