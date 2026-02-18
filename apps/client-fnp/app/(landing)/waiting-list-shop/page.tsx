import { auth } from "@/auth"
import { WaitingListShop } from "@/components/structures/waiting-list-shop"

export const metadata = {
  title: "Join Shop Waiting List | FarmNPort",
  description: "Be the first to know when our online agrochemical shop launches. Join the waiting list for exclusive early access.",
}

export default async function WaitingListShopPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="flex items-center justify-center">
          <WaitingListShop user={session?.user || null} />
        </div>
      </div>
    </div>
  )
}
