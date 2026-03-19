"use client"

import Link from "next/link"
import { useState } from "react"

import { FormFeedingProgramModel } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { FeedingProgramForm } from "@/components/structures/forms/feedingProgramForm"

export default function CreateFeedingProgramPage() {

    const url = `/dashboard/feeding-programs`

    const [feedingProgram, _] = useState<FormFeedingProgramModel>({
        id: "",
        name: "",
        description: "",
        farm_produce_id: "",
        cover_image: undefined,
        stages: [],
        published: false,
    })

    return (
        <>
            <div className={"absolute right-10 top-8"}>
                <Link href={url} className={cn(buttonVariants({ variant: "link" }))}>
                    <>
                        <Icons.close className="w-4 h-4 mr-2" />
                        Close
                    </>
                </Link>
            </div>

            <FeedingProgramForm feedingProgram={feedingProgram} mode="create" />
        </>
    )
}
