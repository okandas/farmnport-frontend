import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components"

interface LotBidRejectedEmailProps {
  name?: string
  lotOwnerName?: string
  lotSlug?: string
}

export default function LotBidRejectedEmail({
  name = "Okandas",
  lotOwnerName = "Urban Fresh",
  lotSlug = "chickens-broilers-abc123",
}: LotBidRejectedEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your offer was not accepted</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={content}>
            <Text style={brand}>farmnport</Text>
            <Text style={greeting}>Hi {name},</Text>
            <Text style={paragraph}>
              Unfortunately, {lotOwnerName} did not accept your offer on lot {lotSlug}.
            </Text>
            <Text style={paragraph}>
              There are other lots available — <Link href="https://farmnport.com/lots" style={link}>browse what's currently listed</Link> and place a new offer.
            </Text>
            <Text style={signoff}>the farmnport team</Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>Copyright © <Link href="https://farmnport.com" style={footerLink}>farmnport.com</Link>  All rights reserved.</Text>
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
const footerLink: React.CSSProperties = { color: "#94a3b8", textDecoration: "underline" }
