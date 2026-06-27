import type { Metadata } from "next"
import { Brooding101Client } from "./Brooding101Client"

export const metadata: Metadata = {
    title: "Brooding 101 by Charles Stewart | farm&port",
    description:
        "A complete brooding guide by Charles Stewart covering housing, chick collection, temperature, feeding, biosecurity, and vaccinations for Ross 308 broiler day-old chicks.",
}

export default function Brooding101Page() {
    return <Brooding101Client />
}
