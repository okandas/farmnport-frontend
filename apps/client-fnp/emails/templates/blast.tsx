import { Body, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface BlastEmailProps {
  name?: string
  message?: string
  subject?: string
  link?: string
  linkLabel?: string
}

const UTM = "?utm_source=blast&utm_medium=email&utm_campaign=custom_blast"

export default function BlastEmail({ name = "Okandas", message = "", link, linkLabel }: BlastEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{message.slice(0, 120)}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brand}>farmnport</Text>
          </Section>

          {/* Greeting + Message */}
          <Section style={content}>
            <Text style={greeting}>Hi {name},</Text>
            <Text style={paragraph}>{message}</Text>
            {link && (
              <Link href={link} style={inlineLink}>{linkLabel || link}</Link>
            )}
          </Section>

          <Hr style={divider} />

          {/* Action links */}
          <Section style={content}>
            <Text style={sectionLabel}>GET STARTED</Text>
            <Text style={sectionTitle}>Trade on farmnport</Text>
            <Text style={linkList}>
              <Link href={`https://farmnport.com/bookings/new${UTM}`} style={inlineLink}>Create a Booking</Link> — for regular supply and demand{"\n"}
              <Link href={`https://farmnport.com/lots/new${UTM}`} style={inlineLink}>List a Lot</Link> — for immediate, one-time sales{"\n"}
              <Link href={`https://farmnport.com/prices${UTM}`} style={inlineLink}>View Prices</Link> — latest market prices
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Sign-off */}
          <Section style={content}>
            <Text style={signoff}>Happy trading,{"\n"}the farmnport team</Text>
            <Text style={muted}>
              You are receiving this because you have an account on farmnport.com.
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
const sectionLabel: React.CSSProperties = { fontSize: "11px", fontWeight: "700", color: "#ea580c", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }
const sectionTitle: React.CSSProperties = { fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 12px", lineHeight: "1.3" }
const linkList: React.CSSProperties = { fontSize: "14px", lineHeight: "2", color: "#475569", margin: "0 0 16px", whiteSpace: "pre-wrap" }
const inlineLink: React.CSSProperties = { color: "#ea580c", fontWeight: "600", textDecoration: "none" }
const divider: React.CSSProperties = { borderColor: "#e2e8f0", margin: "8px 40px" }
const signoff: React.CSSProperties = { fontSize: "14px", color: "#64748b", lineHeight: "1.6", whiteSpace: "pre-wrap" }
const muted: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "8px 0 0" }
const footer: React.CSSProperties = { padding: "16px 40px 32px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", textAlign: "center" }
const footerLink: React.CSSProperties = { color: "#94a3b8", textDecoration: "underline" }
