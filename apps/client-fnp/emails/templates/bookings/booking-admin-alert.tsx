import { Body, Button, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface BookingAdminAlertEmailProps {
  bookingRef?: string
  bookingType?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  productName?: string
  quantity?: number
  unit?: string
  goods?: string
  collectionPoint?: string
  bookingDate?: string
  timeSlot?: string
  adminUrl?: string
}

const TYPE_LABELS: Record<string, string> = {
  "pre-order": "Pre-Order",
  "delivery":  "Delivery Booking",
  "pickup":    "Pickup Request",
}

export default function BookingAdminAlertEmail({
  bookingRef = "FNP-BK-0001",
  bookingType = "pre-order",
  customerName = "Okandas",
  customerEmail = "okandas@bara.co.zw",
  customerPhone = "+263 77 000 0000",
  productName = "Fivet Cobb 500 Day-Old Chicks",
  quantity = 100,
  unit = "birds",
  goods = "",
  collectionPoint = "Surrey Group, Harare",
  bookingDate = "",
  timeSlot = "",
  adminUrl = "https://admin.farmnport.com/dashboard/farmnport/bookings/preview",
}: BookingAdminAlertEmailProps) {
  const typeLabel = TYPE_LABELS[bookingType] ?? bookingType
  const isPreOrder = bookingType === "pre-order"

  const customerDetails = [
    `Name      ${customerName}`,
    `Email     ${customerEmail}`,
    `Phone     ${customerPhone}`,
  ].join("\n")

  const bookingDetails = [
    `Type      ${typeLabel}`,
    `Product   ${productName}`,
    isPreOrder ? `Quantity  ${quantity} ${unit}` : "",
    !isPreOrder && goods ? `Goods     ${goods}` : "",
    collectionPoint ? `Location  ${collectionPoint}` : "",
    bookingDate ? `Date      ${bookingDate}${timeSlot ? ` · ${timeSlot}` : ""}` : "",
  ].filter(Boolean).join("\n")

  return (
    <Html lang="en">
      <Head />
      <Preview>New {typeLabel} — {bookingRef} from {customerName}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brand}>farmnport</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>New booking received</Text>
            <Text style={paragraph}>
              A new booking has been submitted and is awaiting your review.
            </Text>
            <Text style={paragraph}>Booking reference: <strong>{bookingRef}</strong></Text>
            <Text style={paragraph}>{customerDetails}</Text>
            <Text style={paragraph}>{bookingDetails}</Text>
          </Section>

          <Hr style={divider} />

          <Section style={content}>
            <Section style={buttonWrapper}>
              <Button href={adminUrl} style={buttonPrimary}>Review in admin</Button>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section style={content}>
            <Text style={signoff}>farmnport notifications</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              farmnport &nbsp;&middot;&nbsp; 13 Grace Rd, Winston Park, Marondera, Zimbabwe
            </Text>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} <Link href="https://farmnport.com" style={footerLink}>farmnport.com</Link>. All rights reserved.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = { backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", margin: 0, padding: "40px 0" }
const container: React.CSSProperties = { backgroundColor: "#ffffff", margin: "0 auto", maxWidth: "580px", borderRadius: "8px", overflow: "hidden" }
const header: React.CSSProperties = { padding: "32px 40px 0" }
const brand: React.CSSProperties = { fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: 0 }
const content: React.CSSProperties = { padding: "16px 40px" }
const greeting: React.CSSProperties = { fontSize: "18px", fontWeight: "600", color: "#0f172a", margin: "0 0 12px" }
const paragraph: React.CSSProperties = { fontSize: "15px", lineHeight: "1.7", color: "#475569", margin: "0 0 16px", whiteSpace: "pre-wrap" }
const buttonWrapper: React.CSSProperties = { margin: "8px 0 24px" }
const buttonPrimary: React.CSSProperties = { backgroundColor: "#ea580c", borderRadius: "6px", color: "#ffffff", fontSize: "15px", fontWeight: "600", textDecoration: "none", textAlign: "center", display: "inline-block", padding: "14px 28px" }
const divider: React.CSSProperties = { borderColor: "#e2e8f0", margin: "8px 40px" }
const signoff: React.CSSProperties = { fontSize: "14px", color: "#64748b", lineHeight: "1.6", whiteSpace: "pre-wrap" }
const footer: React.CSSProperties = { padding: "16px 40px 32px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", textAlign: "center" }
const footerLink: React.CSSProperties = { color: "#94a3b8", textDecoration: "underline" }
