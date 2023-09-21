import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns"
import Dinero from "dinero.js"
import { PhoneNumberUtil } from "google-libphonenumber"
import slugify from "slugify"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const phoneUtility = PhoneNumberUtil.getInstance()

export function slug(name?: string): string {
  if (name === undefined) return ""
  const slugged = slugify(name, {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    lower: true,
  })
  return slugged
}

export function unslug(slug: string): string {
  var split = slug.split("-")
  var entity = split.join(" ")
  return entity
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function makeAbbveriation(str?: string) {
  if (str === undefined) {
    return "FP"
  }
  var abbv = ""
  if (typeof str === "string") {
    const words = str.split(" ")
    for (var i = 0; i < words.length; i++) {
      abbv += words[i].substr(0, 1)
    }
    return abbv
  } else {
    abbv = "FP"
    return abbv
  }
}

export function formatDate(d?: string) {
  if (d === undefined) return ""
  const date = new Date(d)
  return format(date, "dd MMMM yyyy")
}

export function ucFirst(word?: string) {
  if (word === undefined) return ""
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function centsToDollars(cents: number | boolean) {
  if (typeof cents === "boolean") return cents
  if (isNaN(cents)) return cents
  return Dinero({ amount: cents }).toFormat("$0,0.00")
}

export function centsToDollarsFormInputs(cents: number) {
  const amount = isNaN(cents) ? 0 : Number(cents)
  return Number(Dinero({ amount: amount }).toFormat("0.00"))
}

export function dollarsToCents(dollars: number) {
  return Math.round(100 * dollars)
}
