import { redirect } from "next/navigation"

export default function OldOrdersRedirect() {
  redirect("/dashboard/farmnport/orders/sales")
}
