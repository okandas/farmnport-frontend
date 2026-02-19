import { auth } from "@/auth"
import { LoggedOutLanding } from "@/components/layouts/logged-out-landing"
import { LoggedInDashboard } from "@/components/layouts/logged-in-dashboard"

export default async function LandingPage() {
  const session = await auth()
  const user = session?.user

  // Show dashboard for logged-in users, landing page for visitors
  if (user) {
    return <LoggedInDashboard user={user} />
  }

  return <LoggedOutLanding />
}
