"use client"

import Link from "next/link"
import { useState } from "react"

import { FormSprayProgramModel } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { SprayProgramForm } from "@/components/structures/forms/sprayProgramForm"

export default function CreateSprayProgramPage() {

    const url = `/dashboard/farmnport/spray-programs`

    const [sprayProgram, _] = useState<FormSprayProgramModel>({
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

            <SprayProgramForm sprayProgram={sprayProgram} mode="create" />
        </>
    )
}
