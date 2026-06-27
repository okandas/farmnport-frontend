"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TumiraCourierRate } from "@/components/structures/columns/tumira-courier-rates"

interface TumiraCourierRateModalProps {
  rate: TumiraCourierRate | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatLabel(value: string) {
  return value?.replace(/_/g, " ") || "—"
}

function formatCents(cents?: number) {
  if (cents === undefined || cents === null) return "—"
  return `$${(cents / 100).toFixed(2)}`
}

export function TumiraCourierRateModal({ rate, open, onOpenChange }: TumiraCourierRateModalProps) {
  if (!rate) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{rate.courier_name} — {formatLabel(rate.service_type)}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 text-sm">
          {/* Overview */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div className="text-muted-foreground">Courier</div>
            <div className="font-medium">{rate.courier_name}</div>

            <div className="text-muted-foreground">Service Type</div>
            <div className="capitalize">{formatLabel(rate.service_type)}</div>

            <div className="text-muted-foreground">Pricing Model</div>
            <div className="capitalize">{formatLabel(rate.pricing_model)}</div>

            <div className="text-muted-foreground">Active</div>
            <div>{rate.active ? "Yes" : "No"}</div>

            {rate.origin_label && (
              <>
                <div className="text-muted-foreground">Hub</div>
                <div>{rate.origin_label}</div>
              </>
            )}

            {rate.origin_ward_code && (
              <>
                <div className="text-muted-foreground">Route</div>
                <div className="font-mono">{rate.origin_ward_code} → {rate.destination_ward_code}</div>
              </>
            )}

            {rate.origin_city_code && (
              <>
                <div className="text-muted-foreground">Route</div>
                <div className="font-mono">{rate.origin_city_code} → {rate.destination_city_code}</div>
              </>
            )}

            <div className="text-muted-foreground">Date Added</div>
            <div>{rate.created ? new Date(rate.created).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}</div>
          </div>

          {/* Weight bands */}
          {rate.weight_bands && rate.weight_bands.length > 0 && (
            <div>
              <div className="text-muted-foreground mb-2">Weight Bands</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-left">
                    <th className="pb-1 font-normal">Max Weight</th>
                    {rate.pricing_model === "per_km" ? (
                      <>
                        <th className="pb-1 font-normal">Rate / km</th>
                        <th className="pb-1 font-normal">Minimum</th>
                      </>
                    ) : (
                      <th className="pb-1 font-normal">Price</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rate.weight_bands.map((b, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-1">{b.max_grams >= 999999999 ? "Unlimited" : `${(b.max_grams / 1000).toFixed(1)} kg`}</td>
                      {rate.pricing_model === "per_km" ? (
                        <>
                          <td className="py-1">{formatCents(b.rate_cents_per_km)}</td>
                          <td className="py-1">{formatCents(b.min_price_cents)}</td>
                        </>
                      ) : (
                        <td className="py-1">{formatCents(b.price_cents)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Radius bands */}
          {rate.bands && rate.bands.length > 0 && (
            <div>
              <div className="text-muted-foreground mb-2">Distance Bands</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-left">
                    <th className="pb-1 font-normal">Max Distance</th>
                    <th className="pb-1 font-normal">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {rate.bands.map((b, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-1">{(b.max_metres / 1000).toFixed(1)} km</td>
                      <td className="py-1">{formatCents(b.price_cents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
