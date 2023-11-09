import * as z from "zod"

export const AuthSchema = z.object({
  email: z.string().nonempty().email(),
  password: z.string().nonempty(),
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
  short_description: z.string().optional(),
  scale: z.string().nonempty(),
  code: z.string(),
  phone: z.string().min(5),
  branches: z.coerce.number().positive(),
  email: z.string().nonempty().email(),
  address: z.string().min(10),
  city: z.string().min(5).nonempty(),
  province: z.string().nonempty(),
  specialization: z.string().nonempty(),
  main_activity: z.string().nonempty(),
  specializations: z.array(z.string().trim()).min(1),
  created: z.string(),
  updated: z.string(),
  confirmed: z.boolean(),
  type: z.string().nonempty(),
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
})

export const ProducerPriceListSchema = z.object({
  id: z.string(),
  client_id: z.string().length(24).nonempty(),
  client_name: z.string(),
  client_specialization: z.string(),
  effectiveDate: z.coerce.date(),
  beef: z.object({
    super: z.coerce.number().nonnegative(),
    choice: z.coerce.number().nonnegative(),
    commercial: z.coerce.number().nonnegative(),
    economy: z.coerce.number().nonnegative(),
    manufacturing: z.coerce.number().nonnegative(),
    condemned: z.coerce.number().nonnegative(),
    detained: z.string(),
    hasPrice: z.boolean(),
  }),
  lamb: z.object({
    superPremium: z.coerce.number().nonnegative(),
    choice: z.coerce.number().nonnegative(),
    standard: z.coerce.number().nonnegative(),
    inferior: z.coerce.number().nonnegative(),
    hasPrice: z.boolean(),
  }),
  mutton: z.object({
    super: z.coerce.number().nonnegative(),
    choice: z.coerce.number().nonnegative(),
    standard: z.coerce.number().nonnegative(),
    oridnary: z.coerce.number().nonnegative(),
    inferior: z.coerce.number().nonnegative(),
    hasPrice: z.boolean(),
  }),
  goat: z.object({
    super: z.coerce.number().nonnegative(),
    choice: z.coerce.number().nonnegative(),
    standard: z.coerce.number().nonnegative(),
    inferior: z.coerce.number().nonnegative(),
    hasPrice: z.boolean(),
  }),
  chicken: z.object({
    below: z.coerce.number().nonnegative(),
    midRange: z.coerce.number().nonnegative(),
    above: z.coerce.number().nonnegative(),
    condemned: z.coerce.number().nonnegative(),
    hasPrice: z.boolean(),
  }),
  pork: z.object({
    super: z.coerce.number().nonnegative(),
    manufacturing: z.coerce.number().nonnegative(),
    head: z.coerce.number().nonnegative(),
    hasPrice: z.boolean(),
  }),
  catering: z.object({
    chicken: z.coerce.number().nonnegative(),
    hasPrice: z.boolean(),
  }),
  unit: z.string().nonempty(),
})

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string().nonempty(),
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
      name: z.string().nonempty(),
      value: z.coerce.number(),
    })
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
        name: z.string().nonempty(),
        value: z.string().nonempty(),
      }),
    ),
    examples: z.array(z.object({
      description: z.string().optional(),
      values: z.array(z.object({
        dosage: z.object({
          unit: z.string(),
          value: z.number(),
        }),
        mass: z.object({
          unit: z.string(),
          weight: z.number(),
        }),
        pack: z.number()
      }))
    })),
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
      )
    }),
  }),
})

export const FormProductSchema = ProductSchema.omit({
  admin: true,
  created: true,
  updated: true
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

ProducerPriceListSchema.required({
  client_id: true,
  client_name: true,
  client_specialization: true,
  effectiveDate: true,
})

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
    id: string,
    src: string
  }
}
