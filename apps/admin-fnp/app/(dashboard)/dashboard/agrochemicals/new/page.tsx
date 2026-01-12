"use client"

import Link from "next/link"
import { useState } from "react"


import { FormAgroChemicalModel } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { CreateAgroChemicalForm } from "@/components/structures/forms/productCreate"



export default function CreateAgroChemicalPage() {

    const url = `/dashboard/agrochemicals`

    const [product, _] = useState<FormAgroChemicalModel>({
        id: "",
        name: "",
        descriptions: [{ name: "", value: "" }],
        reg_number: "",
        cat: "",
        images: [{
            img: {
                id: "",
                src: ""
            }
        }],
        unit: [{ name: "", value: 0 }],
        manufacturer: { name: "" },
        distributor: { name: "" },
        warnings: [{ name: "", value: "", location: "" }],
        instructions: {
            usage: [
                { name: "", value: "" }
            ],
            examples: [
                {
                    description: '',
                    values: [{
                        dosage: {
                            unit: "",
                            value: 0
                        },
                        mass: {
                            unit: "",
                            weight: 0
                        },
                        pack: 0
                    }]
                }
            ]
            ,
            efficacy_table: [
                {
                    species: "",
                    third_stage: "",
                    fourth_stage: "",
                    adults: ""
                }
            ],
            efficacy: [
                {
                    name: "",
                    value: ""
                }
            ],
            key_map: {
                type: "",
                values: [{
                    name: "",
                    value: ""
                }]
            }
        }
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

            <CreateAgroChemicalForm product={product} />
        </>
    )
}
