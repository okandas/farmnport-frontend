"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { adminGetChef, adminUpdateChefStatus, adminDeleteChef } from "@/lib/query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  approved:  "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
}

const TYPE_LABELS: Record<string, string> = {
  solo: "Solo Chef",
  catering: "Catering",
  private_kitchen: "Private Kitchen",
}

interface ChefDetail {
  id: string
  name: string
  slug: string
  bio: string
  profile_image: string
  gallery: string[]
  cuisines: string[]
  city: string
  service_radius: number
  phone: string
  email: string
  phone_verified: boolean
  email_verified: boolean
  enabled_types: string[]
  bank_name: string
  account_number: string
  social_links: { instagram?: string; facebook?: string; website?: string }
  status: string
  featured: boolean
  created: string
  updated: string
}

export default function ChefDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const id = params.id as string

  const { data, isLoading } = useQuery({
    queryKey: ["admin-chef", id],
    queryFn: () => adminGetChef(id),
    refetchOnWindowFocus: false,
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) => adminUpdateChefStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chef", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-chefs"] })
      toast({ title: "Chef status updated" })
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminDeleteChef(id),
    onSuccess: () => {
      toast({ title: "Chef deleted" })
      router.push("/dashboard/chefs")
    },
    onError: () => toast({ title: "Failed to delete chef", variant: "destructive" }),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  const chef: ChefDetail | undefined = data?.data

  if (!chef) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Chef not found</p>
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
            <h2 className="text-2xl font-bold">{chef.name}</h2>
            <Badge className={STATUS_COLORS[chef.status] ?? ""}>
              {chef.status}
            </Badge>
            {chef.featured && <Badge variant="outline">Featured</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(chef.created), "PPp")}
          </p>
        </div>
        <Link href={`/dashboard/chefs/${id}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {chef.status === "pending" && (
          <Button onClick={() => statusMutation.mutate("approved")} disabled={statusMutation.isPending}>
            Approve
          </Button>
        )}
        {chef.status === "approved" && (
          <Button variant="destructive" onClick={() => statusMutation.mutate("suspended")} disabled={statusMutation.isPending}>
            Suspend
          </Button>
        )}
        {chef.status === "suspended" && (
          <Button onClick={() => statusMutation.mutate("approved")} disabled={statusMutation.isPending}>
            Reactivate
          </Button>
        )}
        <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
          Delete
        </Button>
      </div>

      {/* Profile + Contact */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {chef.profile_image && (
              <div className="mb-4">
                <img src={chef.profile_image} alt={chef.name} className="w-24 h-24 rounded-full object-cover" />
              </div>
            )}
            <p><span className="text-muted-foreground">Bio:</span> {chef.bio}</p>
            <p><span className="text-muted-foreground">City:</span> <span className="capitalize">{chef.city}</span></p>
            <p><span className="text-muted-foreground">Service Radius:</span> {chef.service_radius} km</p>
            <p><span className="text-muted-foreground">Slug:</span> <span className="font-mono text-xs">{chef.slug}</span></p>
            <div>
              <span className="text-muted-foreground">Types:</span>{" "}
              {(chef.enabled_types ?? []).map((t) => (
                <Badge key={t} variant="outline" className="text-xs ml-1">{TYPE_LABELS[t] ?? t}</Badge>
              ))}
            </div>
            <div>
              <span className="text-muted-foreground">Cuisines:</span>{" "}
              {(chef.cuisines ?? []).map((c) => (
                <Badge key={c} variant="outline" className="text-xs ml-1 capitalize">{c}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact & Bank</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Phone:</span> {chef.phone}</p>
            <p><span className="text-muted-foreground">Email:</span> {chef.email}</p>
            {chef.social_links?.instagram && (
              <p><span className="text-muted-foreground">Instagram:</span> {chef.social_links.instagram}</p>
            )}
            {chef.social_links?.facebook && (
              <p><span className="text-muted-foreground">Facebook:</span> {chef.social_links.facebook}</p>
            )}
            {chef.social_links?.website && (
              <p><span className="text-muted-foreground">Website:</span> {chef.social_links.website}</p>
            )}
            <hr className="my-3" />
            <p><span className="text-muted-foreground">Bank:</span> {chef.bank_name || "Not set"}</p>
            <p><span className="text-muted-foreground">Account:</span> {chef.account_number || "Not set"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gallery */}
      {chef.gallery && chef.gallery.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {chef.gallery.map((img, i) => (
                <img key={i} src={img} alt={`Gallery ${i + 1}`} className="rounded-lg object-cover aspect-square" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Related</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Link href={`/dashboard/chefs/listings?chef_id=${id}`}>
            <Button variant="outline" size="sm">View Listings</Button>
          </Link>
          <Link href={`/dashboard/chefs/bookings?chef_id=${id}`}>
            <Button variant="outline" size="sm">View Bookings</Button>
          </Link>
          <Link href={`/dashboard/chefs/payouts?chef_id=${id}`}>
            <Button variant="outline" size="sm">View Payouts</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
