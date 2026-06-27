import type { Attributes } from "@flags-sdk/growthbook"
import type { Identify } from "flags"
import { dedupe } from "flags/next"
import { auth } from "@/auth"

export const identify = dedupe(async () => {
  const session = await auth()
  const user = session?.user as any

  return {
    id: user?.id ?? "",
    email: user?.email ?? "",
    type: user?.type ?? "",
    subscription_active: user?.subscription_active ?? false,
    admin: user?.admin ?? false,
  }
}) satisfies Identify<Attributes>
