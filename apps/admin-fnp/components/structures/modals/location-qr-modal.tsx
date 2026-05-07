"use client"

import { useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { QRCodeSVG } from "qrcode.react"
import { Download } from "lucide-react"

import { RestaurantLocation } from "@/lib/schemas"
import { queryLocationSubscriptions } from "@/lib/query"
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

  const { data: subData } = useQuery({
    queryKey: ["location-subscription", location.id],
    queryFn: () => queryLocationSubscriptions({ location_id: location.id, status: "active" }),
    enabled: open,
  })

  const hasActiveSubscription = (subData?.data?.total ?? 0) > 0

  const restaurantName = location.restaurant_name || ""
  const locationLabel = `${location.name}, ${location.address}, ${location.city}`
  const utmContent = encodeURIComponent(`${restaurantName} ${location.name}`)
  const qrValue = `https://menus.co.zw/qr/${location.qr_slug}?utm_source=qr&utm_medium=print_qr_code&utm_campaign=digital_QR&utm_content=${utmContent}`
  const fileName = `${location.qr_slug}-qr`

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
    if (!svgRef.current) return
    const { jsPDF } = await import("jspdf")
    const QRCodeLib = await import("qrcode")

    // A4 in mm
    const A4_W = 210
    const A4_H = 297

    // QR: 180mm centered on page
    const qrMM = 180
    const qrX = (A4_W - qrMM) / 2
    const qrY = (A4_H - qrMM) / 2

    // Render QR to high-res canvas (600dpi equivalent)
    const scale = 10 // 1mm = 10px → 180mm = 1800px
    const qrPx = qrMM * scale
    const qrCanvas = document.createElement("canvas")
    qrCanvas.width = qrPx
    qrCanvas.height = qrPx
    await QRCodeLib.toCanvas(qrCanvas, qrValue, {
      width: qrPx,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: "#000000", light: "#ffffff" },
    })

    const qrDataUrl = qrCanvas.toDataURL("image/png")

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

    // White background
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, A4_W, A4_H, "F")

    // QR image — centered
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrMM, qrMM)

    // Top title: restaurant name, 14mm above QR
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.setTextColor(17, 24, 39)
    doc.text(restaurantName, A4_W / 2, qrY - 10, { align: "center" })

    // Middle overlay on QR: white rect + location name
    const ovW = 60
    const ovH = 9
    const ovX = A4_W / 2 - ovW / 2
    const ovY = qrY + qrMM / 2 - ovH / 2
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(ovX, ovY, ovW, ovH, 2, 2, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(17, 24, 39)
    doc.text(location.name, A4_W / 2, ovY + 6, { align: "center" })

    // Bottom label: "By menus.co.zw" 14mm below QR
    doc.setFont("helvetica", "normal")
    doc.setFontSize(14)
    doc.setTextColor(107, 114, 128)
    doc.text("By menus.co.zw", A4_W / 2, qrY + qrMM + 12, { align: "center" })

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
            <span className="text-sm font-bold text-gray-800 tracking-wide capitalize">{location.name}</span>
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
                  {location.qr_slug}
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-500 text-center">By menus.co.zw</span>
          </div>

          {!hasActiveSubscription && subData && (
            <p className="text-xs text-red-600 text-center">
              No active subscription — QR will not resolve for visitors.
            </p>
          )}

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
