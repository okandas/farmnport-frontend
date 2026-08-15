import { Body, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"
import { centsToDollars, plural, titleCase } from "@/lib/utilities"

interface Props { bookingRef?: string; sellerName?: string; customerName?: string; productName?: string; quantity?: number; unit?: string; offerPrice?: number; buyerNotes?: string }

export default function PreorderRequestSellerEmail({
  bookingRef = "FNP-BK-PO-0001",
  sellerName = "Okandas",
  customerName = "Jane Doe",
  productName = "Fivet Cobb 500 Day-Old Chicks",
  quantity = 0,
  unit = "",
  offerPrice = 0,
  buyerNotes = "",
}: Props) {
  const orderDetails = [
    `Produce   ${productName}`,
    `Quantity  ${quantity} ${plural(unit || "unit", quantity)}`,
    offerPrice > 0 ? `Offer     ${centsToDollars(offerPrice)} per ${plural(unit || "unit", 1)}` : "",
    buyerNotes ? `Notes     ${buyerNotes}` : "",
  ].filter(Boolean).join("\n")

  return (
    <Html lang="en">
      <Head />
      <Preview>New booking from {customerName} — {String(quantity)} {unit} of {productName}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brand}>farmnport</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>Hi {titleCase(sellerName)},</Text>
            <Text style={paragraph}>You have a new booking request on farmnport.</Text>
            <Text style={paragraph}>Booking reference: <strong>{bookingRef}</strong></Text>
            <Text style={paragraph}>Customer: <strong>{customerName}</strong></Text>
            <Text style={paragraph}>{orderDetails}</Text>
            <Text style={paragraph}>Please accept or review this request — it expires in 48 hours.</Text>
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
const divider: React.CSSProperties = { borderColor: "#e2e8f0", margin: "8px 40px" }
const signoff: React.CSSProperties = { fontSize: "14px", color: "#64748b", lineHeight: "1.6", whiteSpace: "pre-wrap" }
const footer: React.CSSProperties = { padding: "16px 40px 32px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", textAlign: "center" }
const footerLink: React.CSSProperties = { color: "#94a3b8", textDecoration: "underline" }
