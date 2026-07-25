import { Body, Button, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface Props { name?: string; bookingRef?: string; productName?: string; quantity?: number; depositAmount?: string; balanceDue?: string; bookingUrl?: string }

export default function PreorderDepositPaidEmail({
  name = "Okandas",
  bookingRef = "FNP-BK-PO-0001",
  productName = "Fivet Cobb 500 Day-Old Chicks",
  quantity = 100,
  depositAmount = "$50.00",
  balanceDue = "$450.00",
  bookingUrl = "https://farmnport.com/account/bookings/preview",
}: Props) {
  const details = `Produce              ${productName}\nQuantity             ${quantity} units\nAmount paid          ${depositAmount}\nBalance on collection  ${balanceDue}`

  return (
    <Html lang="en">
      <Head />
      <Preview>{`Payment received — ${String(quantity)} ${productName} secured`}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brand}>farmnport</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>Payment received, {name}!</Text>
            <Text style={paragraph}>Your payment of {depositAmount} has been received. Your {quantity} {productName} are secured. We&apos;ll notify you when your order is ready for collection.</Text>
            <Text style={paragraph}>Booking reference: <strong>{bookingRef}</strong></Text>
            <Text style={paragraph}>{details}</Text>
          </Section>

          <Hr style={divider} />

          <Section style={content}>
            <Section style={buttonWrapper}>
              <Button href={bookingUrl} style={buttonPrimary}>View your booking</Button>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section style={content}>
            <Text style={signoff}>
              Questions? Reply to this email and quote <strong>{bookingRef}</strong>.{"\n\n"}the farmnport team
            </Text>
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
