import { queryAllAgroChemicals } from "@/lib/query"
import { AllAgroChemicalsClient } from "./AllAgroChemicalsClient"

export default async function AllAgroChemicalsPage() {
    let initialChemicals: any[] = []
    let initialTotal = 0

    try {
        const response = await queryAllAgroChemicals({
            p: 1,
            search: "",
            brand: [],
            target: [],
            active_ingredient: [],
            used_on: [],
        })
        initialChemicals = response?.data?.data || []
        initialTotal = response?.data?.total || 0
    } catch (error) {
        console.error("Error fetching agrochemicals:", error)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <AllAgroChemicalsClient
                    initialChemicals={initialChemicals}
                    initialTotal={initialTotal}
                />
            </div>
        </div>
    )
}
