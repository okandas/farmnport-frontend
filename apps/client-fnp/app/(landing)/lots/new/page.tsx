import Link from "next/link"
import { retrieveUser } from "@/lib/actions"
import { redirect } from "next/navigation"
import { SplitPageTour } from "@/components/shared/SplitPageTour"

export const metadata = {
  title: "Post a Lot | farmnport.com",
  description: "List your produce for sale or post a buying request on farmnport.com.",
}

export default async function PostLotPage() {
  const user = await retrieveUser()

  if (!user) {
    redirect("/login?next=/lots/new")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="border-b">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/lots" className="hover:text-foreground">Lots</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Post a Lot</span>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">What would you like to do?</h1>
          <p className="mt-2 text-sm text-muted-foreground">Choose whether you want to sell your produce or find produce to buy.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            id="lot-new-sell"
            href="/lots/new/sell"
            className="group flex flex-col items-center gap-3 rounded-xl border border-border p-8 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <h2 className="text-lg font-semibold group-hover:text-primary">Sell Produce</h2>
            <p className="text-sm text-muted-foreground text-center">Post your available stock for buyers to find</p>
          </Link>
          <Link
            id="lot-new-buy"
            href="/lots/new/buy"
            className="group flex flex-col items-center gap-3 rounded-xl border border-border p-8 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <h2 className="text-lg font-semibold group-hover:text-primary">Request Produce</h2>
            <p className="text-sm text-muted-foreground text-center">Post what you need and let sellers come to you</p>
          </Link>
        </div>
        <SplitPageTour
          storageKey="fnp_lots_new_tour_seen"
          steps={[
            { element: "#lot-new-sell", title: "Have stock ready now?", description: "List it and buyers can bid or buy immediately." },
            { element: "#lot-new-buy", title: "Looking for specific produce?", description: "Post a request and let farmers offer." },
          ]}
        />
      </div>
    </main>
  )
}
