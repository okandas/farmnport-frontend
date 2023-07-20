import * as z from "zod"

export const adminAuthSchema = z.object({
  email: z.string().nonempty().email(),
  password: z.string().nonempty(),
})

export type authenticatedUser = {
  admin: boolean
  banned: boolean
  exp: number
  iat: number
  id: string
  iss: string
  subject: string
  username: string
}
