import * as z from "zod"

export const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export type AuthenticatedUser = {
  admin: boolean
  banned: boolean
  exp: number
  iat: number
  id: string
  iss: string
  subject: string
  username: string
}

export type LoginResponse = {
  token: string
}

export type ProducerPriceListsResponse = {
  total: number
  data: ProducerPriceList[]
}

export const ApplicationUserSchema = z.object({
  id: z.string(),
  name: z.string().min(4),
  short_description: z.string(),
  scale: z.string(),
  code: z.string(),
  phone: z.string().min(5),
  branches: z.coerce.number().positive(),
  email: z.string().email(),
  address: z.string().min(10),
  city: z.string().min(5),
  province: z.string(),
  specialization: z.string(),
  main_activity: z.string(),
  specializations: z.array(z.string().trim()).min(1),
  created: z.string(),
  updated: z.string(),
  confirmed: z.boolean(),
  type: z.string(),
  phase: z.string(),
  admin: z.object({
    id: z.string(),
    name: z.boolean(),
  }),
  location: z.object({
    type: z.string(),
    coordinates: z.array(z.number()),
  }),
  verified: z.boolean(),
  payment_terms: z.string(),
  bad_participant: z.boolean(),
  has_prices: z.boolean(),
})

const pricingSchema = z.object({
  collected: z.coerce.number().nonnegative(),
  delivered: z.coerce.number().nonnegative(),
})

export const ProducerPriceListSchema = z
  .object({
    id: z.string(),
    client_id: z
      .string({
        required_error: "Pricing update should be matched to a client",
      })
      .min(1, "Pricing Update Should be matched to a client"),
    client_name: z.string(),
    client_specialization: z.string(),
    effectiveDate: z.coerce.date(),
    beef: z.object({
      super: z.object({
        code: z.string(),
        pricing: z.object({
          collected: z.coerce.number().nonnegative(),
          delivered: z.coerce.number().nonnegative(),
        }),
      }),
      choice: z.object({
        code: z.string(),
        pricing: z.object({
          collected: z.coerce.number().nonnegative(),
          delivered: z.coerce.number().nonnegative(),
        }),
      }),
      commercial: z.object({
        code: z.string(),
        pricing: z.object({
          collected: z.coerce.number().nonnegative(),
          delivered: z.coerce.number().nonnegative(),
        }),
      }),
      economy: z.object({
        code: z.string(),
        pricing: z.object({
          collected: z.coerce.number().nonnegative(),
          delivered: z.coerce.number().nonnegative(),
        }),
      }),
      manufacturing: z.object({
        code: z.string(),
        pricing: z.object({
          collected: z.coerce.number().nonnegative(),
          delivered: z.coerce.number().nonnegative(),
        }),
      }),
      condemned: z.object({
        code: z.string(),
        pricing: z.object({
          collected: z.coerce.number().nonnegative(),
          delivered: z.coerce.number().nonnegative(),
        }),
      }),
      detained: z.string(),
      hasPrice: z.boolean(),
      hasCollectedPrice: z.boolean(),
    }),
    chicken: z.object({
      a_grade_over_1_75: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      a_grade_1_55_1_75: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      a_grade_under_1_55: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      off_layers: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      condemned: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      hasPrice: z.boolean(),
      hasCollectedPrice: z.boolean(),
    }),
    pork: z.object({
      super: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      manufacturing: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      head: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      hasPrice: z.boolean(),
      hasCollectedPrice: z.boolean(),
    }),
    goat: z.object({
      super: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      choice: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      standard: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      inferior: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      hasPrice: z.boolean(),
      hasCollectedPrice: z.boolean(),
    }),
    mutton: z.object({
      super: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      choice: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      standard: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      ordinary: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      inferior: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      hasPrice: z.boolean(),
      hasCollectedPrice: z.boolean(),
    }),
    lamb: z.object({
      super_premium: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      choice: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      standard: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      inferior: z.object({
        code: z.string(),
        pricing: pricingSchema,
      }),
      hasPrice: z.boolean(),
      hasCollectedPrice: z.boolean(),
    }),
    catering: z.object({
      chicken: z.object({
        order: z.object({
          price: z.coerce.number().nonnegative(),
          quantity: z.coerce.number().nonnegative(),
        }),
        frequency: z.string(),
      }),
      hasPrice: z.boolean(),
      hasCollectedPrice: z.boolean(),
    }),
    unit: z.string(),
  })
  .superRefine((data, ctx) => {
    const chickenUnselected = !data.chicken.hasPrice
    const beefUnselected = !data.beef.hasPrice
    const porkUnselected = !data.pork.hasPrice
    const goatUnselected = !data.goat.hasPrice
    const muttonUnselected = !data.mutton.hasPrice
    const lambUnselected = !data.lamb.hasPrice
    const cateringUnselected = !data.catering.hasPrice

    if (chickenUnselected && porkUnselected && beefUnselected) {
      ctx.addIssue({
        path: ["client_id"], // attach to root
        code: z.ZodIssueCode.custom,
        message:
          "At least one form needs must to be selected",
      })
    }
  })

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  descriptions: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    }),
  ),
  reg_number: z.string(),
  cat: z.string(),
  admin: z.object({
    id: z.string(),
    name: z.boolean(),
  }),
  images: z.array(
    z.object({
      img: z.object({
        id: z.string(),
        src: z.string(),
      }),
    }),
  ),
  unit: z.array(
    z.object({
      name: z.string(),
      value: z.coerce.number().nonnegative(),
    }),
  ),
  manufacturer: z.object({
    name: z.string(),
  }),
  distributor: z.object({
    name: z.string(),
  }),
  warnings: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
      location: z.string(),
    }),
  ),
  instructions: z.object({
    usage: z.array(
      z.object({
        name: z.string(),
        value: z.string(),
      }),
    ),
    examples: z.array(
      z.object({
        description: z.string().optional(),
        values: z.array(
          z.object({
            dosage: z.object({
              unit: z.string(),
              value: z.number().nonnegative(),
            }),
            mass: z.object({
              unit: z.string(),
              weight: z.number().nonnegative(),
            }),
            pack: z.number().nonnegative(),
          }),
        ),
      }),
    ),
    efficacy_table: z.array(
      z.object({
        species: z.string(),
        third_stage: z.string(),
        fourth_stage: z.string(),
        adults: z.string(),
      }),
    ),
    efficacy: z.array(
      z.object({
        name: z.string(),
        value: z.string(),
      }),
    ),
    key_map: z.object({
      type: z.string(),
      values: z.array(
        z.object({
          name: z.string(),
          value: z.string(),
        }),
      ),
    }),
  }),
})

export const FormProductSchema = ProductSchema.omit({
  admin: true,
})

ApplicationUserSchema.required({
  name: true,
  scale: true,
  phone: true,
  email: true,
  address: true,
  city: true,
  province: true,
  main_activity: true,
  specialization: true,
  specializations: true,
  type: true,
})

// ProducerPriceListSchema.required({
//   client_id: true,
//   client_name: true,
//   client_specialization: true,
//   effectiveDate: true,
// })

export const EditApplicationUserSchema = ApplicationUserSchema.pick({
  id: true,
  name: true,
  email: true,
  address: true,
  city: true,
  province: true,
  phone: true,
  main_activity: true,
  specialization: true,
  specializations: true,
  type: true,
  scale: true,
  branches: true,
  short_description: true,
  payment_terms: true,
})

export const ApplicationUserIDSchema = ApplicationUserSchema.pick({
  id: true,
})

export type ApplicationUser = z.infer<typeof ApplicationUserSchema>
export type ApplicationUserID = z.infer<typeof ApplicationUserIDSchema>
export type EditApplicationUser = z.infer<typeof EditApplicationUserSchema>

export type ProducerPriceList = z.infer<typeof ProducerPriceListSchema>
export type ProductItem = z.infer<typeof ProductSchema>
export type FormProductModel = z.infer<typeof FormProductSchema>

export type ImageModel = {
  img: {
    id: string
    src: string
  }
}

export const FarmProduceCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
})

export type FarmProduceCategory = z.infer<typeof FarmProduceCategorySchema>

export const FarmProduceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  category_id: z.string(),
  category_slug: z.string(),
})

export type FarmProduce = z.infer<typeof FarmProduceSchema>
