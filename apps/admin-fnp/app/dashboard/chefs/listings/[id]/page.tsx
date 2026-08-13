"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { adminGetChefListing, adminUpdateChefListing, adminDeleteChefListing } from "@/lib/query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

const STATUS_COLORS: Record<string, string> = {
  draft:  "bg-gray-100 text-gray-700",
  live:   "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
}

const TYPE_LABELS: Record<string, string> = {
  solo: "Solo Chef",
  catering: "Catering",
  private_kitchen: "Private Kitchen",
}

interface ListingDetail {
  id: string
  chef_id: string
  type: string
  title: string
  description: string
  inclusions: string[]
  images: string[]
  max_guests: number
  travel_radius: number
  price: number
  min_budget: number
  commission_pct: number
  meal_plans: { name: string; meals: number; variants: { size: string; price: number }[] }[]
  add_ons: { name: string; price: number }[]
  delivery_zones: string[]
  availability: string
  status: string
  created: string
  updated: string
}

export default function ChefListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const id = params.id as string

  const { data, isLoading } = useQuery({
    queryKey: ["admin-chef-listing", id],
    queryFn: () => adminGetChefListing(id),
    refetchOnWindowFocus: false,
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) => adminUpdateChefListing(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chef-listing", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-chef-listings"] })
      toast({ title: "Listing updated" })
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminDeleteChefListing(id),
    onSuccess: () => {
      toast({ title: "Listing deleted" })
      router.push("/dashboard/chefs/listings")
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  const listing: ListingDetail | undefined = data?.data

  if (!listing) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Listing not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{listing.title}</h2>
            <Badge className={STATUS_COLORS[listing.status] ?? ""}>{listing.status}</Badge>
            <Badge variant="outline">{TYPE_LABELS[listing.type] ?? listing.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {listing.commission_pct}% commission &middot; Created {format(new Date(listing.created), "d MMM yyyy")}
          </p>
        </div>
        <Link href={`/dashboard/chefs/listings/${id}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
      </div>

      {/* Status Actions */}
      <div className="flex gap-2">
        {listing.status === "draft" && (
          <Button onClick={() => statusMutation.mutate("live")} disabled={statusMutation.isPending}>
            Publish
          </Button>
        )}
        {listing.status === "live" && (
          <Button variant="outline" onClick={() => statusMutation.mutate("paused")} disabled={statusMutation.isPending}>
            Pause
          </Button>
        )}
        {listing.status === "paused" && (
          <Button onClick={() => statusMutation.mutate("live")} disabled={statusMutation.isPending}>
            Resume
          </Button>
        )}
        <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
          Delete
        </Button>
      </div>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {listing.description && <p>{listing.description}</p>}
          {listing.inclusions && listing.inclusions.length > 0 && (
            <div>
              <span className="text-muted-foreground">Inclusions:</span>
              <ul className="list-disc ml-5 mt-1">
                {listing.inclusions.map((inc, i) => <li key={i}>{inc}</li>)}
              </ul>
            </div>
          )}
          {listing.max_guests > 0 && <p><span className="text-muted-foreground">Max Guests:</span> {listing.max_guests}</p>}
          {listing.travel_radius > 0 && <p><span className="text-muted-foreground">Travel Radius:</span> {listing.travel_radius} km</p>}
          <p><span className="text-muted-foreground">Availability:</span> {listing.availability}</p>
        </CardContent>
      </Card>

      {/* Pricing */}
      {listing.type === "solo" && listing.price > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(listing.price / 100).toFixed(2)}</p>
          </CardContent>
        </Card>
      )}

      {listing.type === "catering" && listing.min_budget > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Minimum budget</p>
            <p className="text-2xl font-bold">${(listing.min_budget / 100).toFixed(2)}</p>
          </CardContent>
        </Card>
      )}

      {/* Meal Plans */}
      {listing.type === "private_kitchen" && listing.meal_plans && listing.meal_plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meal Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Plan</th>
                    <th className="text-left py-2 pr-4">Meals</th>
                    {listing.meal_plans[0]?.variants?.map((v) => (
                      <th key={v.size} className="text-right py-2 pr-4">{v.size}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listing.meal_plans.map((plan, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{plan.name}</td>
                      <td className="py-2 pr-4">{plan.meals}</td>
                      {plan.variants.map((v) => (
                        <td key={v.size} className="py-2 pr-4 text-right">${(v.price / 100).toFixed(2)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add-Ons */}
      {listing.add_ons && listing.add_ons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add-Ons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {listing.add_ons.map((addon, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{addon.name}</span>
                  <span className="font-medium">${(addon.price / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Zones */}
      {listing.delivery_zones && listing.delivery_zones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {listing.delivery_zones.map((zone, i) => (
                <Badge key={i} variant="outline">{zone}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery */}
      {listing.images && listing.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {listing.images.map((img, i) => (
                <img key={i} src={img} alt={`Image ${i + 1}`} className="rounded-lg object-cover aspect-square" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
