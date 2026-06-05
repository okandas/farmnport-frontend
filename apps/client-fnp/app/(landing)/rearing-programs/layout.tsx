import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Rearing Programs | farm&port",
    description:
        "Structured rearing guides for livestock and poultry — brooding, housing, nutrition, biosecurity, and management from arrival to maturity.",
}

export default function RearingProgramsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
