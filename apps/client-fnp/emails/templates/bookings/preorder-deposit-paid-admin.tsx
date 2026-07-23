import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components"

interface Props { bookingRef?: string; customerName?: string; productName?: string; quantity?: number; depositAmount?: string; adminUrl?: string }

export default function PreorderAmountPaidAdminEmail({
  bookingRef = "FNP-BK-PO-0001",
  customerName = "Okandas",
  productName = "Fivet Cobb 500 Day-Old Chicks",
  quantity = 100,
  depositAmount = "$50.00",
  adminUrl = "https://admin.farmnport.com",
}: Props) {
  const details = `Customer  ${customerName}\nProduce   ${productName}\nQuantity  ${quantity} units\nAmount    ${depositAmount}`

  return (
    <Html lang="en">
      <Head />
      <Preview>{`Payment received from ${customerName} — ${String(quantity)} ${productName}`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={content}>
            <Text style={brand}>farmnport</Text>
            <Text style={greeting}>Payment received</Text>
            <Text style={paragraph}>Payment received for a pre-order booking.</Text>
            <Text style={paragraph}>Booking reference: <strong>{bookingRef}</strong></Text>
            <Text style={paragraph}>{details}</Text>
            <Text style={paragraph}><Link href={adminUrl} style={link}>View booking</Link></Text>
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
