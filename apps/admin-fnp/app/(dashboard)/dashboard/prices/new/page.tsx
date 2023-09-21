"use client"

import { useState } from "react"

import { AdminEditProducerPriceList } from "@/lib/schemas"
import { AdminCreateProductPriceForm } from "@/components/structures/forms/adminCreatePriceList"

export default function CreateClientPage() {
  const [admimProductPriceItem, _] = useState<AdminEditProducerPriceList>({
    effectiveDate: new Date(),
    client_id: "",
    client_name: "",
    beef: {
      super: 0,
      choice: 0,
      commercial: 0,
      economy: 0,
      manufacturing: 0,
      condemned: 0,
      detained: "50% of the carcus value",
      hasPrice: false,
    },
    lamb: {
      superPremium: 0,
      choice: 0,
      standard: 0,
      inferior: 0,
      hasPrice: false,
    },
    mutton: {
      super: 0,
      choice: 0,
      standard: 0,
      oridnary: 0,
      inferior: 0,
      hasPrice: false,
    },
    goat: {
      super: 0,
      choice: 0,
      standard: 0,
      inferior: 0,
      hasPrice: false,
    },
    chicken: {
      below: 0,
      midRange: 0,
      above: 0,
      condemned: 0,
      hasPrice: false,
    },
    pork: {
      super: 0,
      manufacturing: 0,
      head: 0,
      hasPrice: false,
    },
    catering: {
      chicken: 0,
      hasPrice: false,
    },
    unit: "",
  })

  return <AdminCreateProductPriceForm priceList={admimProductPriceItem} />
}
