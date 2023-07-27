import { clsx, type ClassValue } from "clsx"
import { PhoneNumberUtil } from "google-libphonenumber"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const phoneUtility = PhoneNumberUtil.getInstance()
