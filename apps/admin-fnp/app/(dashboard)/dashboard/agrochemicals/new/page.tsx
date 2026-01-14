"use client"

import Link from "next/link"
import { useState } from "react"


import { FormAgroChemicalModel } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { AgroChemicalForm } from "@/components/structures/forms/agroChemicalForm"



export default function CreateAgroChemicalPage() {

    const url = `/dashboard/agrochemicals`

    const [agroChemical, _] = useState<FormAgroChemicalModel>({
        id: "",
        name: "",
        brand_id: "",
        front_label: { img: { id: "", src: "" } },
        back_label: { img: { id: "", src: "" } },
        images: [],
        active_ingredients: [],
        dosage_rates: []
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

            <AgroChemicalForm agroChemical={agroChemical} mode="create" />
        </>
    )
}
