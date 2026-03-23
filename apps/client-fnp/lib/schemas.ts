import * as z from "zod"

export const AuthSchema = z.object({
    email: z.string().nonempty().email(),
    password: z.string().nonempty(),
})

export const AuthSignUpSchema = z.object({
    name: z.string().min(4),
    email: z.string().email(),
    password: z.string().min(8),
    confirm_password: z.string().min(8),
    phone: z.string().min(10).max(10),
    address: z.string().min(10),
    city: z.string().min(4),
    province: z.string(),
    specialization: z.string().optional(), // Deprecated: use primary_category_id
    primary_category_id: z.string().length(24).optional(),
    main_activity: z.string().optional(), // Deprecated: use main_produce_id
    main_produce_id: z.string().length(24).optional(),
    specializations: z.array(z.string().trim()).optional(), // Deprecated: use other_produce_ids
    other_produce_ids: z.array(z.string().length(24)).optional(),
    type: z.string(),
    scale: z.string(),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirm_password'],
        message: "Passwords should match!",
      });
    }

    // Require either old or new fields during transition
    if (!data.primary_category_id && !data.specialization) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['primary_category_id'],
        message: "Primary focus is required",
      });
    }

    if (!data.main_produce_id && !data.main_activity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['main_produce_id'],
        message: "Main product is required",
      });
    }
})


export const ResetSchema = AuthSchema.pick({
    email: true
})
export type AuthenticatedUser = {
    bad_participant?: boolean
    admin?: boolean
    banned?: boolean
    exp?: number
    iat?: number
    id?: string
    iss?: string
    subject?: string
    username?: string
    type?: string
    token?: string
    email?: string | null
    emailVerified?: Date | null
    want_to_pay?: boolean
    subscription_active?: boolean
    impersonated_by?: string
} | undefined

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
    scale: z.string().nonempty(),
    code: z.string(),
    phone: z.string().min(5),
    branches: z.coerce.number().positive(),
    email: z.string().nonempty().email(),
    address: z.string().min(10),
    city: z.string().min(5).nonempty(),
    province: z.string().nonempty(),

    // ObjectID references
    primary_category_id: z.string().optional(),
    main_produce_id: z.string().optional(),
    other_produce_ids: z.array(z.string()).optional(),

    // Populated objects from backend
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
        description: z.string(),
        category_id: z.string().optional(),
        category_slug: z.string().optional(),
    }).optional(),
    other_produce: z.array(z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        description: z.string(),
        category_id: z.string().optional(),
        category_slug: z.string().optional(),
    })).optional(),

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
    payment_terms: z.string(),
    has_prices: z.boolean().optional(),
    contact_views: z.number().optional(),
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
            name: z.string().nonempty(),
            value: z.string().nonempty(),
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
            value: z.coerce.number().nonnegative(),
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
            name: z.string().nonempty(),
            value: z.string().nonempty(),
            location: z.string().nonempty(),
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
                    unit: z.string().nonempty(),
                    value: z.number().nonnegative(),
                }),
                mass: z.object({
                    unit: z.string().nonempty(),
                    weight: z.number().nonnegative(),
                }),
                pack: z.number().nonnegative()
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
                name: z.string().nonempty(),
                value: z.string().nonempty(),
            }),
        ),
        key_map: z.object({
            type: z.string(),
            values: z.array(
                z.object({
                    name: z.string().nonempty(),
                    value: z.string().nonempty(),
                }),
            )
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
    primary_category_id: true,
    main_produce_id: true,
    other_produce_ids: true,
    type: true,
    scale: true,
    branches: true,
    short_description: true,
    payment_terms: true
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


export const PagintionSchema = z.object({
    p: z.number().optional(),
    search: z.string().optional(),
    limit: z.number().optional(),
})

export type PaginationModel = z.infer<typeof PagintionSchema>

export type LoginFormData = z.infer<typeof AuthSchema>
export type ResetFormData = z.infer<typeof ResetSchema>
export type SignUpFormData = z.infer<typeof AuthSignUpSchema>

const base = process.env.NEXT_PUBLIC_BASE_URL
const version = "/v1"
export const BaseURL = base + version
export const AppURL = process.env.NEXT_PUBLIC_APP_URL
export const Debug = process.env.NEXT_PUBLIC_DEBUG == 'true'
export const Secret = process.env.NEXT_AUTH_SECRET
export const FeatureFlags = process.env.NEXT_PUBLIC_FEATURE_FLAGS


export type BuyerSeoCategoryKeys = | "beef" | "lamb" | "mutton" | "goat" | "chicken" | "pork"

export const BuyerSeo: Record<string, string>  = {
  // Livestock
  cattle: "Find cattle buyers in Zimbabwe. Sell beef cattle, dairy cows, and livestock directly to verified buyers offering competitive prices across all provinces.",
  pigs: "Connect with pig buyers in Zimbabwe. Sell pigs to abattoirs, pork processors, and traders at fair market prices.",
  sheep: "Find sheep buyers in Zimbabwe. Sell sheep and wool directly to abattoirs, butcheries, and livestock traders nationwide.",
  goats: "Connect with goat buyers in Zimbabwe. Sell goats to butcheries, traders, and communities at competitive prices.",
  chicken: "Looking for trusted chicken buyers and where to sell chickens in Zimbabwe? Connect with reliable poultry buyers who purchase broiler, free-range, and live chickens in bulk or retail.",
  ducks: "Find duck buyers in Zimbabwe. Sell ducks and duck eggs to restaurants, retailers, and traders across the country.",
  turkeys: "Connect with turkey buyers in Zimbabwe. Sell turkeys to hotels, restaurants, and retailers especially during festive seasons.",
  rabbits: "Find rabbit buyers in Zimbabwe. Sell rabbits to restaurants, butcheries, and health-conscious consumers.",
  ostriches: "Connect with ostrich buyers in Zimbabwe. Sell ostrich meat, leather, and feathers to processors and exporters.",
  // Meat & Poultry
  beef: "Find beef buyers in Zimbabwe. Sell quality beef to butcheries, supermarkets, and restaurants at competitive wholesale and retail prices.",
  pork: "Connect with pork buyers in Zimbabwe. Sell fresh pork to butcheries, processors, and retailers nationwide.",
  lamb: "Find lamb buyers in Zimbabwe. Sell premium lamb to butcheries, restaurants, and supermarkets at fair market prices.",
  mutton: "Connect with mutton buyers in Zimbabwe. Sell mutton to butcheries, wholesalers, and retail outlets across all provinces.",
  "goat-meat": "Find goat meat buyers in Zimbabwe. Sell chevon to butcheries, restaurants, and traders at competitive prices.",
  "chicken-meat": "Connect with chicken meat buyers in Zimbabwe. Sell dressed chicken to supermarkets, fast-food chains, and retailers.",
  // Dairy & Eggs
  "milk-raw": "Find raw milk buyers in Zimbabwe. Sell fresh milk to dairy processors, cheese makers, and direct consumers.",
  cheese: "Connect with cheese buyers in Zimbabwe. Sell artisanal and farm-produced cheese to retailers and restaurants.",
  yogurt: "Find yogurt buyers in Zimbabwe. Sell farm-fresh yogurt to supermarkets, health shops, and wholesale distributors.",
  butter: "Connect with butter buyers in Zimbabwe. Sell farm-produced butter to retailers, bakeries, and food processors.",
  "chicken-eggs": "Find egg buyers in Zimbabwe. Sell fresh chicken eggs to retailers, bakeries, and wholesalers at competitive prices.",
  "duck-eggs": "Connect with duck egg buyers in Zimbabwe. Sell duck eggs to speciality food shops and restaurants.",
  eggs: "Find egg buyers in Zimbabwe. Sell fresh eggs to supermarkets, bakeries, restaurants, and wholesale distributors at competitive prices.",
  // Grains & Cereals
  maize: "Connect with maize buyers in Zimbabwe. Sell your maize harvest directly to millers, traders, and bulk buyers at fair market prices.",
  wheat: "Find wheat buyers in Zimbabwe. Sell wheat directly to millers and grain traders at competitive market rates.",
  sorghum: "Connect with sorghum buyers in Zimbabwe. Sell sorghum to breweries, millers, and animal feed producers.",
  barley: "Find barley buyers in Zimbabwe. Sell malting and feed barley to breweries and livestock feed manufacturers.",
  oats: "Connect with oat buyers in Zimbabwe. Sell oats to food processors, millers, and animal feed producers.",
  rice: "Find rice buyers in Zimbabwe. Sell locally grown rice to retailers, wholesalers, and food service companies.",
  millet: "Connect with millet buyers in Zimbabwe. Sell millet to millers, breweries, and health food producers.",
  // Oilseeds & Legumes
  soybeans: "Find soybean buyers in Zimbabwe. Sell soya beans to oil expressers, feed manufacturers, and export traders.",
  soya: "Find soya bean buyers in Zimbabwe. Sell soya beans to oil expressers, feed manufacturers, and bulk traders at competitive prices.",
  sunflower: "Connect with sunflower buyers in Zimbabwe. Sell sunflower seed to oil processors and export traders.",
  groundnuts: "Find groundnut buyers in Zimbabwe. Sell peanuts to butter manufacturers, confectioneries, and export traders.",
  "dry-beans": "Connect with dry bean buyers in Zimbabwe. Sell beans to wholesalers, retailers, and food processors.",
  lentils: "Find lentil buyers in Zimbabwe. Sell lentils to food importers, retailers, and health food companies.",
  chickpeas: "Connect with chickpea buyers in Zimbabwe. Sell chickpeas to food processors and export traders.",
  // Vegetables
  potatoes: "Find potato buyers in Zimbabwe. Sell potatoes to retailers, chip manufacturers, and wholesale markets.",
  "sweet-potatoes": "Connect with sweet potato buyers in Zimbabwe. Sell sweet potatoes to retailers and food processors.",
  tomatoes: "Find tomato buyers in Zimbabwe. Sell fresh tomatoes to retailers, wholesalers, and processing companies.",
  onions: "Connect with onion buyers in Zimbabwe. Sell onions to retailers, wholesalers, and food service companies.",
  cabbage: "Find cabbage buyers in Zimbabwe. Sell cabbage to supermarkets, restaurants, and wholesale markets.",
  carrots: "Connect with carrot buyers in Zimbabwe. Sell fresh carrots to retailers, juice makers, and wholesalers.",
  butternut: "Find butternut buyers in Zimbabwe. Sell butternut to supermarkets, restaurants, and food processors.",
  pumpkins: "Connect with pumpkin buyers in Zimbabwe. Sell pumpkins to retailers, markets, and food processors.",
  peppers: "Find pepper buyers in Zimbabwe. Sell green, red, and chilli peppers to retailers and food processors.",
  lettuce: "Connect with lettuce buyers in Zimbabwe. Sell fresh lettuce to supermarkets, restaurants, and fast-food chains.",
  spinach: "Find spinach buyers in Zimbabwe. Sell fresh spinach to retailers, restaurants, and wholesale markets.",
  beetroot: "Connect with beetroot buyers in Zimbabwe. Sell beetroot to retailers, juice bars, and food processors.",
  cauliflower: "Find cauliflower buyers in Zimbabwe. Sell cauliflower to supermarkets, restaurants, and wholesalers.",
  broccoli: "Connect with broccoli buyers in Zimbabwe. Sell fresh broccoli to supermarkets and health-food retailers.",
  cucumbers: "Find cucumber buyers in Zimbabwe. Sell cucumbers to retailers, restaurants, and wholesale markets.",
  "green-beans": "Connect with green bean buyers in Zimbabwe. Sell fresh green beans to retailers, exporters, and food processors.",
  chilli: "Find chilli buyers in Zimbabwe. Sell fresh and dried chillies to food processors, restaurants, and spice traders.",
  // Fruits
  oranges: "Find orange buyers in Zimbabwe. Sell oranges to juice processors, retailers, and wholesale fruit markets.",
  apples: "Connect with apple buyers in Zimbabwe. Sell apples to supermarkets, juice makers, and wholesale markets.",
  bananas: "Find banana buyers in Zimbabwe. Sell bananas to retailers, wholesalers, and food processors.",
  avocados: "Connect with avocado buyers in Zimbabwe. Sell avocados to supermarkets, restaurants, and export traders.",
  mangoes: "Find mango buyers in Zimbabwe. Sell fresh mangoes to juice processors, retailers, and export companies.",
  grapes: "Connect with grape buyers in Zimbabwe. Sell grapes to wine producers, retailers, and wholesale markets.",
  strawberries: "Find strawberry buyers in Zimbabwe. Sell strawberries to supermarkets, restaurants, and jam manufacturers.",
  peaches: "Connect with peach buyers in Zimbabwe. Sell peaches to canners, retailers, and wholesale fruit markets.",
  plums: "Find plum buyers in Zimbabwe. Sell plums to retailers, jam producers, and wholesale markets.",
  lemons: "Connect with lemon buyers in Zimbabwe. Sell lemons to juice processors, retailers, and restaurants.",
  pears: "Find pear buyers in Zimbabwe. Sell pears to retailers, canners, and wholesale fruit markets.",
  watermelons: "Find watermelon buyers in Zimbabwe. Sell watermelons to retailers, juice bars, and wholesale markets.",
  watermelon: "Find watermelon buyers in Zimbabwe. Sell watermelons to retailers, juice bars, and wholesale markets.",
  litchis: "Connect with litchi buyers in Zimbabwe. Sell litchis to retailers, exporters, and juice processors.",
  papayas: "Find papaya buyers in Zimbabwe. Sell papayas to retailers, juice processors, and health-food shops.",
  // Herbs & Spices
  garlic: "Find garlic buyers in Zimbabwe. Sell garlic to retailers, food processors, and restaurants.",
  ginger: "Connect with ginger buyers in Zimbabwe. Sell fresh ginger to food processors, retailers, and health-food companies.",
  // Industrial Crops
  sugarcane: "Find sugarcane buyers in Zimbabwe. Sell sugarcane to millers and ethanol producers.",
  cotton: "Connect with cotton buyers in Zimbabwe. Sell lint and seed cotton to ginners, textile manufacturers, and export traders.",
  tobacco: "Find tobacco buyers in Zimbabwe. Sell flue-cured, burley, and oriental tobacco to verified buyers and auction floors.",
  coffee: "Connect with coffee buyers in Zimbabwe. Sell Arabica and Robusta coffee beans to roasters, exporters, and traders.",
  tea: "Find tea buyers in Zimbabwe. Sell black and green tea to processors, exporters, and blenders.",
  // Animal Feed
  lucerne: "Connect with lucerne buyers in Zimbabwe. Sell lucerne bales to dairy farmers, horse owners, and livestock feedlots.",
  hay: "Find hay buyers in Zimbabwe. Sell hay bales to livestock farmers, horse stables, and feedlots.",
  // Aquaculture
  tilapia: "Connect with tilapia buyers in Zimbabwe. Sell fresh tilapia to restaurants, retailers, and fish markets.",
  trout: "Find trout buyers in Zimbabwe. Sell fresh trout to restaurants, supermarkets, and fish mongers.",
  catfish: "Connect with catfish buyers in Zimbabwe. Sell catfish to restaurants, retailers, and fish markets.",
  // Other
  honey: "Find honey buyers in Zimbabwe. Sell raw and processed honey to retailers, health shops, and food companies.",
  flowers: "Connect with flower buyers in Zimbabwe. Sell cut flowers to florists, event companies, and export markets.",
  mushrooms: "Find mushroom buyers in Zimbabwe. Sell fresh and dried mushrooms to restaurants, retailers, and health-food shops.",
}

export const FarmerSeo: Record<string, string>  = {
  // Livestock
  cattle: "Find cattle farmers in Zimbabwe. Buy beef cattle, dairy cows, and livestock directly from trusted farmers at fair prices across all provinces.",
  pigs: "Connect with pig farmers in Zimbabwe. Buy quality pigs directly from breeders and growers for your abattoir or farm.",
  sheep: "Find sheep farmers in Zimbabwe. Buy sheep for meat, wool, and breeding directly from trusted livestock producers.",
  goats: "Connect with goat farmers in Zimbabwe. Buy quality goats directly from breeders and smallholder farmers.",
  chicken: "Looking for trusted chicken farmers and where to buy chickens in Zimbabwe? Connect with reliable poultry farmers who sell broiler, free-range, and live chickens in bulk or retail.",
  ducks: "Find duck farmers in Zimbabwe. Buy ducks and duck eggs directly from trusted poultry farmers.",
  turkeys: "Connect with turkey farmers in Zimbabwe. Buy turkeys directly from breeders especially for festive seasons.",
  rabbits: "Find rabbit farmers in Zimbabwe. Buy rabbits directly from breeders for meat, fur, and breeding.",
  ostriches: "Connect with ostrich farmers in Zimbabwe. Buy ostriches for meat, leather, and feather production.",
  // Meat & Poultry
  beef: "Find beef farmers and suppliers in Zimbabwe. Buy quality beef directly from farmers and feedlot operators at wholesale prices.",
  pork: "Connect with pork farmers in Zimbabwe. Buy fresh pork directly from pig producers and abattoirs.",
  lamb: "Find lamb farmers in Zimbabwe. Buy premium lamb from trusted sheep producers and feedlots.",
  mutton: "Connect with mutton suppliers in Zimbabwe. Buy quality mutton directly from sheep farmers across all provinces.",
  "goat-meat": "Find goat meat farmers in Zimbabwe. Buy fresh chevon directly from goat producers at farm-gate prices.",
  "chicken-meat": "Connect with chicken meat suppliers in Zimbabwe. Buy dressed chicken directly from poultry farmers and abattoirs.",
  // Dairy & Eggs
  "milk-raw": "Find dairy farmers in Zimbabwe. Buy fresh raw milk directly from trusted dairy producers.",
  cheese: "Connect with cheese-producing farmers in Zimbabwe. Buy artisanal farm cheese directly from dairy producers.",
  yogurt: "Find yogurt-producing farmers in Zimbabwe. Buy farm-fresh yogurt directly from dairy producers.",
  butter: "Connect with butter-producing farmers in Zimbabwe. Buy farm-fresh butter directly from dairy producers.",
  "chicken-eggs": "Find egg farmers in Zimbabwe. Buy fresh chicken eggs directly from poultry farmers at wholesale prices.",
  "duck-eggs": "Connect with duck egg farmers in Zimbabwe. Buy fresh duck eggs directly from poultry producers.",
  eggs: "Find egg farmers in Zimbabwe. Buy fresh eggs directly from poultry farmers at competitive wholesale and retail prices.",
  // Grains & Cereals
  maize: "Connect with maize farmers in Zimbabwe. Buy quality maize directly from growers for milling, animal feed, or resale.",
  wheat: "Find wheat farmers in Zimbabwe. Buy quality wheat grain directly from growers for milling and food production.",
  sorghum: "Connect with sorghum farmers in Zimbabwe. Buy quality sorghum directly from growers for brewing, milling, and feed.",
  barley: "Find barley farmers in Zimbabwe. Buy malting and feed barley directly from growers.",
  oats: "Connect with oat farmers in Zimbabwe. Buy quality oats directly from growers for food processing and animal feed.",
  rice: "Find rice farmers in Zimbabwe. Buy locally grown rice directly from paddy farmers.",
  millet: "Connect with millet farmers in Zimbabwe. Buy quality millet directly from growers for milling and brewing.",
  // Oilseeds & Legumes
  soybeans: "Find soybean farmers in Zimbabwe. Buy quality soya beans directly from growers for oil extraction, feed, or export.",
  soya: "Find soya bean farmers in Zimbabwe. Buy quality soya beans directly from growers for oil extraction, animal feed, or export.",
  sunflower: "Connect with sunflower farmers in Zimbabwe. Buy sunflower seed directly from growers for oil processing.",
  groundnuts: "Find groundnut farmers in Zimbabwe. Buy quality peanuts directly from growers for processing, confectionery, or export.",
  "dry-beans": "Connect with bean farmers in Zimbabwe. Buy dry beans directly from growers at farm-gate prices.",
  lentils: "Find lentil farmers in Zimbabwe. Buy lentils directly from growers for retail and food processing.",
  chickpeas: "Connect with chickpea farmers in Zimbabwe. Buy chickpeas directly from growers for food processing and export.",
  // Vegetables
  potatoes: "Find potato farmers in Zimbabwe. Buy fresh potatoes directly from growers for retail, wholesale, or chip manufacturing.",
  "sweet-potatoes": "Connect with sweet potato farmers in Zimbabwe. Buy sweet potatoes directly from growers.",
  tomatoes: "Find tomato farmers in Zimbabwe. Buy fresh tomatoes directly from growers for retail, wholesale, and processing.",
  onions: "Connect with onion farmers in Zimbabwe. Buy fresh onions directly from growers at farm-gate prices.",
  cabbage: "Find cabbage farmers in Zimbabwe. Buy fresh cabbage directly from growers for retail and wholesale.",
  carrots: "Connect with carrot farmers in Zimbabwe. Buy fresh carrots directly from growers.",
  butternut: "Find butternut farmers in Zimbabwe. Buy butternut directly from growers for retail and wholesale.",
  pumpkins: "Connect with pumpkin farmers in Zimbabwe. Buy pumpkins directly from growers.",
  peppers: "Find pepper farmers in Zimbabwe. Buy fresh peppers directly from growers for retail and processing.",
  lettuce: "Connect with lettuce farmers in Zimbabwe. Buy fresh lettuce directly from growers for restaurants and retail.",
  spinach: "Find spinach farmers in Zimbabwe. Buy fresh spinach directly from growers for retail and wholesale.",
  beetroot: "Connect with beetroot farmers in Zimbabwe. Buy fresh beetroot directly from growers.",
  cauliflower: "Find cauliflower farmers in Zimbabwe. Buy fresh cauliflower directly from growers.",
  broccoli: "Connect with broccoli farmers in Zimbabwe. Buy fresh broccoli directly from growers.",
  cucumbers: "Find cucumber farmers in Zimbabwe. Buy fresh cucumbers directly from growers for retail and wholesale.",
  "green-beans": "Connect with green bean farmers in Zimbabwe. Buy fresh green beans directly from growers for retail and export.",
  chilli: "Find chilli farmers in Zimbabwe. Buy fresh and dried chillies directly from growers for processing and retail.",
  // Fruits
  oranges: "Find orange farmers in Zimbabwe. Buy fresh oranges directly from citrus growers for retail and juice processing.",
  apples: "Connect with apple farmers in Zimbabwe. Buy fresh apples directly from orchards for retail and processing.",
  bananas: "Find banana farmers in Zimbabwe. Buy bananas directly from growers for retail and wholesale.",
  avocados: "Connect with avocado farmers in Zimbabwe. Buy fresh avocados directly from growers for retail and export.",
  mangoes: "Find mango farmers in Zimbabwe. Buy fresh mangoes directly from growers for retail, processing, and export.",
  grapes: "Connect with grape farmers in Zimbabwe. Buy grapes directly from vineyards for wine production and retail.",
  strawberries: "Find strawberry farmers in Zimbabwe. Buy fresh strawberries directly from growers.",
  peaches: "Connect with peach farmers in Zimbabwe. Buy fresh peaches directly from orchards for retail and canning.",
  plums: "Find plum farmers in Zimbabwe. Buy fresh plums directly from orchards for retail and processing.",
  lemons: "Connect with lemon farmers in Zimbabwe. Buy fresh lemons directly from citrus growers.",
  pears: "Find pear farmers in Zimbabwe. Buy fresh pears directly from orchards for retail and canning.",
  watermelons: "Find watermelon farmers in Zimbabwe. Buy watermelons directly from growers for retail and wholesale.",
  watermelon: "Find watermelon farmers in Zimbabwe. Buy watermelons directly from growers for retail and wholesale.",
  litchis: "Connect with litchi farmers in Zimbabwe. Buy fresh litchis directly from growers for retail and export.",
  papayas: "Find papaya farmers in Zimbabwe. Buy fresh papayas directly from growers for retail and processing.",
  // Herbs & Spices
  garlic: "Find garlic farmers in Zimbabwe. Buy fresh garlic directly from growers for retail and food processing.",
  ginger: "Connect with ginger farmers in Zimbabwe. Buy fresh ginger directly from growers for retail and processing.",
  // Industrial Crops
  sugarcane: "Find sugarcane farmers in Zimbabwe. Buy sugarcane directly from growers for milling and ethanol production.",
  cotton: "Connect with cotton farmers in Zimbabwe. Buy lint and seed cotton directly from growers across cotton-producing regions.",
  tobacco: "Find tobacco farmers in Zimbabwe. Buy flue-cured, burley, and oriental tobacco directly from experienced growers.",
  coffee: "Connect with coffee farmers in Zimbabwe. Buy Arabica and Robusta coffee beans directly from growers.",
  tea: "Find tea farmers in Zimbabwe. Buy black and green tea directly from estate and smallholder growers.",
  // Animal Feed
  lucerne: "Connect with lucerne farmers in Zimbabwe. Buy lucerne bales directly from growers for dairy and livestock feeding.",
  hay: "Find hay farmers in Zimbabwe. Buy hay bales directly from growers for livestock feeding.",
  // Aquaculture
  tilapia: "Find tilapia farmers in Zimbabwe. Buy fresh tilapia directly from fish farmers and aquaculture producers.",
  trout: "Connect with trout farmers in Zimbabwe. Buy fresh trout directly from aquaculture producers.",
  catfish: "Find catfish farmers in Zimbabwe. Buy fresh catfish directly from fish farmers.",
  // Other
  honey: "Connect with beekeepers in Zimbabwe. Buy raw and processed honey directly from apiarists.",
  flowers: "Find flower farmers in Zimbabwe. Buy cut flowers directly from growers for floristry and events.",
  mushrooms: "Find mushroom farmers in Zimbabwe. Buy fresh and dried mushrooms directly from growers.",
}

export function getBuyerSeo(product: string): string {
  return BuyerSeo[product] || `Find ${product} buyers in Zimbabwe on Farmnport. Sell your ${product} directly to verified buyers at competitive market prices.`
}

export function getFarmerSeo(product: string): string {
  return FarmerSeo[product] || `Find ${product} farmers in Zimbabwe on Farmnport. Buy quality ${product} directly from trusted local growers at fair prices.`
}

export type FarmProduceCategory = {
  id: string
  name: string
  slug: string
  description: string
  created: string
  updated: string
}

export type FarmProduce = {
  id: string
  name: string
  slug: string
  description: string
  category_id: string
  category_slug: string
  created: string
  updated: string
}

export type FarmProduceCategoriesResponse = {
  total: number
  data: FarmProduceCategory[]
}

export type FarmProduceResponse = {
  total: number
  data: FarmProduce[]
}

// Feed Product Types

export type FeedCategory = {
  id: string
  name: string
  slug: string
  short_description: string
  description: string
}

export type FeedProduct = {
  id: string
  name: string
  slug: string
  brand_id: string
  brand?: {
    id: string
    name: string
  }
  feed_category_id: string
  feed_category?: {
    id: string
    name: string
    slug: string
  }
  animal: string
  phase: string
  form: string
  description: string
  sub_type?: string
  breed_recommendations?: string
  feeding_instructions?: string
  management_tips?: string
  safety_warnings?: string
  package_size?: string
  images: ImageModel[]
  front_label?: ImageModel
  back_label?: ImageModel
  active_ingredients: {
    id: string
    name: string
    concentration: string
  }[]
  targets?: {
    id: string
    name: string
  }[]
  stock_level?: number
  available_for_sale?: boolean
  show_price?: boolean
  sale_price?: number
  was_price?: number
  created: string
  updated: string
}

export type FeedProductResponse = {
  total: number
  data: FeedProduct[]
}

export type FeedingProgramRecommendation = {
  feed_product_id: string
  feed_product_name: string
  feed_product_slug: string
  purpose: string
  notes: string
}

export type FeedingProgramStage = {
  name: string
  order: number
  description: string
  timing_description: string
  recommendations: FeedingProgramRecommendation[]
}

export type FeedingProgram = {
  id: string
  name: string
  slug: string
  description: string
  farm_produce_id: string
  farm_produce_name?: string
  cover_image?: ImageModel
  stages: FeedingProgramStage[]
  published: boolean
  created: string
  updated: string
}

export type FeedingProgramResponse = {
  total: number
  data: FeedingProgram[]
}

// CDM (Cold Dress Mass) Types

export type CarcassGradePrice = {
  collected_usd: number
  delivered_usd: number
  collected_zig: number
  delivered_zig: number
}

export type CarcassGrades = {
  commercial: CarcassGradePrice
  economy: CarcassGradePrice
  manufacturing: CarcassGradePrice
}

export type LiveweightEntry = {
  weight_range: string
  teeth: string
  delivered_usd: number
  delivered_zig: number
  grade_note: string
}

export type CdmPrice = {
  id: string
  created: string
  updated: string
  client_id: string
  client_name: string
  verified?: boolean
  effectiveDate: string
  exchange_rate: number
  carcass_grades: CarcassGrades
  liveweight: LiveweightEntry[]
  notes: string[]
}

export type CdmPriceResponse = {
  total: number
  data: CdmPrice[]
}
