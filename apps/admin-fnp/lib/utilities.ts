import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns"
import Dinero from "dinero.js"
import { PhoneNumberUtil } from "google-libphonenumber"
import slugify from "slugify"
import { twMerge } from "tailwind-merge"
import { ProducerPriceList, ProducerPriceListSchema } from "@/lib/schemas"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MutationFunction } from "@tanstack/react-query"

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

export async function submitPriceList(
  payload: ProducerPriceList,
  mutate: MutationFunction<unknown, ProducerPriceList>,
) {
  // beef
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

  // Lamb
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

  // Chicken
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

  payload.chicken.a_grade_over_1_75.pricing.delivered = dollarsToCents(
    payload.chicken.a_grade_over_1_75.pricing.collected,
  )
  payload.chicken.a_grade_1_55_1_75.pricing.collected = dollarsToCents(
    payload.chicken.a_grade_1_55_1_75.pricing.collected,
  )
  payload.chicken.a_grade_under_1_55.pricing.collected = dollarsToCents(
    payload.chicken.a_grade_under_1_55.pricing.collected,
  )

  payload.chicken.off_layers.pricing.delivered = dollarsToCents(
    payload.chicken.off_layers.pricing.collected,
  )

  payload.chicken.condemned.pricing.collected = dollarsToCents(
    payload.chicken.condemned.pricing.collected,
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

  await mutate(payload)
}

export function useFormCreatePriceListForm(priceList: ProducerPriceList) {
  return useForm({
    defaultValues: {
      id: priceList.id,
      effectiveDate: new Date(),
      client_id: priceList.client_id,
      client_name: priceList.client_name,
      client_specialization: priceList.client_specialization || "livestock",
      beef: {
        super: {
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
  })
}
