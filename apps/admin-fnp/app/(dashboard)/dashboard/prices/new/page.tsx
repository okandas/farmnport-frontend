"use client"

import { useState } from "react"

import { AdminEditProducerPriceList } from "@/lib/schemas"
import { AdminCreateProductPriceForm } from "@/components/structures/forms/adminCreatePriceList"

export default function CreateClientPage() {
  const [admimProductPriceItem, _] = useState<AdminEditProducerPriceList>({
    effectiveDate: new Date(),
    beef: {
      super: 0,
      choice: 0,
      commercial: 0,
      economy: 0,
      manufacturing: 0,
      condemned: 0,
      detained: "",
    },
    lamb: {
      superPremium: 0,
      choice: 0,
      standard: 0,
      inferior: 0,
    },
    mutton: {
      super: 0,
      choice: 0,
      standard: 0,
      oridnary: 0,
      inferior: 0,
    },
    goat: {
      super: 0,
      choice: 0,
      standard: 0,
      inferior: 0,
    },
    chicken: {
      below: 0,
      midRange: 0,
      above: 0,
      condemned: 0,
    },
    pork: {
      super: 0,
      manufacturing: 0,
      head: 0,
    },
    catering: {
      chicken: 0,
    },
    unit: "",
  })

  return <AdminCreateProductPriceForm priceList={admimProductPriceItem} />
}
