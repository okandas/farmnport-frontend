import { string } from "zod"

export const provinces = [
  "bulawayo",
  "harare",
  "manicaland",
  "mashonaland central",
  "mashonaland east",
  "mashonaland west",
  "masvingo",
  "matabeleland north",
  "matabeleland south",
  "midlands",
]

export const specializations = [
  "horticulture",
  "dairy",
  "aquaculture",
  "plantation",
  "livestock",
  "grain",
  "manufacturing",
  "hospitality",
  "poultry",
  "pastures",
]

export const clientTypes = ["farmer", "buyer", "exporter", "importer"]

export const scales = ["small", "medium", "large"]

export const mainActivity: Record<string, string[]> = {
  horticulture: ["tomato", "onion", "lettuce", "potato", "sweet potato"],
  livestock: ["pork", "beef", "cattle", "goat", "sheep", "pig"],
  dairy: ["milk"],
  aquaculture: ["bream", "kapenta"],
  grain: ["maize", "soya bean", "wheat", "groundnut", "sugar bean"],
  plantation: [
    "orange",
    "apple",
    "peacan nut",
    "banana",
    "mango",
    "avocado",
    "pineapple",
    "blueberry",
    "plum",
    "melon",
    "grape",
    "passion fruit",
    "granadilla",
  ],
  manufacturing: ["food processing"],
  hospitality: ["catering"],
  poultry: ["chicken", "turkey"],
  pastures: ["katambora"],
}

export const units = ["kg"]

export const pricingBasis = [
  "LWT - Live Weight",
  "CDM - Cold Dressed Mass"
]

export const paymentTerms = ["Next Day", "2 weeks", "30 Days", "60 Days"]
