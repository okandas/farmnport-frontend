import Link from "next/link"
import { PostLotForm } from "@/components/forms/post-lot"
import { retrieveUser } from "@/lib/actions"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Sell Produce | farmnport.com",
  description: "List your produce for sale on farmnport.com.",
}

export default async function SellLotPage() {
  const user = await retrieveUser()

  if (!user) {
    redirect("/login?next=/lots/new/sell")
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
            <span className="text-foreground">Sell Produce</span>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Sell Produce</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Post your available stock for buyers to find. Your lot will be reviewed before going live.
          </p>
        </div>
        <PostLotForm intent="sell" />
      </div>
    </main>
  )
}
