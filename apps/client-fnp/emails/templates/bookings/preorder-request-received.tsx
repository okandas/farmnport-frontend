import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components"

interface Props { name?: string; bookingRef?: string; productName?: string; quantity?: number; bookingUrl?: string }

export default function PreorderRequestReceivedEmail({ name = "Okandas", bookingRef = "FNP-BK-PO-0001", productName = "Fivet Cobb 500 Day-Old Chicks", quantity = 100, bookingUrl = "https://farmnport.com/account/bookings/preview" }: Props) {
  const details = `Produce   ${productName}\nQuantity  ${quantity} units`

  return (
    <Html lang="en">
      <Head />
      <Preview>Booking request {bookingRef} submitted — {productName}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={content}>
            <Text style={brand}>farmnport</Text>
            <Text style={greeting}>Hi {name},</Text>
            <Text style={paragraph}>Your pre-order request has been submitted. We&apos;ll confirm availability and notify you to pay.</Text>
            <Text style={paragraph}>Booking reference: <strong>{bookingRef}</strong></Text>
            <Text style={paragraph}>{details}</Text>
            <Text style={paragraph}><Link href={bookingUrl} style={link}>View your booking</Link></Text>
            <Text style={paragraph}>Questions? Reply to this email and quote <strong>{bookingRef}</strong>.</Text>
            <Text style={signoff}>the farmnport team</Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>farmnport · 13 Grace Rd, Winston Park, Marondera, Zimbabwe</Text>
            <Text style={footerText}>© {new Date().getFullYear()} farmnport. All rights reserved.</Text>
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
const signoff: React.CSSProperties = { fontSize: "14px", color: "#64748b", margin: 0 }
const footer: React.CSSProperties = { padding: "0 40px 32px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: 0, textAlign: "center" }
