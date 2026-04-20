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
  // ObjectID reference fields
  primary_category_id: z.string().optional(),
  main_produce_id: z.string().optional(),
  other_produce_ids: z.array(z.string()).optional(),
  // Populated objects from API (only for display, not for editing)
  primary_category: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
  }).optional(),
  main_produce: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    category_id: z.string(),
  }).optional(),
  other_produce: z.array(z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    category_id: z.string(),
  })).optional(),
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
  archived: z.boolean().optional(),
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
      farm_produce_id: z.string(),
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
      farm_produce_id: z.string(),
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
      farm_produce_id: z.string(),
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
    slaughter: z.object({
      cattle: z.object({
        farm_produce_id: z.string(),
        pricing: pricingSchema,
      }),
      sheep: z.object({
        farm_produce_id: z.string(),
        pricing: pricingSchema,
      }),
      pigs: z.object({
        farm_produce_id: z.string(),
        pricing: pricingSchema,
      }),
      chicken: z.object({
        farm_produce_id: z.string(),
        pricing: pricingSchema,
      }),
      hasPrice: z.boolean(),
      hasCollectedPrice: z.boolean(),
    }),
    goat: z.object({
      farm_produce_id: z.string(),
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
      farm_produce_id: z.string(),
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
      farm_produce_id: z.string(),
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
      farm_produce_id: z.string(),
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
    pricing_basis: z.string(),
    notes: z.array(z.string()).default([]),
    overwrite: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const chickenUnselected = !data.chicken.hasPrice
    const beefUnselected = !data.beef.hasPrice
    const porkUnselected = !data.pork.hasPrice
    const slaughterUnselected = !data.slaughter.hasPrice
    const goatUnselected = !data.goat.hasPrice
    const muttonUnselected = !data.mutton.hasPrice
    const lambUnselected = !data.lamb.hasPrice
    const cateringUnselected = !data.catering.hasPrice

    if (
      chickenUnselected &&
      porkUnselected &&
      slaughterUnselected &&
      beefUnselected &&
      goatUnselected &&
      muttonUnselected &&
      lambUnselected &&
      cateringUnselected
    ) {
      ctx.addIssue({
        path: ["client_id"], // attach to root
        code: z.ZodIssueCode.custom,
        message: "At least one pricing category must be selected",
      })
    }
  })

export const BrandSchema = z.object({
  id: z.string(),
  name: z.string(),
  slogan: z.string().optional(),
  slug: z.string(),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const AgroChemicalCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  short_description: z.string().max(100, "Short description cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters"),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormAgroChemicalCategorySchema = AgroChemicalCategorySchema.pick({
  id: true,
  name: true,
  short_description: true,
  description: true,
})

export const AgroChemicalActiveIngredientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  short_description: z.string().max(100, "Short description cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters"),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormAgroChemicalActiveIngredientSchema = AgroChemicalActiveIngredientSchema.pick({
  id: true,
  name: true,
  short_description: true,
  description: true,
})

export const AgroChemicalTargetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  scientific_name: z.string().optional(),
  description: z.string().optional(),
  damage_type: z.string().optional(),
  remark: z.string().optional(),
  slug: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormAgroChemicalTargetSchema = AgroChemicalTargetSchema.pick({
  id: true,
  name: true,
  scientific_name: true,
  description: true,
  damage_type: true,
  remark: true,
})

export const CropGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().max(500, "Description cannot exceed 500 characters"),
  farm_produce_ids: z.array(z.string()).min(1, "At least one crop is required"),
  farm_produce_items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  })).optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormCropGroupSchema = CropGroupSchema.pick({
  id: true,
  name: true,
  description: true,
  farm_produce_ids: true,
})

export const WeedGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().max(500, "Description cannot exceed 500 characters"),
  target_ids: z.array(z.string()).min(1, "At least one target is required"),
  target_items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  })).optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormWeedGroupSchema = WeedGroupSchema.pick({
  id: true,
  name: true,
  description: true,
  target_ids: true,
})

export const AgroChemicalDosageRateSchema = z.object({
  id: z.string(),
  agrochemical_id: z.string().min(1, "AgroChemical is required"),
  farm_produce_id: z.string().min(1, "Crop is required"),
  target_ids: z.array(z.string()).min(1, "At least one target is required"),
  dosage: z.string().min(1, "Dosage is required"),
  max_applications: z.coerce.number().positive("Maximum applications must be positive"),
  application_interval: z.string().min(1, "Application interval is required"),
  phi: z.string().optional(),
  remarks: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormAgroChemicalDosageRateSchema = AgroChemicalDosageRateSchema.pick({
  id: true,
  agrochemical_id: true,
  farm_produce_id: true,
  target_ids: true,
  dosage: true,
  max_applications: true,
  application_interval: true,
  phi: true,
  remarks: true,
})

export type AgroChemicalDosageRate = z.infer<typeof AgroChemicalDosageRateSchema>
export type FormAgroChemicalDosageRateModel = z.infer<typeof FormAgroChemicalDosageRateSchema>

export const AgroChemicalSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  brand_id: z.string().min(1, "Brand is required"),
  brand: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  agrochemical_category_id: z.string().min(1, "Agrochemical category is required"),
  agrochemical_category: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }).optional(),
  front_label: z.custom<ImageModel>().optional(),
  back_label: z.custom<ImageModel>().optional(),
  images: z.array(z.custom<ImageModel>()).max(5, "Maximum 5 images allowed"),
  active_ingredients: z.array(z.object({
    id: z.string(),
    name: z.string(),
    dosage_value: z.number(),
    dosage_unit: z.string(),
  })),
  dosage_rates: z.array(z.object({
    id: z.string(),
    crop: z.string(),
    crop_id: z.string(),
    crop_group: z.string().optional(),
    crop_group_id: z.string().optional(),
    weed_group: z.string().optional(),
    weed_group_id: z.string().optional(),
    targets: z.array(z.string()),
    target_ids: z.array(z.string()),
    entries: z.array(z.object({
      dosage: z.object({
        value: z.string(),
        unit: z.string(),
        per: z.string(),
      }),
      max_applications: z.object({
        max: z.number(),
        note: z.string(),
      }),
      application_interval: z.string(),
      phi: z.string(),
      remarks: z.array(z.string()),
    })),
  })),
  variants: z.array(z.object({
    sku: z.string(),
    name: z.string().min(1, "Variant name is required"),
    sale_price: z.coerce.number().nonnegative().default(0),
    was_price: z.coerce.number().nonnegative().default(0),
    wholesale_price: z.coerce.number().nonnegative().default(0),
    stock_level: z.coerce.number().int().nonnegative().default(0),
  })).optional().default([]),
  precautions: z.array(z.string()).optional().default([]),
  product_overview: z.string().optional().default(""),
  stock_level: z.coerce.number().int().nonnegative().default(0),
  available_for_sale: z.boolean().default(false),
  show_price: z.boolean().default(true),
  sale_price: z.coerce.number().nonnegative().default(0),
  was_price: z.coerce.number().nonnegative().default(0),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const ActiveIngredientRelationSchema = z.object({
  id: z.string(),
  name: z.string(),
  dosage_value: z.number().min(0, "Dosage value must be positive"),
  dosage_unit: z.string().min(1, "Dosage unit is required"),
})

export const DosageRateSchema = z.object({
  id: z.string(),
  crop: z.string(),
  crop_id: z.string(),
  crop_group: z.string().optional(),
  crop_group_id: z.string().optional(),
  weed_group: z.string().optional(),
  weed_group_id: z.string().optional(),
  targets: z.array(z.string()),
  target_ids: z.array(z.string()),
  entries: z.array(z.object({
    dosage: z.object({
      value: z.string(),
      unit: z.string(),
      per: z.string(),
    }),
    max_applications: z.object({
      max: z.number(),
      note: z.string(),
    }),
    application_interval: z.string(),
    phi: z.string(),
    remarks: z.array(z.string()),
  })),
})

export const FormAgroChemicalSchema = AgroChemicalSchema

ApplicationUserSchema.required({
  name: true,
  scale: true,
  phone: true,
  email: true,
  address: true,
  city: true,
  province: true,
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
  primary_category_id: true,
  main_produce_id: true,
  other_produce_ids: true,
  type: true,
  scale: true,
  branches: true,
  short_description: true,
  payment_terms: true,
}).extend({
  email: z.string().email().optional().or(z.literal("")),
})

export const ApplicationUserIDSchema = ApplicationUserSchema.pick({
  id: true,
})

export type ApplicationUser = z.infer<typeof ApplicationUserSchema>
export type ApplicationUserID = z.infer<typeof ApplicationUserIDSchema>
export type EditApplicationUser = z.infer<typeof EditApplicationUserSchema>

export type ProducerPriceList = z.infer<typeof ProducerPriceListSchema>
export type Brand = z.infer<typeof BrandSchema>
export type AgroChemicalCategory = z.infer<typeof AgroChemicalCategorySchema>
export type FormAgroChemicalCategoryModel = z.infer<typeof FormAgroChemicalCategorySchema>
export type AgroChemicalActiveIngredient = z.infer<typeof AgroChemicalActiveIngredientSchema>
export type FormAgroChemicalActiveIngredientModel = z.infer<typeof FormAgroChemicalActiveIngredientSchema>
export type AgroChemicalTarget = z.infer<typeof AgroChemicalTargetSchema>
export type FormAgroChemicalTargetModel = z.infer<typeof FormAgroChemicalTargetSchema>
export type AgroChemicalItem = z.infer<typeof AgroChemicalSchema>
export type FormAgroChemicalModel = z.infer<typeof FormAgroChemicalSchema>
export type CropGroup = z.infer<typeof CropGroupSchema>
export type FormCropGroupModel = z.infer<typeof FormCropGroupSchema>
export type WeedGroup = z.infer<typeof WeedGroupSchema>
export type FormWeedGroupModel = z.infer<typeof FormWeedGroupSchema>

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

export const FormFarmProduceCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().max(500, "Description must be 500 characters or less").optional().default(""),
})

export type FormFarmProduceCategoryModel = z.infer<typeof FormFarmProduceCategorySchema>

export const FarmProduceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  category_id: z.string(),
  category_slug: z.string(),
})

export type FarmProduce = z.infer<typeof FarmProduceSchema>

export type FarmProduceCategoriesResponse = {
  total: number
  data: FarmProduceCategory[]
}

export type FarmProduceResponse = {
  total: number
  data: FarmProduce[]
}

// Animal Health Schemas

export const AnimalHealthCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  short_description: z.string().max(100, "Short description cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters"),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormAnimalHealthCategorySchema = AnimalHealthCategorySchema.pick({
  id: true,
  name: true,
  short_description: true,
  description: true,
})

export const AnimalHealthActiveIngredientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  short_description: z.string().max(100, "Short description cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters"),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormAnimalHealthActiveIngredientSchema = AnimalHealthActiveIngredientSchema.pick({
  id: true,
  name: true,
  short_description: true,
  description: true,
})

export const AnimalHealthTargetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  scientific_name: z.string().optional(),
  description: z.string().optional(),
  damage_type: z.string().optional(),
  remark: z.string().optional(),
  slug: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormAnimalHealthTargetSchema = AnimalHealthTargetSchema.pick({
  id: true,
  name: true,
  scientific_name: true,
  description: true,
  damage_type: true,
  remark: true,
})

export const AnimalHealthProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  brand_id: z.string().min(1, "Brand is required"),
  brand: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  animal_health_category_id: z.string().min(1, "Animal health category is required"),
  animal_health_category: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }).optional(),
  front_label: z.custom<ImageModel>().optional(),
  back_label: z.custom<ImageModel>().optional(),
  images: z.array(z.custom<ImageModel>()).max(5, "Maximum 5 images allowed"),
  active_ingredients: z.array(z.object({
    id: z.string(),
    name: z.string(),
    dosage_value: z.number(),
    dosage_unit: z.string(),
  })),
  dosage_rates: z.array(z.object({
    id: z.string(),
    animal: z.string(),
    animal_id: z.string(),
    animal_group: z.string().optional(),
    animal_group_id: z.string().optional(),
    targets: z.array(z.string()),
    target_ids: z.array(z.string()),
    entries: z.array(z.object({
      dosage: z.object({
        value: z.string(),
        unit: z.string(),
        per: z.string(),
      }),
      max_applications: z.object({
        max: z.number(),
        note: z.string(),
      }),
      application_interval: z.string(),
      withdrawal_period: z.string(),
      remarks: z.array(z.string()),
    })),
  })),
  stock_level: z.coerce.number().int().nonnegative().default(0),
  available_for_sale: z.boolean().default(false),
  show_price: z.boolean().default(true),
  sale_price: z.coerce.number().nonnegative().default(0),
  was_price: z.coerce.number().nonnegative().default(0),
  variants: z.array(z.object({
    sku: z.string().default(""),
    name: z.string().min(1, "Variant name is required"),
    stock_level: z.coerce.number().int().nonnegative().default(0),
    sale_price: z.coerce.number().nonnegative().default(0),
    was_price: z.coerce.number().nonnegative().default(0),
    wholesale_price: z.coerce.number().nonnegative().default(0),
  })).default([]),
  precautions: z.array(z.string()).default([]),
  status: z.enum(["active", "inactive"]).default("active"),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormAnimalHealthProductSchema = AnimalHealthProductSchema

export type AnimalHealthCategory = z.infer<typeof AnimalHealthCategorySchema>
export type FormAnimalHealthCategoryModel = z.infer<typeof FormAnimalHealthCategorySchema>
export type AnimalHealthActiveIngredient = z.infer<typeof AnimalHealthActiveIngredientSchema>
export type FormAnimalHealthActiveIngredientModel = z.infer<typeof FormAnimalHealthActiveIngredientSchema>
export type AnimalHealthTarget = z.infer<typeof AnimalHealthTargetSchema>
export type FormAnimalHealthTargetModel = z.infer<typeof FormAnimalHealthTargetSchema>
export type AnimalHealthProduct = z.infer<typeof AnimalHealthProductSchema>
export type FormAnimalHealthProductModel = z.infer<typeof FormAnimalHealthProductSchema>

// Spray Program Schemas

export const SprayProgramRecommendationSchema = z.object({
  agrochemical_id: z.string().min(1, "Agrochemical is required"),
  agrochemical_name: z.string(),
  agrochemical_slug: z.string(),
  purpose: z.string().min(1, "Purpose is required"),
  dosage: z.object({
    value: z.string(),
    unit: z.string(),
    per: z.string(),
  }),
  application_method: z.string(),
  notes: z.string().optional().default(""),
})

export const SprayProgramStageSchema = z.object({
  name: z.string().min(1, "Stage name is required"),
  order: z.number(),
  description: z.string().optional().default(""),
  timing_description: z.string().optional().default(""),
  recommendations: z.array(SprayProgramRecommendationSchema),
})

export const SprayProgramSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  slug: z.string().optional(),
  description: z.string().optional().default(""),
  farm_produce_id: z.string().min(1, "Crop is required"),
  farm_produce_name: z.string().optional(),
  cover_image: z.custom<ImageModel>().optional().nullable(),
  stages: z.array(SprayProgramStageSchema).min(1, "At least one stage is required"),
  published: z.boolean().default(false),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormSprayProgramSchema = SprayProgramSchema

export type SprayProgram = z.infer<typeof SprayProgramSchema>
export type FormSprayProgramModel = z.infer<typeof FormSprayProgramSchema>
export type SprayProgramStage = z.infer<typeof SprayProgramStageSchema>
export type SprayProgramRecommendation = z.infer<typeof SprayProgramRecommendationSchema>

// Feed Schemas

export const FeedCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  short_description: z.string().max(100, "Short description cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters"),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormFeedCategorySchema = FeedCategorySchema.pick({
  id: true,
  name: true,
  short_description: true,
  description: true,
})

export const FeedActiveIngredientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  short_description: z.string().max(100, "Short description cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters"),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormFeedActiveIngredientSchema = FeedActiveIngredientSchema.pick({
  id: true,
  name: true,
  short_description: true,
  description: true,
})

export const FeedNutritionalSpecSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  short_description: z.string().max(100, "Short description cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters"),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormFeedNutritionalSpecSchema = FeedNutritionalSpecSchema.pick({
  id: true,
  name: true,
  short_description: true,
  description: true,
})

export const FeedTargetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  scientific_name: z.string().optional(),
  description: z.string().optional(),
  damage_type: z.string().optional(),
  remark: z.string().optional(),
  slug: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormFeedTargetSchema = FeedTargetSchema.pick({
  id: true,
  name: true,
  scientific_name: true,
  description: true,
  damage_type: true,
  remark: true,
})

export const FeedProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  brand_id: z.string().min(1, "Brand is required"),
  brand: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  feed_category_id: z.string().min(1, "Feed category is required"),
  feed_category: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }).optional(),
  animal: z.string().min(1, "Animal type is required"),
  phase: z.string().min(1, "Phase is required"),
  form: z.string().min(1, "Form is required"),
  description: z.string().optional().default(""),
  sub_type: z.string().optional().default(""),
  breed_recommendations: z.string().optional().default(""),
  feeding_instructions: z.array(z.object({
    period: z.string(),
    amount: z.string(),
    notes: z.string(),
  })).optional().default([]),
  management_tips: z.string().optional().default(""),
  safety_warnings: z.string().optional().default(""),
  package_size: z.string().optional().default(""),
  front_label: z.custom<ImageModel>().optional(),
  back_label: z.custom<ImageModel>().optional(),
  images: z.array(z.custom<ImageModel>()).max(5, "Maximum 5 images allowed"),
  active_ingredients: z.array(z.object({
    id: z.string(),
    name: z.string(),
    concentration: z.string(),
  })),
  targets: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
  nutritional_specs: z.array(z.object({
    id: z.string(),
    feed_product_id: z.string(),
    nutritional_spec_id: z.string(),
    name: z.string().default(""),
    value: z.string(),
    unit: z.string(),
    qualifier: z.string(),
  })).optional().default([]),
  mixing_recommendations: z.array(z.object({
    name: z.string(),
    batch_size: z.string(),
    resulting_protein: z.string(),
    notes: z.string(),
    ingredients: z.array(z.object({
      name: z.string(),
      quantity: z.string(),
      unit: z.string(),
    })).optional().default([]),
  })).optional().default([]),
  adaptation_schedule: z.array(z.object({
    day: z.string(),
    amount: z.string(),
    notes: z.string(),
  })).optional().default([]),
  stock_level: z.coerce.number().int().nonnegative().default(0),
  available_for_sale: z.boolean().default(false),
  show_price: z.boolean().default(true),
  sale_price: z.coerce.number().nonnegative().default(0),
  was_price: z.coerce.number().nonnegative().default(0),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormFeedProductSchema = FeedProductSchema

export const FeedingProgramRecommendationSchema = z.object({
  feed_product_id: z.string().min(1, "Feed product is required"),
  feed_product_name: z.string(),
  feed_product_slug: z.string(),
  purpose: z.string().min(1, "Purpose is required"),
  notes: z.string().optional().default(""),
})

export const FeedingProgramStageSchema = z.object({
  name: z.string().min(1, "Stage name is required"),
  order: z.number(),
  description: z.string().optional().default(""),
  timing_description: z.string().optional().default(""),
  recommendations: z.array(FeedingProgramRecommendationSchema),
})

export const FeedingProgramSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  slug: z.string().optional(),
  description: z.string().optional().default(""),
  farm_produce_id: z.string().min(1, "Animal type is required"),
  farm_produce_name: z.string().optional(),
  cover_image: z.custom<ImageModel>().optional().nullable(),
  stages: z.array(FeedingProgramStageSchema).min(1, "At least one stage is required"),
  published: z.boolean().default(false),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormFeedingProgramSchema = FeedingProgramSchema

export type FeedCategory = z.infer<typeof FeedCategorySchema>
export type FormFeedCategoryModel = z.infer<typeof FormFeedCategorySchema>
export type FeedActiveIngredient = z.infer<typeof FeedActiveIngredientSchema>
export type FormFeedActiveIngredientModel = z.infer<typeof FormFeedActiveIngredientSchema>
export type FeedNutritionalSpec = z.infer<typeof FeedNutritionalSpecSchema>
export type FormFeedNutritionalSpecModel = z.infer<typeof FormFeedNutritionalSpecSchema>
export type FeedTarget = z.infer<typeof FeedTargetSchema>
export type FormFeedTargetModel = z.infer<typeof FormFeedTargetSchema>
export type FeedProduct = z.infer<typeof FeedProductSchema>
export type FormFeedProductModel = z.infer<typeof FormFeedProductSchema>
export type FeedingProgram = z.infer<typeof FeedingProgramSchema>
export type FormFeedingProgramModel = z.infer<typeof FormFeedingProgramSchema>
export type FeedingProgramStage = z.infer<typeof FeedingProgramStageSchema>
export type FeedingProgramRecommendation = z.infer<typeof FeedingProgramRecommendationSchema>

// CDM (Cold Dress Mass) Schemas

const CarcassGradePriceSchema = z.object({
  collected_usd: z.coerce.number().nonnegative(),
  delivered_usd: z.coerce.number().nonnegative(),
  collected_zig: z.coerce.number().nonnegative(),
  delivered_zig: z.coerce.number().nonnegative(),
})

const CarcassGradesSchema = z.object({
  commercial: CarcassGradePriceSchema,
  economy: CarcassGradePriceSchema,
  manufacturing: CarcassGradePriceSchema,
})

const LiveweightEntrySchema = z.object({
  weight_range: z.string().min(1, "Weight range is required"),
  teeth: z.string().min(1, "Teeth category is required"),
  delivered_usd: z.coerce.number().nonnegative(),
  delivered_zig: z.coerce.number().nonnegative(),
  grade_note: z.string().optional().default(""),
})

export const CdmPriceSchema = z.object({
  id: z.string(),
  created: z.string().optional(),
  updated: z.string().optional(),
  client_id: z.string().min(1, "Client is required"),
  client_name: z.string(),
  verified: z.boolean().optional(),
  effectiveDate: z.coerce.date(),
  exchange_rate: z.coerce.number().positive("Exchange rate must be positive"),
  carcass_grades: CarcassGradesSchema,
  liveweight: z.array(LiveweightEntrySchema),
  notes: z.array(z.string()).default([]),
})

export type CdmPrice = z.infer<typeof CdmPriceSchema>
export type CarcassGradePrice = z.infer<typeof CarcassGradePriceSchema>
export type LiveweightEntry = z.infer<typeof LiveweightEntrySchema>

export type CdmPriceResponse = {
  total: number
  data: CdmPrice[]
}

// Restaurant
export const RestaurantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Restaurant name is required").max(120, "Name cannot exceed 120 characters"),
  slug: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(["active", "inactive", "closed"]).default("active"),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormRestaurantSchema = RestaurantSchema.pick({
  name: true,
  featured: true,
  status: true,
})

export type Restaurant = z.infer<typeof RestaurantSchema>
export type FormRestaurantModel = z.infer<typeof FormRestaurantSchema>

export type RestaurantResponse = {
  total: number
  data: Restaurant[]
}

// Restaurant Location
export const OperatingHourSchema = z.object({
  day: z.string(),
  open: z.string().default("07:00"),
  close: z.string().default("23:00"),
  closed: z.boolean().default(false),
})

export const RestaurantLocationSchema = z.object({
  id: z.string(),
  restaurant_id: z.string().min(1, "Restaurant is required"),
  restaurant_name: z.string().optional(),
  name: z.string().min(1, "Location name is required").max(120, "Name cannot exceed 120 characters"),
  address: z.string().min(1, "Address is required"),
  city: z.string().default(""),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  latitude: z.coerce.number().optional().default(0),
  longitude: z.coerce.number().optional().default(0),
  place_id: z.string().optional().default(""),
  whatsapp_available: z.boolean().default(false),
  show_number: z.boolean().default(false),
  is_main: z.boolean().default(false),
  operating_hours: z.array(OperatingHourSchema).default([]),
  status: z.enum(["active", "inactive", "closed"]).default("active"),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormRestaurantLocationSchema = RestaurantLocationSchema.pick({
  restaurant_id: true,
  name: true,
  address: true,
  city: true,
  phone: true,
  email: true,
  latitude: true,
  longitude: true,
  place_id: true,
  operating_hours: true,
  status: true,
}).extend({
  city: z.string().min(1, "City is required"),
})

export type OperatingHour = z.infer<typeof OperatingHourSchema>

export type RestaurantLocation = z.infer<typeof RestaurantLocationSchema>
export type FormRestaurantLocationModel = z.infer<typeof FormRestaurantLocationSchema>

export type RestaurantLocationResponse = {
  total: number
  data: RestaurantLocation[]
}

// Menu
export const MenuLocationEntrySchema = z.object({
  location_id: z.string(),
  location_name: z.string(),
})

export const MenuSchema = z.object({
  id: z.string(),
  locations: z.array(MenuLocationEntrySchema).default([]),
  name: z.string().min(1, "Menu name is required").max(120, "Name cannot exceed 120 characters"),
  note: z.string().optional().default(""),
  slug: z.string().optional(),
  category_notes: z.record(z.string(), z.string()).optional().default({}),
  status: z.enum(["active", "inactive"]).default("active"),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormMenuSchema = MenuSchema.pick({
  name: true,
  note: true,
  status: true,
}).extend({
  locations: z.array(MenuLocationEntrySchema).default([]),
  category_notes: z.record(z.string(), z.string()).optional().default({}),
})

export type MenuLocationEntry = z.infer<typeof MenuLocationEntrySchema>

export type Menu = z.infer<typeof MenuSchema>
export type FormMenuModel = z.infer<typeof FormMenuSchema>

export type MenuResponse = {
  total: number
  data: Menu[]
}

// Menu Item Category
export const MenuItemCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").max(120, "Name cannot exceed 120 characters"),
  description: z.string().default(""),
  slug: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormMenuItemCategorySchema = MenuItemCategorySchema.pick({
  name: true,
})

export type MenuItemCategory = z.infer<typeof MenuItemCategorySchema>
export type FormMenuItemCategoryModel = z.infer<typeof FormMenuItemCategorySchema>

export type MenuItemCategoryResponse = {
  total: number
  data: MenuItemCategory[]
}

// Menu Category
export const MenuCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").max(120, "Name cannot exceed 120 characters"),
  description: z.string().default(""),
  slug: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormMenuCategorySchema = MenuCategorySchema.pick({
  name: true,
  description: true,
})

export type MenuCategory = z.infer<typeof MenuCategorySchema>
export type FormMenuCategoryModel = z.infer<typeof FormMenuCategorySchema>

export type MenuCategoryResponse = {
  total: number
  data: MenuCategory[]
}

// Cuisine Category
export const CuisineCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").max(120, "Name cannot exceed 120 characters"),
  description: z.string().default(""),
  slug: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormCuisineCategorySchema = CuisineCategorySchema.pick({
  name: true,
  description: true,
})

export type CuisineCategory = z.infer<typeof CuisineCategorySchema>
export type FormCuisineCategoryModel = z.infer<typeof FormCuisineCategorySchema>

export type CuisineCategoryResponse = {
  total: number
  data: CuisineCategory[]
}

// Restaurant Cuisine (junction)
export const RestaurantCuisineSchema = z.object({
  id: z.string(),
  restaurant_id: z.string(),
  restaurant_name: z.string(),
  cuisine_category_id: z.string(),
  cuisine_category_name: z.string(),
  cuisine_category_slug: z.string(),
  created: z.string().optional(),
})

export type RestaurantCuisine = z.infer<typeof RestaurantCuisineSchema>

// Menu Item Component
export const MenuItemComponentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").max(120, "Name cannot exceed 120 characters"),
  slug: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormMenuItemComponentSchema = MenuItemComponentSchema.pick({
  name: true,
})

export type MenuItemComponent = z.infer<typeof MenuItemComponentSchema>
export type FormMenuItemComponentModel = z.infer<typeof FormMenuItemComponentSchema>

export type MenuItemComponentResponse = {
  total: number
  data: MenuItemComponent[]
}

// Menu Item
export const CompositionEntrySchema = z.object({
  component_id: z.string(),
  component_name: z.string(),
})

export const MenuItemSizeSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  price_cents: z.number().default(0),
})

export const MenuItemSchema = z.object({
  id: z.string(),
  menu_id: z.string().min(1, "Menu is required"),
  menu_name: z.string().optional(),
  name: z.string().min(1, "Name is required").max(120, "Name cannot exceed 120 characters"),
  slug: z.string().optional(),
  description: z.string().optional().default(""),
  price_cents: z.number().default(0),
  price_on_request: z.boolean().default(false),
  category_id: z.string().min(1, "Category is required"),
  category_name: z.string().optional(),
  composition: z.array(CompositionEntrySchema).default([]),
  sizes: z.array(MenuItemSizeSchema).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(["active", "inactive"]).default("active"),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormMenuItemSchema = MenuItemSchema.pick({
  menu_id: true,
  name: true,
  description: true,
  price_cents: true,
  price_on_request: true,
  category_id: true,
  status: true,
}).extend({
  composition: z.array(CompositionEntrySchema).default([]),
  sizes: z.array(MenuItemSizeSchema).default([]),
  tags: z.array(z.string()).default([]),
})

export type CompositionEntry = z.infer<typeof CompositionEntrySchema>
export type MenuItem = z.infer<typeof MenuItemSchema>
export type FormMenuItemModel = z.infer<typeof FormMenuItemSchema>

export type MenuItemResponse = {
  total: number
  data: MenuItem[]
}

// Menu Item Add-On
export const MenuItemAddOnSchema = z.object({
  id: z.string(),
  menu_id: z.string().min(1, "Menu is required"),
  menu_name: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  category_name: z.string().optional(),
  name: z.string().min(1, "Name is required").max(120, "Name cannot exceed 120 characters"),
  slug: z.string().optional(),
  price_cents: z.number().default(0),
  composition: z.array(CompositionEntrySchema).default([]),
  status: z.enum(["active", "inactive"]).default("active"),
  created: z.string().optional(),
  updated: z.string().optional(),
})

export const FormMenuItemAddOnSchema = MenuItemAddOnSchema.pick({
  menu_id: true,
  category_id: true,
  name: true,
  price_cents: true,
  status: true,
}).extend({
  composition: z.array(CompositionEntrySchema).default([]),
})

export type MenuItemAddOn = z.infer<typeof MenuItemAddOnSchema>
export type FormMenuItemAddOnModel = z.infer<typeof FormMenuItemAddOnSchema>

export type MenuItemAddOnResponse = {
  total: number
  data: MenuItemAddOn[]
}
