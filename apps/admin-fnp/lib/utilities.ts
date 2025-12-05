import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns"
import Dinero from "dinero.js"
import { PhoneNumberUtil } from "google-libphonenumber"
import slugify from "slugify"
import { twMerge } from "tailwind-merge"
import { ProducerPriceList, ProducerPriceListSchema } from "@/lib/schemas"

import { zodResolver } from "@hookform/resolvers/zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const phoneUtility = PhoneNumberUtil.getInstance()

export function slug(name?: string): string {
  if (name === undefined) return ""
  return slugify(name, {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    lower: true,
  })
}

export function unSlug(slug: string): string {
  let split = slug.split("-")
  return split.join(" ")
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function makeAbbreviation(str?: string) {
  if (str === undefined) {
    return "FP"
  }
  let abbreviation = ""
  if (typeof str === "string") {
    const words = str.split(" ")
    for (let i = 0; i < words.length; i++) {
      abbreviation += words[i].slice(0, 1)
    }
    return abbreviation
  } else {
    abbreviation = "FP"
    return abbreviation
  }
}

export function formatDate(d?: string) {
  if (d === undefined) return ""
  const date = new Date(d)
  return format(date, "dd MMMM yyyy")
}

export function ucFirst(word?: string) {
  if (word === undefined) return ""
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function centsToDollars(cents: number | boolean) {
  if (typeof cents === "boolean") return cents
  if (isNaN(cents)) return cents
  return Dinero({ amount: cents }).toFormat("$0,0.00")
}

export function centsToDollarsFormInputs(cents: number) {
  const amount = isNaN(cents) ? 0 : Number(cents)
  return Number(Dinero({ amount: amount }).toFormat("0.00"))
}

export function dollarsToCents(dollars: number) {
  return Math.round(100 * dollars)
}

export function createPriceListDefaultValues(priceList: ProducerPriceList) {
  return {
    defaultValues: {
      id: priceList.id,
      effectiveDate: new Date(),
      client_id: priceList.client_id,
      client_name: priceList.client_name,
      client_specialization: priceList.client_specialization || "livestock",
      beef: {
        super: {
          code: priceList.beef.super.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.beef.super.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.beef.super.pricing.delivered,
            ),
          },
        },
        choice: {
          code: priceList.beef.choice.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.beef.choice.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.beef.choice.pricing.delivered,
            ),
          },
        },
        commercial: {
          code: priceList.beef.commercial.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.beef.commercial.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.beef.commercial.pricing.delivered,
            ),
          },
        },
        economy: {
          code: priceList.beef.economy.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.beef.economy.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.beef.economy.pricing.delivered,
            ),
          },
        },
        manufacturing: {
          code: priceList.beef.manufacturing.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.beef.manufacturing.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.beef.manufacturing.pricing.delivered,
            ),
          },
        },
        condemned: {
          code: priceList.beef.condemned.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.beef.condemned.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.beef.condemned.pricing.delivered,
            ),
          },
        },

        detained: priceList.beef.detained,
        hasPrice: priceList.beef.hasPrice,
        hasCollectedPrice: priceList.beef.hasCollectedPrice,
      },
      lamb: {
        super_premium: {
          code: priceList.lamb.super_premium.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.lamb.super_premium.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.lamb.super_premium.pricing.delivered,
            ),
          },
        },
        choice: {
          code: priceList.lamb.choice.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.lamb.choice.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.lamb.choice.pricing.delivered,
            ),
          },
        },
        standard: {
          code: priceList.lamb.standard.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.lamb.standard.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.lamb.standard.pricing.delivered,
            ),
          },
        },
        inferior: {
          code: priceList.lamb.inferior.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.lamb.inferior.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.lamb.inferior.pricing.delivered,
            ),
          },
        },
        hasPrice: priceList.lamb.hasPrice,
        hasCollectedPrice: priceList.lamb.hasCollectedPrice,
      },
      mutton: {
        super: {
          code: priceList.mutton.super.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.mutton.super.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.mutton.super.pricing.delivered,
            ),
          },
        },
        choice: {
          code: priceList.mutton.choice.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.mutton.choice.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.mutton.choice.pricing.delivered,
            ),
          },
        },
        standard: {
          code: priceList.mutton.standard.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.mutton.standard.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.mutton.standard.pricing.delivered,
            ),
          },
        },
        ordinary: {
          code: priceList.mutton.ordinary.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.mutton.ordinary.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.mutton.ordinary.pricing.delivered,
            ),
          },
        },
        inferior: {
          code: priceList.mutton.inferior.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.mutton.inferior.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.mutton.inferior.pricing.delivered,
            ),
          },
        },
        hasPrice: priceList.mutton.hasPrice,
        hasCollectedPrice: priceList.mutton.hasCollectedPrice,
      },
      goat: {
        super: {
          code: priceList.goat.super.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.goat.super.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.goat.super.pricing.delivered,
            ),
          },
        },
        choice: {
          code: priceList.goat.choice.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.goat.choice.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.goat.choice.pricing.delivered,
            ),
          },
        },
        standard: {
          code: priceList.goat.standard.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.goat.standard.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.goat.standard.pricing.delivered,
            ),
          },
        },
        inferior: {
          code: priceList.goat.inferior.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.goat.inferior.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.goat.inferior.pricing.delivered,
            ),
          },
        },
        hasPrice: priceList.goat.hasPrice,
        hasCollectedPrice: priceList.goat.hasCollectedPrice,
      },
      chicken: {
        a_grade_over_1_75: {
          code: priceList.chicken.a_grade_over_1_75.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.chicken.a_grade_over_1_75.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.chicken.a_grade_over_1_75.pricing.delivered,
            ),
          },
        },
        a_grade_1_55_1_75: {
          code: priceList.chicken.a_grade_1_55_1_75.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.chicken.a_grade_1_55_1_75.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.chicken.a_grade_1_55_1_75.pricing.delivered,
            ),
          },
        },
        a_grade_under_1_55: {
          code: priceList.chicken.a_grade_under_1_55.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.chicken.a_grade_under_1_55.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.chicken.a_grade_under_1_55.pricing.delivered,
            ),
          },
        },
        off_layers: {
          code: priceList.chicken.off_layers.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.chicken.off_layers.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.chicken.off_layers.pricing.delivered,
            ),
          },
        },
        condemned: {
          code: priceList.chicken.condemned.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.chicken.condemned?.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.chicken.condemned?.pricing.delivered,
            ),
          },
        },
        hasPrice: priceList.chicken.hasPrice,
        hasCollectedPrice: priceList.chicken.hasCollectedPrice,
      },
      pork: {
        super: {
          code: priceList.pork.super.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.pork.super.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.pork.super.pricing.delivered,
            ),
          },
        },
        manufacturing: {
          code: priceList.pork.manufacturing.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.pork.manufacturing.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.pork.manufacturing.pricing.delivered,
            ),
          },
        },
        head: {
          code: priceList.pork.head.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.pork.head.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.pork.head.pricing.delivered,
            ),
          },
        },
        hasPrice: priceList.pork.hasPrice,
        hasCollectedPrice: priceList.pork.hasCollectedPrice,
      },
      catering: {
        chicken: {
          order: {
            price: centsToDollarsFormInputs(
              priceList.catering.chicken.order.price,
            ),
            quantity: centsToDollarsFormInputs(
              priceList.catering.chicken.order.quantity,
            ),
          },
          frequency: priceList.catering.chicken.frequency,
        },
        hasPrice: priceList.catering.hasPrice,
        hasCollectedPrice: priceList.catering.hasCollectedPrice,
      },
      unit: priceList.unit,
    },
    resolver: zodResolver(ProducerPriceListSchema),
  }
}

export function createPriceListPayload(payload: ProducerPriceList) {
  // Beef Start
  payload.beef.super.pricing.collected = dollarsToCents(
    payload.beef.super.pricing.collected,
  )
  payload.beef.choice.pricing.collected = dollarsToCents(
    payload.beef.choice.pricing.collected,
  )
  payload.beef.commercial.pricing.collected = dollarsToCents(
    payload.beef.commercial.pricing.collected,
  )
  payload.beef.economy.pricing.collected = dollarsToCents(
    payload.beef.economy.pricing.collected,
  )
  payload.beef.manufacturing.pricing.collected = dollarsToCents(
    payload.beef.manufacturing.pricing.collected,
  )
  payload.beef.condemned.pricing.collected = dollarsToCents(
    payload.beef.condemned.pricing.collected,
  )
  // Delivered
  payload.beef.super.pricing.delivered = dollarsToCents(
    payload.beef.super.pricing.delivered,
  )
  payload.beef.choice.pricing.delivered = dollarsToCents(
    payload.beef.choice.pricing.delivered,
  )
  payload.beef.commercial.pricing.delivered = dollarsToCents(
    payload.beef.commercial.pricing.delivered,
  )
  payload.beef.economy.pricing.delivered = dollarsToCents(
    payload.beef.economy.pricing.delivered,
  )
  payload.beef.manufacturing.pricing.delivered = dollarsToCents(
    payload.beef.manufacturing.pricing.delivered,
  )
  payload.beef.condemned.pricing.delivered = dollarsToCents(
    payload.beef.condemned.pricing.delivered,
  )
  // Beef End

  // Lamb start
  payload.lamb.super_premium.pricing.collected = dollarsToCents(
    payload.lamb.super_premium.pricing.collected,
  )
  payload.lamb.choice.pricing.collected = dollarsToCents(
    payload.lamb.choice.pricing.collected,
  )
  payload.lamb.standard.pricing.collected = dollarsToCents(
    payload.lamb.standard.pricing.collected,
  )
  payload.lamb.inferior.pricing.collected = dollarsToCents(
    payload.lamb.inferior.pricing.collected,
  )

  // Delivered

  payload.lamb.super_premium.pricing.delivered = dollarsToCents(
    payload.lamb.super_premium.pricing.delivered,
  )
  payload.lamb.choice.pricing.delivered = dollarsToCents(
    payload.lamb.choice.pricing.delivered,
  )
  payload.lamb.standard.pricing.delivered = dollarsToCents(
    payload.lamb.standard.pricing.delivered,
  )
  payload.lamb.inferior.pricing.delivered = dollarsToCents(
    payload.lamb.inferior.pricing.delivered,
  )
  // Lamb end

  // mutton
  payload.mutton.super.pricing.collected = dollarsToCents(
    payload.mutton.super.pricing.collected,
  )
  payload.mutton.choice.pricing.collected = dollarsToCents(
    payload.mutton.choice.pricing.collected,
  )
  payload.mutton.standard.pricing.collected = dollarsToCents(
    payload.mutton.standard.pricing.collected,
  )
  payload.mutton.ordinary.pricing.collected = dollarsToCents(
    payload.mutton.ordinary.pricing.collected,
  )
  payload.mutton.inferior.pricing.collected = dollarsToCents(
    payload.mutton.inferior.pricing.collected,
  )

  payload.mutton.super.pricing.delivered = dollarsToCents(
    payload.mutton.super.pricing.delivered,
  )
  payload.mutton.choice.pricing.delivered = dollarsToCents(
    payload.mutton.choice.pricing.delivered,
  )
  payload.mutton.standard.pricing.delivered = dollarsToCents(
    payload.mutton.standard.pricing.delivered,
  )
  payload.mutton.ordinary.pricing.delivered = dollarsToCents(
    payload.mutton.ordinary.pricing.delivered,
  )
  payload.mutton.inferior.pricing.delivered = dollarsToCents(
    payload.mutton.inferior.pricing.delivered,
  )

  // Goat
  payload.goat.super.pricing.collected = dollarsToCents(
    payload.goat.super.pricing.collected,
  )
  payload.goat.choice.pricing.collected = dollarsToCents(
    payload.goat.choice.pricing.collected,
  )
  payload.goat.standard.pricing.collected = dollarsToCents(
    payload.mutton.standard.pricing.collected,
  )
  payload.goat.inferior.pricing.collected = dollarsToCents(
    payload.goat.inferior.pricing.collected,
  )

  payload.goat.super.pricing.delivered = dollarsToCents(
    payload.mutton.super.pricing.delivered,
  )
  payload.goat.choice.pricing.delivered = dollarsToCents(
    payload.goat.choice.pricing.delivered,
  )
  payload.goat.standard.pricing.delivered = dollarsToCents(
    payload.goat.standard.pricing.delivered,
  )

  payload.goat.inferior.pricing.delivered = dollarsToCents(
    payload.goat.inferior.pricing.delivered,
  )

  // Chicken - Collected
  payload.chicken.a_grade_over_1_75.pricing.collected = dollarsToCents(
    payload.chicken.a_grade_over_1_75.pricing.collected,
  )
  payload.chicken.a_grade_1_55_1_75.pricing.collected = dollarsToCents(
    payload.chicken.a_grade_1_55_1_75.pricing.collected,
  )
  payload.chicken.a_grade_under_1_55.pricing.collected = dollarsToCents(
    payload.chicken.a_grade_under_1_55.pricing.collected,
  )
  payload.chicken.off_layers.pricing.collected = dollarsToCents(
    payload.chicken.off_layers.pricing.collected,
  )
  payload.chicken.condemned.pricing.collected = dollarsToCents(
    payload.chicken.condemned.pricing.collected,
  )

  // Chicken - Delivered
  payload.chicken.a_grade_over_1_75.pricing.delivered = dollarsToCents(
    payload.chicken.a_grade_over_1_75.pricing.delivered,
  )
  payload.chicken.a_grade_1_55_1_75.pricing.delivered = dollarsToCents(
    payload.chicken.a_grade_1_55_1_75.pricing.delivered,
  )
  payload.chicken.a_grade_under_1_55.pricing.delivered = dollarsToCents(
    payload.chicken.a_grade_under_1_55.pricing.delivered,
  )
  payload.chicken.off_layers.pricing.delivered = dollarsToCents(
    payload.chicken.off_layers.pricing.delivered,
  )
  payload.chicken.condemned.pricing.delivered = dollarsToCents(
    payload.chicken.condemned.pricing.delivered,
  )

  // Pork
  payload.pork.super.pricing.collected = dollarsToCents(
    payload.pork.super.pricing.collected,
  )
  payload.pork.manufacturing.pricing.collected = dollarsToCents(
    payload.pork.manufacturing.pricing.collected,
  )
  payload.pork.head.pricing.collected = dollarsToCents(
    payload.pork.head.pricing.collected,
  )

  payload.pork.super.pricing.delivered = dollarsToCents(
    payload.pork.super.pricing.delivered,
  )
  payload.pork.manufacturing.pricing.delivered = dollarsToCents(
    payload.pork.manufacturing.pricing.delivered,
  )
  payload.pork.head.pricing.delivered = dollarsToCents(
    payload.pork.head.pricing.delivered,
  )

  // catering

  payload.catering.chicken.order.price = dollarsToCents(
    payload.catering.chicken.order.price,
  )

  payload.catering.chicken.order.quantity = dollarsToCents(
    payload.catering.chicken.order.quantity,
  )

  // Slaughter
  payload.slaughter.cattle.pricing.collected = dollarsToCents(
    payload.slaughter.cattle.pricing.collected,
  )
  payload.slaughter.cattle.pricing.delivered = dollarsToCents(
    payload.slaughter.cattle.pricing.delivered,
  )

  payload.slaughter.sheep.pricing.collected = dollarsToCents(
    payload.slaughter.sheep.pricing.collected,
  )
  payload.slaughter.sheep.pricing.delivered = dollarsToCents(
    payload.slaughter.sheep.pricing.delivered,
  )

  payload.slaughter.pigs.pricing.collected = dollarsToCents(
    payload.slaughter.pigs.pricing.collected,
  )
  payload.slaughter.pigs.pricing.delivered = dollarsToCents(
    payload.slaughter.pigs.pricing.delivered,
  )

  payload.slaughter.chicken.pricing.collected = dollarsToCents(
    payload.slaughter.chicken.pricing.collected,
  )
  payload.slaughter.chicken.pricing.delivered = dollarsToCents(
    payload.slaughter.chicken.pricing.delivered,
  )

  return payload
}
