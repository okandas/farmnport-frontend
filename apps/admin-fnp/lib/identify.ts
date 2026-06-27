import type { Attributes } from "@flags-sdk/growthbook"
import type { Identify } from "flags"
import { dedupe } from "flags/next"

export const identify = dedupe(async () => {
  return {
    id: "admin",
    admin: true,
  }
}) satisfies Identify<Attributes>
