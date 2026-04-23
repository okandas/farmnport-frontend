import Link from "next/link"

export default function AppSelectorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto flex w-full max-w-md flex-col space-y-6 px-4">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Select an application to manage
          </p>
        </div>

        <div className="grid gap-4">
          <Link
            href="/dashboard/farmnport"
            className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover:bg-accent transition-colors"
          >
            <h2 className="text-lg font-semibold">Farmnport</h2>
            <p className="text-sm text-muted-foreground">
              Manage products, users, prices, and programs
            </p>
          </Link>

          <Link
            href="/dashboard/restaurants"
            className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover:bg-accent transition-colors"
          >
            <h2 className="text-lg font-semibold">Restaurants</h2>
            <p className="text-sm text-muted-foreground">
              Manage restaurant listings, locations, subscriptions, and sales
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
