"use client"

import Link from "next/link"
import { useState } from "react"

import { FormTurtlewaxProductModel } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { TurtlewaxProductForm } from "@/components/structures/forms/turtlewaxProductForm"

export default function CreateTurtlewaxProductPage() {
    const url = `/dashboard/turtlewax/products`

    const [product, _] = useState<FormTurtlewaxProductModel>({
        id: "",
        name: "",
        sku: "",
        turtlewax_category_id: "",
        images: [],
        variants: [],
        product_overview: "",
        stock_level: 0,
        available_for_sale: false,
        show_was_price: false,
        sale_price: 0,
        was_price: 0,
        weight_grams: 0,
        delivery_available: false,
        pickup_available: false,
        pickup_location_ids: [],
        delivery_location_ids: [],
        is_test: false,
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

            <TurtlewaxProductForm product={product} mode="create" />
        </>
    )
}
