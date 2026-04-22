import { RestaurantInvoicesTable } from "@/components/structures/tables/restaurant-invoices"

export default function RestaurantInvoicesPage() {
  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Invoices
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          All billing invoices across restaurant subscriptions.
        </p>
      </div>
      <RestaurantInvoicesTable />
    </div>
  )
}
