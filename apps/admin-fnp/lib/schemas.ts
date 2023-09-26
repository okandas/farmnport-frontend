import * as z from "zod";

export const AdminAuthSchema = z.object({
  email: z.string().nonempty().email(),
  password: z.string().nonempty(),
});

export type AuthenticatedUser = {
  admin: boolean;
  banned: boolean;
  exp: number;
  iat: number;
  id: string;
  iss: string;
  subject: string;
  username: string;
};

export type LoginResponse = {
  token: string;
};

export type ProducerPriceListsResponse = {
  total: number;
  data: ProducerPriceList[];
};

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
});

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
});

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
});

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
});

export const AdminApplicationUserIDSchema = ApplicationUserSchema.pick({
  id: true,
});

export type ApplicationUser = z.infer<typeof ApplicationUserSchema>;
export type ProducerPriceList = z.infer<typeof ProducerPriceListSchema>;

export type AdminEditApplicationUser = z.infer<
  typeof AdminEditApplicationUserSchema
>;

export type AdminApplicationUserID = z.infer<
  typeof AdminApplicationUserIDSchema
>;
