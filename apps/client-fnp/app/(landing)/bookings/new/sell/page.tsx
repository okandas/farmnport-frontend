import Link from "next/link"
import { CreateBookingForm } from "../CreateBookingForm"
import { retrieveUser } from "@/lib/actions"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Sell — New Booking | farmnport.com",
  description: "Create a pre-order listing for buyers to book from you.",
}

export default async function SellBookingPage() {
  const user = await retrieveUser()

  if (!user) {
    redirect("/login?next=/bookings/new/sell")
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
            <span className="text-foreground font-medium">Sell</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-2">
          <h1 className="text-2xl font-bold tracking-tight">New Booking — Sell</h1>
          <p className="text-sm text-muted-foreground mt-1">Create a pre-order for customers to book from you.</p>
        </div>

        <CreateBookingForm intent="supply" />
      </div>
    </div>
  )
}
