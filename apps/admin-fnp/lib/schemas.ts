import * as z from "zod"

export const AdminAuthSchema = z.object({
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

export type ClientDataResponse = {
  total: number
  data: ApplicationUser[]
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

export const ProductPriceListSchema = z.object({
  id: z.string(),
  effectiveDate: z.string(),
  beef: z.object({
    super: z.number(),
    choice: z.number(),
    commercial: z.number(),
    economy: z.number(),
    manufacturing: z.number(),
    condemned: z.number(),
    detained: z.string(),
  }),
  lamb: z.object({
    superPremium: z.number(),
    choice: z.number(),
    standard: z.number(),
    inferior: z.number(),
  }),
  mutton: z.object({
    super: z.number(),
    choice: z.number(),
    standard: z.number(),
    oridnary: z.number(),
    inferior: z.number(),
  }),
  goat: z.object({
    super: z.number(),
    choice: z.number(),
    standard: z.number(),
    inferior: z.number(),
  }),
  chicken: z.object({
    below: z.number(),
    midRange: z.number(),
    above: z.number(),
    condemned: z.number(),
  }),
  pork: z.object({
    super: z.number(),
    manufacturing: z.number(),
    head: z.number(),
  }),
  catering: z.object({
    chicken: z.number(),
  }),
  unit: z.string(),
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

export const AdminEditApplicationUserSchema = ApplicationUserSchema.pick({
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

export const AdminApplicationUserIDSchema = ApplicationUserSchema.pick({
  id: true,
})

export type ApplicationUser = z.infer<typeof ApplicationUserSchema>
export type ProducerPriceList = z.infer<typeof ProductPriceListSchema>

export type AdminEditApplicationUser = z.infer<
  typeof AdminEditApplicationUserSchema
>

export type AdminApplicationUserID = z.infer<
  typeof AdminApplicationUserIDSchema
>
