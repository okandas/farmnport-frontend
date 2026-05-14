import { redirect } from "next/navigation"

export default function RequestPickupRedirect({ params }: { params: { slug: string } }) {
  redirect(`/book/${params.slug}`)
}
