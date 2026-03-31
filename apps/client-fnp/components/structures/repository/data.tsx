
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

export const clientTypes = ["farmer", "buyer"]

export const scales = ["small", "medium", "large"]

export const units = ["kg"]

export const paymentTermsOptions = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "cbd", label: "Cash Before Delivery" },
  { value: "ndad", label: "Next Day After Delivery" },
  { value: "7-days", label: "7 Days" },
  { value: "14-days", label: "14 Days" },
  { value: "30-days", label: "30 Days" },
  { value: "60-days", label: "60 Days" },
  { value: "90-days", label: "90 Days" },
  { value: "negotiable", label: "Negotiable" },
  { value: "not-provided", label: "Not Provided" },
]

const paymentTermsMap: Record<string, string> = Object.fromEntries(
  paymentTermsOptions.map((o) => [o.value, o.label])
)

export function paymentTermsLabel(slug: string): string {
  if (!slug) return "Not Provided"
  return paymentTermsMap[slug] || slug
}
