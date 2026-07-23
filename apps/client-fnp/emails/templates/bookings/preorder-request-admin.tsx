import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components"

interface Props { bookingRef?: string; customerName?: string; customerEmail?: string; customerPhone?: string; productName?: string; quantity?: number; buyerNotes?: string; adminUrl?: string }

export default function PreorderRequestAdminEmail({
  bookingRef = "FNP-BK-PO-0001",
  customerName = "Okandas",
  customerEmail = "okandas@farmnport.com",
  customerPhone = "0719099990",
  productName = "Fivet Cobb 500 Day-Old Chicks",
  quantity = 100,
  buyerNotes = "",
  adminUrl = "https://admin.farmnport.com",
}: Props) {
  const customerDetails = `Name    ${customerName}\nEmail   ${customerEmail}\nPhone   ${customerPhone}`
  const orderDetails = [
    `Produce   ${productName}`,
    `Quantity  ${quantity} units`,
    buyerNotes ? `Notes     ${buyerNotes}` : "",
  ].filter(Boolean).join("\n")

  return (
    <Html lang="en">
      <Head />
      <Preview>{`New pre-order request from ${customerName} — ${String(quantity)} ${productName}`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={content}>
            <Text style={brand}>farmnport</Text>
            <Text style={greeting}>New pre-order request</Text>
            <Text style={paragraph}>A new pre-order request needs your review.</Text>
            <Text style={paragraph}>Booking reference: <strong>{bookingRef}</strong></Text>
            <Text style={paragraph}>{customerDetails}</Text>
            <Text style={paragraph}>{orderDetails}</Text>
            <Text style={paragraph}><Link href={adminUrl} style={link}>Review booking</Link></Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>farmnport admin</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", margin: 0, padding: "40px 0" }
const container: React.CSSProperties = { backgroundColor: "#ffffff", margin: "0 auto", maxWidth: "580px" }
const content: React.CSSProperties = { padding: "32px 40px 24px" }
const brand: React.CSSProperties = { fontSize: "20px", fontWeight: "600", color: "#0f172a", margin: "0 0 20px" }
const greeting: React.CSSProperties = { fontSize: "18px", fontWeight: "600", color: "#0f172a", margin: "0 0 12px" }
const paragraph: React.CSSProperties = { fontSize: "15px", lineHeight: "1.7", color: "#475569", margin: "0 0 16px", whiteSpace: "pre-wrap" }
const link: React.CSSProperties = { color: "#ea580c", textDecoration: "underline" }
const footer: React.CSSProperties = { padding: "0 40px 32px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: 0, textAlign: "center" }
