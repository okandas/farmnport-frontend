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

export function centsToDollars(cents: number): string {
  if (cents === 0) return "$0.00"
  const dollars = cents / 100
  return `$${dollars.toFixed(2)}`
}

export function titleCase(str?: string): string {
  if (!str) return ""
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export function ucFirst(str: string): string {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const unitLabels: Record<string, string> = {
  "l": "litres",
}

export function formatUnit(unit?: string): string {
  if (!unit) return ""
  return unitLabels[unit.toLowerCase()] || unit
}

const UPPERCASE_TOKENS = new Set([
  "ec", "sc", "sl", "wg", "wp", "ws", "se", "fs", "zc", "wdg", "od", "ew",
  "sg", "sp", "gr", "cs", "me", "dc", "ii", "iii", "iv",
])

export function formatProductName(name?: string): string {
  if (!name) return ""
  return name.split(" ").map(word => {
    if (UPPERCASE_TOKENS.has(word.toLowerCase())) return word.toUpperCase()
    // Handle joined number+code like "960ec" → "960EC"
    const numCodeMatch = word.match(/^(\d+\.?\d*)([a-zA-Z]+)$/)
    if (numCodeMatch && UPPERCASE_TOKENS.has(numCodeMatch[2].toLowerCase())) {
      return numCodeMatch[1] + numCodeMatch[2].toUpperCase()
    }
    if (/^\d/.test(word)) return word
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }).join(" ")
}
