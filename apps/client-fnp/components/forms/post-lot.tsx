"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { SearchSelect } from "@/components/ui/search-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { queryClient as queryUserProfile, queryLotsEnabledFarmProduce, queryBreedsByFarmProduce, queryFarmProduceStates, postLot } from "@/lib/query"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { ImageUpload } from "@/components/ui/image-upload"

const LOT_UNITS = ["kg", "head", "unit", "tonne", "bag", "dozen", "litre"]

const Schema = z.object({
  type: z.enum(["sell", "request"], { required_error: "Select a lot type" }),
  farm_produce_id: z.string().min(1, "Select a produce"),
  breed_id: z.string().optional(),
  form: z.string().min(1, "Select a form"),
  quantity: z.coerce.number().positive("Enter a valid quantity"),
  unit: z.string().min(1, "Select a unit"),
  price_per_unit: z.coerce.number().min(0.01, "Price is required"),
  notes: z.string().optional(),
  expires_days: z.coerce.number().min(1).max(180).default(30),
})

type FormModel = z.infer<typeof Schema>

export function PostLotForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user as any

  const [mainImage, setMainImage] = useState<{ img: { id: string; src: string } } | null>(null)
  const [extraImages, setExtraImages] = useState<{ img: { id: string; src: string } }[]>([])

  const { data: profileData } = useQuery({
    queryKey: ["my-profile", user?.username],
    queryFn: () => queryUserProfile(user?.username),
    enabled: !!user?.username,
    refetchOnWindowFocus: false,
  })
  const profile = profileData?.data

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormModel>({
    resolver: zodResolver(Schema),
    defaultValues: { type: "sell", expires_days: 30, unit: "kg" },
  })

  const farmProduceId = watch("farm_produce_id")
  const unit = watch("unit")

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormModel) => {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + (data.expires_days ?? 30))
      return postLot({
        type: data.type,
        farm_produce_id: data.farm_produce_id,
        breed_id: data.breed_id || undefined,
        form: data.form,
        quantity: data.quantity,
        unit: data.unit,
        price_per_unit_cents: Math.round(data.price_per_unit * 100),
        notes: data.notes || undefined,
        expires_at: expiresAt.toISOString(),
        main_image: mainImage ?? undefined,
        images: extraImages.length > 0 ? extraImages : undefined,
      })
    },
    onSuccess: () => {
      toast.success("Lot submitted for review. We'll notify you once it's approved.")
      router.push("/lots")
    },
    onError: () => {
      toast.error("Failed to submit lot. Please try again.")
    },
  })

  const locationDisplay = profile
    ? [profile.city, profile.province].filter(Boolean).map(capitalizeFirstLetter).join(", ")
    : null

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))}>
      <div className="space-y-12">

        {/* Section 1: Photos */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Photos</h2>
            <p className="mt-1 text-sm text-muted-foreground">Main photo and up to 5 additional images.</p>
          </div>
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
            <div className="col-span-full">
              <ImageUpload
                onMainImageChange={setMainImage}
                onImagesChange={setExtraImages}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Lot Type */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Lot Type</h2>
            <p className="mt-1 text-sm text-muted-foreground">Are you selling produce or looking to buy?</p>
          </div>
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
            <div className="col-span-full">
              <Label className="text-sm font-medium">I want to</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <div className="mt-3 flex gap-4">
                    {[
                      { value: "sell", label: "Sell Produce", desc: "Post your available stock" },
                      { value: "request", label: "Request Produce", desc: "Post what you want to buy" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex-1 flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                          field.value === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <input
                          type="radio"
                          className="mt-0.5 accent-primary"
                          checked={field.value === opt.value}
                          onChange={() => field.onChange(opt.value)}
                        />
                        <div>
                          <p className="text-sm font-semibold">{opt.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.type && <p className="mt-1.5 text-xs text-destructive">{errors.type.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Produce */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Produce</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select the produce and variety you are listing.</p>
          </div>
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
            <div className="sm:col-span-3">
              <Label className="text-sm font-medium">Farm Produce</Label>
              <div className="mt-2">
                <Controller
                  name="farm_produce_id"
                  control={control}
                  render={({ field }) => (
                    <SearchSelect
                      queryKey="lots-enabled-farm-produce"
                      queryFn={(params) => queryLotsEnabledFarmProduce(params)}
                      getItems={(page) => page?.data?.data ?? []}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      getLabel={(p) => capitalizeFirstLetter(p.name ?? "")}
                      getValue={(p) => p.id}
                      placeholder="Select produce"
                      searchPlaceholder="Search produce..."
                      clearable
                      capitalize
                    />
                  )}
                />
                {errors.farm_produce_id && <p className="mt-1.5 text-xs text-destructive">{errors.farm_produce_id.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-3">
              <Label className="text-sm font-medium">Variety</Label>
              <div className="mt-2">
                <Controller
                  name="breed_id"
                  control={control}
                  render={({ field }) => (
                    <SearchSelect
                      queryKey={["lots-breeds", farmProduceId]}
                      queryFn={(params) => queryBreedsByFarmProduce({ farmProduceId, ...params })}
                      getItems={(page) => page?.data?.data ?? []}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      getLabel={(b) => capitalizeFirstLetter(b.name ?? "")}
                      getValue={(b) => b.id}
                      placeholder={farmProduceId ? "Select variety" : "Select produce first"}
                      searchPlaceholder="Search varieties..."
                      disabled={!farmProduceId}
                      clearable
                      capitalize
                    />
                  )}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">Optional — buyers search by variety.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Lot Details */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Lot Details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Describe the form, quantity, and price of your lot.</p>
          </div>
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">

            <div className="sm:col-span-3">
              <Label className="text-sm font-medium">State</Label>
              <div className="mt-2">
                <Controller
                  name="form"
                  control={control}
                  render={({ field }) => (
                    <SearchSelect
                      queryKey="farm-produce-states"
                      queryFn={(params) => queryFarmProduceStates(params)}
                      getItems={(page) => page?.data?.data ?? []}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      getLabel={(f) => capitalizeFirstLetter(f.name ?? "")}
                      getValue={(f) => f.name}
                      placeholder="Select form..."
                      searchPlaceholder="Search forms..."
                      clearable
                      capitalize
                    />
                  )}
                />
                {errors.form && <p className="mt-1.5 text-xs text-destructive">{errors.form.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-3">
              <Label className="text-sm font-medium">Unit *</Label>
              <div className="mt-2">
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOT_UNITS.map((u) => (
                          <SelectItem key={u} value={u}>{capitalizeFirstLetter(u)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unit && <p className="mt-1.5 text-xs text-destructive">{errors.unit.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-3">
              <Label htmlFor="quantity" className="text-sm font-medium">Quantity ({unit || "unit"}) *</Label>
              <div className="mt-2">
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 500"
                  {...register("quantity")}
                />
                {errors.quantity && <p className="mt-1.5 text-xs text-destructive">{errors.quantity.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-3">
              <Label htmlFor="price_per_unit" className="text-sm font-medium">
                Price per {unit || "unit"} *
              </Label>
              <div className="mt-2 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  id="price_per_unit"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  {...register("price_per_unit")}
                />
                {errors.price_per_unit && <p className="mt-1.5 text-xs text-destructive">{errors.price_per_unit.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-3">
              <Label htmlFor="expires_days" className="text-sm font-medium">Listing expires in (days)</Label>
              <div className="mt-2">
                <Input
                  id="expires_days"
                  type="number"
                  min="1"
                  max="180"
                  defaultValue={30}
                  {...register("expires_days")}
                />
              </div>
            </div>

            <div className="col-span-full">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="mt-2">
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Any additional details about this lot..."
                  {...register("notes")}
                  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Location */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 pb-4 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Your Location</h2>
            <p className="mt-1 text-sm text-muted-foreground">Taken from your profile — visible to interested buyers.</p>
          </div>
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
            <div className="col-span-full">
              {locationDisplay ? (
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{locationDisplay}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Zimbabwe</p>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <p className="text-sm text-muted-foreground italic">Location not set on your profile</p>
                </div>
              )}
              <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>If your location details are incorrect, please contact admin to update your profile before posting.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8 flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit for Review"}
        </Button>
      </div>
    </form>
  )
}
