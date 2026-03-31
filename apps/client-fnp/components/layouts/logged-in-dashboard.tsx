"use client"

import { AuthenticatedUser } from "@/lib/schemas"
import { FarmerDashboard } from "./farmer-dashboard"
import { BuyerDashboard } from "./buyer-dashboard"

interface LoggedInDashboardProps {
  user: AuthenticatedUser
}

export function LoggedInDashboard({ user }: LoggedInDashboardProps) {
  return user?.type === "buyer"
    ? <BuyerDashboard user={user} />
    : <FarmerDashboard user={user} />
}
