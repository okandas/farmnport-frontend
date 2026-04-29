"use client"

import { useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Download } from "lucide-react"

import { RestaurantLocation } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LocationQRModalProps {
  location: RestaurantLocation
  open: boolean
  onOpenChange: (open: boolean) => void
}

function toSlug(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

export function LocationQRModal({ location, open, onOpenChange }: LocationQRModalProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const city = toSlug(location.city || "")
  const restaurantSlug = toSlug(location.restaurant_name || "")
  const locationSlug = location.name ? toSlug(location.name) : location.id
  const qrValue = `https://menus.co.zw/restaurants/${city}/${restaurantSlug}/${locationSlug}`

  function handleDownload() {
    const canvas = canvasRef.current?.querySelector("canvas")
    if (!canvas) return

    const padding = 48
    const labelHeight = 36
    const nameHeight = 28
    const totalHeight = canvas.height + labelHeight * 2 + padding * 2
    const totalWidth = canvas.width + padding * 2

    const out = document.createElement("canvas")
    out.width = totalWidth
    out.height = totalHeight
    const ctx = out.getContext("2d")!

    // Background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, out.width, out.height)

    // Top label — menus.co.zw
    ctx.fillStyle = "#111827"
    ctx.font = "bold 22px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("menus.co.zw", out.width / 2, padding)

    // QR code
    ctx.drawImage(canvas, padding, padding + labelHeight)

    // Restaurant name overlay (centered on QR)
    const qrCenterY = padding + labelHeight + canvas.height / 2
    ctx.fillStyle = "rgba(255,255,255,0.85)"
    const nameW = 140
    const nameH = nameHeight + 8
    ctx.fillRect(out.width / 2 - nameW / 2, qrCenterY - nameH / 2, nameW, nameH)
    ctx.fillStyle = "#111827"
    ctx.font = "bold 13px sans-serif"
    ctx.textAlign = "center"
    const name = location.restaurant_name || ""
    ctx.fillText(name, out.width / 2, qrCenterY + 5)

    // Bottom label — address
    ctx.fillStyle = "#6b7280"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center"
    const address = `${location.name}, ${location.address}, ${location.city}`
    ctx.fillText(address, out.width / 2, padding + labelHeight + canvas.height + 24)

    const link = document.createElement("a")
    link.download = `${restaurantSlug}-${locationSlug}-qr.png`
    link.href = out.toDataURL("image/png")
    link.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code — {location.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {/* Preview */}
          <div className="flex flex-col items-center gap-2 border rounded-xl p-4 bg-white w-full">
            <span className="text-sm font-bold text-gray-800 tracking-wide">menus.co.zw</span>
            <div className="relative" ref={canvasRef}>
              <QRCodeCanvas
                value={qrValue}
                size={220}
                level="H"
                marginSize={1}
              />
              {/* Restaurant name overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-white/90 text-gray-900 text-xs font-bold px-2 py-1 rounded text-center max-w-[120px] leading-tight">
                  {location.restaurant_name}
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-500 text-center">
              {location.name}, {location.address}, {location.city}
            </span>
          </div>

          <Button onClick={handleDownload} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
