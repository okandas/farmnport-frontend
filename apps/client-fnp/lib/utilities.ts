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

export function slug(name?: string): string {
  if (name === undefined) return ""

  const slugged = slugify(name, {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    lower: true
  })

  return slugged
}

export function plural(word: string, count?: number): string {
  pluralize.addUncountableRule('cattle')
  pluralize.addUncountableRule('asparagus')
  pluralize.addUncountableRule('beetroot')
  
  if (count == null) {
    return pluralize(word)
  } else {
    return pluralize(word, count)
  }
}
