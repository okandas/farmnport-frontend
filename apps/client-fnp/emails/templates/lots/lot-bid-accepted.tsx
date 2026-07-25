import { Body, Button, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface LotBidAcceptedEmailProps {
  name?: string
  lotOwnerName?: string
  lotSlug?: string
  quantity?: string
  unit?: string
  pricePerUnit?: string
  total?: string
}

export default function LotBidAcceptedEmail({
  name = "Okandas",
  lotOwnerName = "Urban Fresh",
  lotSlug = "chickens-broilers-abc123",
  quantity = "100.00",
  unit = "bird",
  pricePerUnit = "$5.00",
  total = "$500.00",
}: LotBidAcceptedEmailProps) {
  const lotUrl = `https://farmnport.com/lots/${lotSlug}`

  return (
    <Html lang="en">
      <Head />
      <Preview>Your offer was accepted — {total} total</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brand}>farmnport</Text>
          </Section>

          {/* Greeting */}
          <Section style={content}>
            <Text style={greeting}>Great news, {name}!</Text>
            <Text style={paragraph}>
              {lotOwnerName} has accepted your offer. Complete payment within 24 hours to secure this lot.
            </Text>
            <Text style={paragraph}>
              {"Quantity: "}{quantity} {unit}{"\n"}
              {"Price per "}{unit}{": "}{pricePerUnit}{"\n"}
              {"Total: "}{total}
            </Text>
            <Text style={urgent}>
              You have 24 hours to complete payment. After that, the lot may reopen to other bidders.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={content}>
            <Section style={buttonWrapper}>
              <Button href={lotUrl} style={buttonPrimary}>Complete Payment</Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Sign off */}
          <Section style={content}>
            <Text style={signoff}>the farmnport team</Text>
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
const urgent: React.CSSProperties = { fontSize: "13px", color: "#dc2626", lineHeight: "1.6", margin: "0 0 16px" }
const buttonWrapper: React.CSSProperties = { margin: "8px 0 24px" }
const buttonPrimary: React.CSSProperties = { backgroundColor: "#ea580c", borderRadius: "6px", color: "#ffffff", fontSize: "15px", fontWeight: "600", textDecoration: "none", textAlign: "center", display: "inline-block", padding: "14px 28px" }
const divider: React.CSSProperties = { borderColor: "#e2e8f0", margin: "8px 40px" }
const signoff: React.CSSProperties = { fontSize: "14px", color: "#64748b", lineHeight: "1.6", whiteSpace: "pre-wrap" }
const footer: React.CSSProperties = { padding: "16px 40px 32px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", textAlign: "center" }
const footerLink: React.CSSProperties = { color: "#94a3b8", textDecoration: "underline" }
