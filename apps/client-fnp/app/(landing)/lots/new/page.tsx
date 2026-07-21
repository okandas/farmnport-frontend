import Link from "next/link"
import { PostLotForm } from "@/components/forms/post-lot"
import { retrieveUser } from "@/lib/actions"
import { redirect } from "next/navigation"

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
            <Link href="/buy" className="hover:text-foreground">Buy</Link>
            <span className="mx-2">/</span>
            <Link href="/lots" className="hover:text-foreground">Lots</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Post a Lot</span>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Post a Lot</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your lot will be reviewed before going live. We'll notify you once approved.
          </p>
        </div>
        <PostLotForm />
      </div>
    </main>
  )
}
