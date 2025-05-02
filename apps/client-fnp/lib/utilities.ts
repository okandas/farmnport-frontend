import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import slugify from "slugify"
import pluralize from "pluralize"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(str?: string): string {
  if (str === undefined) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function makeAbbveriation(str?: string) {
  if (str === undefined) {
    return "FP"
  }

  let abbv = ""
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

export function slug(name?: string): string {
  if (name === undefined) return ""

  const slugged = slugify(name, {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    lower: true
  })

  return slugged
}

export function unSlug(slug: string): string {

  const split = slug.split('-')

  const words = split.map(word => capitalizeFirstLetter(word))

  return words.join(" ")
}

export function plural(word: string, count?: number): string {
  pluralize.addUncountableRule('cattle')
  pluralize.addUncountableRule('asparagus')
  pluralize.addUncountableRule('beetroot')
  pluralize.addUncountableRule('milk')
  pluralize.addUncountableRule('chilli')
  pluralize.addUncountableRule('chicken')
  pluralize.addUncountableRule('beef')

  pluralize.addIrregularRule('onions', 'onion')
  pluralize.addIrregularRule('chickens', 'chicken')

  if (count == null) {
    return pluralize(word)
  } else {
    return pluralize(word, count)
  }
}
