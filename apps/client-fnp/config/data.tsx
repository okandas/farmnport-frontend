
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

export const produce = [
  "chicken",
  "pork",
  "chilli",
  "watermelon",
  "onions",
  "cattle",
  "tomatoes",
  "eggs",
  "maize"
]

export const scales = ["small", "medium", "large"]

export const paymentTerms = ["Next Day", "2 weeks", "30 Days", "60 Days"]

export const sideBarFilterData = [
    {
      name: "produce",
      data: produce
    },
    {
        name: "payment",
        data: paymentTerms
    },
    {
        name: "scales",
        data: scales
    },
    {
        name: "provinces",
        data: provinces
    },
  {
      name: "specialization",
      data: specializations
    },
]

export const defaultSideBarData = ["payment", "produce"]
