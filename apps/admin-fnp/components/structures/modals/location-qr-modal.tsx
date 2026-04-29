"use client"

import { useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
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

function buildSVGString(qrSvgEl: SVGSVGElement, restaurantName: string, locationLabel: string): string {
  const qrSize = 220
  const padX = 32
  const padY = 16
  const topLabelH = 32
  const bottomLabelH = 36
  const totalW = qrSize + padX * 2
  const totalH = qrSize + topLabelH + bottomLabelH + padY * 2

  const qrInner = qrSvgEl.innerHTML

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
  <rect width="${totalW}" height="${totalH}" fill="white"/>
  <!-- top label -->
  <text x="${totalW / 2}" y="${padY + 20}" font-family="sans-serif" font-size="16" font-weight="bold" fill="#111827" text-anchor="middle">menus.co.zw</text>
  <!-- qr code -->
  <svg x="${padX}" y="${padY + topLabelH}" width="${qrSize}" height="${qrSize}" viewBox="0 0 ${qrSize} ${qrSize}">
    ${qrInner}
  </svg>
  <!-- restaurant name overlay -->
  <rect x="${totalW / 2 - 64}" y="${padY + topLabelH + qrSize / 2 - 14}" width="128" height="28" rx="4" fill="rgba(255,255,255,0.9)"/>
  <text x="${totalW / 2}" y="${padY + topLabelH + qrSize / 2 + 6}" font-family="sans-serif" font-size="12" font-weight="bold" fill="#111827" text-anchor="middle">${restaurantName}</text>
  <!-- bottom label -->
  <text x="${totalW / 2}" y="${padY + topLabelH + qrSize + 20}" font-family="sans-serif" font-size="11" fill="#6b7280" text-anchor="middle">${locationLabel}</text>
</svg>`
}

export function LocationQRModal({ location, open, onOpenChange }: LocationQRModalProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const city = toSlug(location.city || "")
  const restaurantSlug = location.restaurant_slug || toSlug(location.restaurant_name || "")
  const locationSlug = location.slug || toSlug(location.name || location.id)
  const restaurantName = location.restaurant_name || ""
  const locationLabel = `${location.name}, ${location.address}, ${location.city}`
  const utmContent = encodeURIComponent(`${restaurantName} ${location.name}`)
  const baseUrl = `https://menus.co.zw/restaurants/${city}/${restaurantSlug}/${locationSlug}`
  const qrValue = `${baseUrl}?utm_source=qr&utm_medium=print_qr_code&utm_campaign=digital_QR&utm_content=${utmContent}`
  const fileName = `${restaurantSlug}-${locationSlug}-qr`

  function getSVGString(): string | null {
    if (!svgRef.current) return null
    return buildSVGString(svgRef.current, restaurantName, locationLabel)
  }

  function downloadSVG() {
    const svg = getSVGString()
    if (!svg) return
    const blob = new Blob([svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function downloadPDF() {
    const svg = getSVGString()
    if (!svg) return
    const { jsPDF } = await import("jspdf")

    const qrSize = 220
    const padX = 32
    const padY = 16
    const topLabelH = 32
    const bottomLabelH = 36
    const totalW = qrSize + padX * 2
    const totalH = qrSize + topLabelH + bottomLabelH + padY * 2

    // Convert px to mm (96dpi → 1px = 0.2646mm)
    const px2mm = 0.2646
    const wMM = totalW * px2mm
    const hMM = totalH * px2mm

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [wMM, hMM] })

    // White background
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, wMM, hMM, "F")

    // Top label
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(17, 24, 39)
    doc.text("menus.co.zw", wMM / 2, (padY + 20) * px2mm, { align: "center" })

    // QR code as SVG image
    const svgBlob = new Blob([svg], { type: "image/svg+xml" })
    const svgUrl = URL.createObjectURL(svgBlob)
    const img = new Image()
    img.src = svgUrl
    await new Promise<void>((res) => { img.onload = () => res() })

    const canvas = document.createElement("canvas")
    canvas.width = totalW * 2
    canvas.height = totalH * 2
    const ctx = canvas.getContext("2d")!
    ctx.scale(2, 2)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, totalW, totalH)
    ctx.drawImage(img, 0, 0, totalW, totalH)
    URL.revokeObjectURL(svgUrl)

    const imgData = canvas.toDataURL("image/png")
    doc.addImage(imgData, "PNG", 0, 0, wMM, hMM)

    doc.save(`${fileName}.pdf`)
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
            <div className="relative">
              <QRCodeSVG
                ref={svgRef}
                value={qrValue}
                size={220}
                level="H"
                marginSize={1}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-white/90 text-gray-900 text-xs font-bold px-2 py-1 rounded text-center max-w-[120px] leading-tight">
                  {restaurantName}
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-500 text-center">{locationLabel}</span>
          </div>

          <div className="flex gap-2 w-full">
            <Button onClick={downloadSVG} variant="outline" className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              SVG
            </Button>
            <Button onClick={downloadPDF} className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
