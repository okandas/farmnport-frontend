import { notFound } from "next/navigation"
import { securityEnabled } from "@/flags"
import SecurityClient from "./SecurityClient"

export default async function SecurityPage() {
    const show = await securityEnabled()
    if (!show) notFound()

    return <SecurityClient />
}
