import Link from "next/link"
import { retrieveUser } from "@/lib/actions"
import { redirect } from "next/navigation"
import { SplitPageTour } from "@/components/shared/SplitPageTour"

export const metadata = {
  title: "New Booking | farmnport.com",
  description: "Create a booking to sell or buy produce on farmnport.com.",
}

export default async function NewBookingPage() {
  const user = await retrieveUser()

  if (!user) {
    redirect("/login?next=/bookings/new")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/bookings" className="hover:text-foreground transition-colors">Bookings</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">New</span>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">What would you like to do?</h1>
          <p className="mt-2 text-sm text-muted-foreground">Choose whether you want to sell or buy through a booking.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            id="booking-new-sell"
            href="/bookings/new/sell"
            className="group flex flex-col items-center gap-3 rounded-xl border border-border p-8 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <h2 className="text-lg font-semibold group-hover:text-primary">Sell</h2>
            <p className="text-sm text-muted-foreground text-center">Create a pre-order for customers to book from you</p>
          </Link>
          <Link
            id="booking-new-buy"
            href="/bookings/new/buy"
            className="group flex flex-col items-center gap-3 rounded-xl border border-border p-8 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <h2 className="text-lg font-semibold group-hover:text-primary">Buy</h2>
            <p className="text-sm text-muted-foreground text-center">Post what you want to buy and let sellers come to you</p>
          </Link>
        </div>
        <SplitPageTour
          storageKey="fnp_bookings_new_tour_seen"
          steps={[
            { element: "#booking-new-sell", title: "Supply produce regularly?", description: "Create a pre-order so buyers can book from you on a schedule." },
            { element: "#booking-new-buy", title: "Need produce?", description: "Post what you want and let farmers come to you." },
          ]}
        />
      </div>
    </div>
  )
}
