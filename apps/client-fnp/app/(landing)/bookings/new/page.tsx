"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { SearchSelect } from "@/components/ui/search-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"
import { createClientPreOrder, queryFarmProduceCategories, queryBreedsByFarmProduce } from "@/lib/query"
import { capitalizeFirstLetter } from "@/lib/utilities"

const UNITS = ["birds", "chicks", "heads", "crates", "pockets", "bags", "kg", "units"]

const Schema = z.object({
  market_side: z.enum(["supply", "demand"], { required_error: "Select a booking type" }),
  produce_id: z.string().min(1, "Select a produce"),
  produce_name: z.string().min(1),
  breed_id: z.string().optional(),
  breed_name: z.string().optional(),
  unit: z.string().min(1, "Select a unit"),
  total_available: z.coerce.number().positive("Enter a valid quantity"),
  unit_price: z.coerce.number().min(0.01, "Price is required"),
  deposit_per_unit: z.coerce.number().min(0, "Deposit is required"),
  description: z.string().optional(),
})

type FormModel = z.infer<typeof Schema>

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const user = session?.user as any

  const [mainImage, setMainImage] = useState<{ img: { id: string; src: string } } | null>(null)
  const [extraImages, setExtraImages] = useState<{ img: { id: string; src: string } }[]>([])

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormModel>({
    resolver: zodResolver(Schema),
    defaultValues: {
      market_side: (searchParams.get("side") as "supply" | "demand") || "supply",
      unit: "kg",
      deposit_per_unit: 0,
    },
  })

  const produceId = watch("produce_id")
  const unit = watch("unit")
  const marketSide = watch("market_side")

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormModel) => {
      return createClientPreOrder({
        produce_id: data.produce_id,
        produce_name: data.produce_name,
        breed_id: data.breed_id || undefined,
        breed_name: data.breed_name || undefined,
        unit: data.unit,
        unit_price: Math.round(data.unit_price * 100),
        deposit_per_unit: Math.round(data.deposit_per_unit * 100),
        total_available: data.total_available,
        description: data.description || undefined,
        market_side: data.market_side,
        image_src: mainImage?.img?.src || undefined,
        other_images: extraImages.length > 0 ? extraImages.map((e) => e.img.src) : undefined,
      })
    },
    onSuccess: () => {
      toast.success("Booking created — pending review.")
      router.push("/account/booking-preorders")
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create booking. Please try again.")
    },
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="font-semibold">Sign in to create a booking</p>
          <Link href="/login" className="text-sm text-primary hover:underline">Sign in →</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/bookings" className="hover:text-foreground transition-colors">Bookings</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">New</span>
          </nav>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Create a Booking</h1>
          <p className="text-sm text-muted-foreground mt-1">List what you want to sell or buy. Your booking will be reviewed before going live.</p>
        </div>

        <form onSubmit={handleSubmit((d) => mutate(d))}>
          <div className="space-y-12">

            {/* Section 1: Booking Type */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Booking Type</h2>
                <p className="mt-1 text-sm text-muted-foreground">Are you selling or buying?</p>
              </div>
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                <div className="col-span-full">
                  <Controller
                    name="market_side"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-4">
                        {[
                          { value: "supply", label: "I'm Selling", desc: "List your available stock" },
                          { value: "demand", label: "I'm Buying", desc: "Post what you need" },
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
                  {errors.market_side && <p className="mt-1.5 text-xs text-destructive">{errors.market_side.message}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Produce */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Produce</h2>
                <p className="mt-1 text-sm text-muted-foreground">What are you {marketSide === "supply" ? "selling" : "looking for"}?</p>
              </div>
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                <div className="sm:col-span-3">
                  <Label className="text-sm font-medium">Produce *</Label>
                  <div className="mt-2">
                    <Controller
                      name="produce_id"
                      control={control}
                      render={({ field }) => (
                        <SearchSelect
                          queryKey="farm-produce-categories"
                          queryFn={() => queryFarmProduceCategories()}
                          getItems={(page) => page?.data?.data ?? []}
                          value={field.value ?? ""}
                          onValueChange={(v) => field.onChange(v)}
                          onItemSelect={(item) => setValue("produce_name", item?.name ?? "")}
                          getLabel={(p) => capitalizeFirstLetter(p.name ?? "")}
                          getValue={(p) => p.id}
                          placeholder="Select produce"
                          searchPlaceholder="Search produce..."
                          clearable
                          capitalize
                        />
                      )}
                    />
                    {errors.produce_id && <p className="mt-1.5 text-xs text-destructive">{errors.produce_id.message}</p>}
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
                          queryKey={["booking-breeds", produceId]}
                          queryFn={(params) => queryBreedsByFarmProduce({ farmProduceId: produceId, ...params })}
                          getItems={(page) => page?.data?.data ?? []}
                          value={field.value ?? ""}
                          onValueChange={(v) => field.onChange(v)}
                          onItemSelect={(item) => setValue("breed_name", item?.name ?? "")}
                          getLabel={(b) => capitalizeFirstLetter(b.name ?? "")}
                          getValue={(b) => b.id}
                          placeholder={produceId ? "Select variety" : "Select produce first"}
                          searchPlaceholder="Search varieties..."
                          disabled={!produceId}
                          clearable
                          capitalize
                        />
                      )}
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">Optional</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Details */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Details</h2>
                <p className="mt-1 text-sm text-muted-foreground">Quantity, pricing, and unit.</p>
              </div>
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">

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
                            {UNITS.map((u) => (
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
                  <Label htmlFor="total_available" className="text-sm font-medium">Quantity ({unit || "unit"}) *</Label>
                  <div className="mt-2">
                    <Input
                      id="total_available"
                      type="number"
                      min="1"
                      placeholder="e.g. 500"
                      {...register("total_available")}
                    />
                    {errors.total_available && <p className="mt-1.5 text-xs text-destructive">{errors.total_available.message}</p>}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <Label htmlFor="unit_price" className="text-sm font-medium">Price per {unit || "unit"} *</Label>
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="unit_price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      className="pl-7"
                      {...register("unit_price")}
                    />
                    {errors.unit_price && <p className="mt-1.5 text-xs text-destructive">{errors.unit_price.message}</p>}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <Label htmlFor="deposit_per_unit" className="text-sm font-medium">Deposit per {unit || "unit"}</Label>
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="deposit_per_unit"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-7"
                      {...register("deposit_per_unit")}
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">Optional — upfront deposit required per unit</p>
                  </div>
                </div>

                <div className="col-span-full">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <div className="mt-2">
                    <Textarea
                      id="description"
                      rows={3}
                      placeholder="Describe what you're offering or looking for..."
                      {...register("description")}
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">Optional — helps buyers understand your listing</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Section 4: Photos */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Photos</h2>
                <p className="mt-1 text-sm text-muted-foreground">Add photos of your {marketSide === "supply" ? "stock" : "requirements"}.</p>
              </div>
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                <div className="col-span-full">
                  <ImageUpload
                    mainOnly
                    onMainImageChange={setMainImage}
                    onImagesChange={setExtraImages}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <Link href="/bookings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </Link>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Booking
              </Button>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}
