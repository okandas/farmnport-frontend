import { clsx, type ClassValue } from "clsx"
import { PhoneNumberUtil } from "google-libphonenumber"
import slugify from "slugify"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const phoneUtility = PhoneNumberUtil.getInstance()

export function slug(name: string): string {
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
