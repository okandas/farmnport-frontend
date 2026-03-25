"use client"

import { useState } from "react"

import { ProducerPriceList } from "@/lib/schemas"
import { CreateProductPriceForm } from "@/components/structures/forms/createPriceList"

export default function CreateClientPage() {
  const [ProductPriceItem, _] = useState<ProducerPriceList>({
    id: "",
    effectiveDate: new Date(),
    client_id: "",
    client_name: "",
    client_specialization: "livestock",
    beef: {
      farm_produce_id: "",
      super: {
        code: "S",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      choice: {
        code: "O",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      commercial: {
        code: "B",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      economy: {
        code: "X",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      manufacturing: {
        code: "J",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      condemned: {
        code: "CD",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      detained: "50% of the carcass value",
      hasPrice: false,
      hasCollectedPrice: false,
    },
    lamb: {
      farm_produce_id: "",
      super_premium: {
        code: "SL",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      choice: {
        code: "CL",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      standard: {
        code: "TL",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      inferior: {
        code: "IL",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      hasPrice: false,
      hasCollectedPrice: false,
    },
    mutton: {
      farm_produce_id: "",
      super: {
        code: "SM",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      choice: {
        code: "CM",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      standard: {
        code: "TM",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      ordinary: {
        code: "OM",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      inferior: {
        code: "IM",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      hasPrice: false,
      hasCollectedPrice: false,
    },
    goat: {
      farm_produce_id: "",
      super: {
        code: "SG",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      choice: {
        code: "OG",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      standard: {
        code: "TG",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      inferior: {
        code: "IG",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      hasPrice: false,
      hasCollectedPrice: false,
    },
    chicken: {
      farm_produce_id: "",
      a_grade_over_1_75: {
        code: "A",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      a_grade_1_55_1_75: {
        code: "A",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      a_grade_under_1_55: {
        code: "A",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      off_layers: {
        code: "OF",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      condemned: {
        code: "CD",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      hasPrice: false,
      hasCollectedPrice: false,
    },
    pork: {
      farm_produce_id: "",
      super: {
        code: "SP",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      manufacturing: {
        code: "J",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      head: {
        code: "head",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      hasPrice: false,
      hasCollectedPrice: false,
    },
    catering: {
      farm_produce_id: "",
      chicken: {
        order: {
          price: 0,
          quantity: 0,
        },
        frequency: "",
      },
      hasPrice: false,
      hasCollectedPrice: false,
    },
    slaughter: {
      cattle: {
        farm_produce_id: "",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      sheep: {
        farm_produce_id: "",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      pigs: {
        farm_produce_id: "",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      chicken: {
        farm_produce_id: "",
        pricing: {
          collected: 0,
          delivered: 0,
        },
      },
      hasPrice: false,
      hasCollectedPrice: false,
    },
    unit: "",
    pricing_basis: "",
    notes: [],
    overwrite: false,
  })

  return <CreateProductPriceForm priceList={ProductPriceItem} />
}
