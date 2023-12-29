import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
