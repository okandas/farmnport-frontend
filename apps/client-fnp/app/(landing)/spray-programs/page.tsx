import { queryPublishedSprayPrograms } from "@/lib/query"
import { SprayProgramsClient } from "./SprayProgramsClient"

export default async function SprayProgramsPage() {
    let programs: any[] = []

    try {
        const data = await queryPublishedSprayPrograms()
        programs = data?.data?.data || []
    } catch (error) {
        console.error("Error fetching spray programs:", error)
    }

    return (
        <main>
            {/* Header */}
            <section className="border-b">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10 pb-8">
                    <p className="text-xs font-semibold text-primary tracking-wide uppercase">Crop Protection</p>
                    <h1 className="mt-1 text-3xl font-bold font-heading tracking-tight">
                        Spray Programs
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Step-by-step agrochemical application schedules for every growth stage.
                    </p>
                </div>
            </section>

            <SprayProgramsClient programs={programs} />
        </main>
    )
}
