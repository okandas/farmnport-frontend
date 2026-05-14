import { redirect } from "next/navigation"

export default function BookDeliveryRedirect({ params }: { params: { slug: string } }) {
  redirect(`/book/${params.slug}`)
}
