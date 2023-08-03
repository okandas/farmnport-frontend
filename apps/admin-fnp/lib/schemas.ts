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

export type ApplicationUser = {
  id: string
  name: string
  short_description: string
  scale: string
  code: string
  phone: string
  branches: number
  email: string
  address: string
  city: string
  province: string
  specialization: string
  main_activity: string
  specializations: string[]
  created: string
  updated: string
  verified: boolean
  confirmed: boolean
  location: Record<string, string | number[]>
  type: string
  admin: Record<string, string | boolean>
  phase: string
}
