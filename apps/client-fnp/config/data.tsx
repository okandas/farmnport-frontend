
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

export const scales = ["small", "medium", "large"]

export const paymentTerms = ["Next Day", "2 weeks", "30 Days", "60 Days"]

export const sideBarFilterData = [
    {
        name: "specialization",
        data: specializations
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
    }
]

export const defaultSideBarData = ["payment", "specialization"]