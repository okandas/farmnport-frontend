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
    unit: "",
  })

  return <CreateProductPriceForm priceList={ProductPriceItem} />
}
