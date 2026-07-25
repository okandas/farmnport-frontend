import { Body, Button, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface VerifyReminderEmailProps {
  name?: string
  confirmUrl?: string
}

const UTM = "?utm_source=blast&utm_medium=email&utm_campaign=verify_reminder"

export default function VerifyReminderEmail({
  name = "Okandas",
  confirmUrl = "https://farmnport.com/verify/mail/preview",
}: VerifyReminderEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Verify your farmnport account to start trading</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brand}>farmnport</Text>
          </Section>

          {/* Greeting */}
          <Section style={content}>
            <Text style={greeting}>Hi {name},</Text>
            <Text style={paragraph}>
              You signed up on farmnport but haven't verified your email yet. A verified account unlocks everything you need to trade directly.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Value props */}
          <Section style={content}>
            <Text style={sectionLabel}>WHAT YOU GET</Text>
            <Text style={sectionTitle}>Why verify your account</Text>

            <Text style={subheading}>Receive order alerts</Text>
            <Text style={paragraph}>
              Get notified when buyers place orders, submit booking requests, or bid on your lots.
            </Text>

            <Text style={subheading}>List your produce for sale</Text>
            <Text style={paragraph}>
              Create bookings for regular supply, or list lots for immediate one-time sales — both free to use.
            </Text>

            <Text style={subheading}>Get price updates and market news</Text>
            <Text style={paragraph}>
              Stay up to date with livestock prices, produce market trends, and spray program guides.
            </Text>

            <Text style={subheading}>Connect with farmers and buyers</Text>
            <Text style={paragraph}>
              Join a growing network of agricultural businesses across Zimbabwe trading directly.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={content}>
            <Section style={buttonWrapper}>
              <Button href={confirmUrl} style={buttonPrimary}>Verify My Account</Button>
            </Section>
            <Text style={paragraph}>
              Once verified, you can start trading immediately:
            </Text>
            <Text style={linkList}>
              <Link href={`https://farmnport.com/bookings/new${UTM}`} style={inlineLink}>Create a Booking</Link> — for regular supply and demand{"\n"}
              <Link href={`https://farmnport.com/lots/new${UTM}`} style={inlineLink}>List a Lot</Link> — for immediate, one-time sales{"\n"}
              <Link href={`https://farmnport.com/prices${UTM}`} style={inlineLink}>View Prices</Link> — latest market prices
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Sign off */}
          <Section style={content}>
            <Text style={signoff}>See you on the platform,{"\n"}the farmnport team</Text>
            <Text style={muted}>
              If you didn't create this account you can safely ignore this email.
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
const subheading: React.CSSProperties = { fontSize: "15px", fontWeight: "600", color: "#0f172a", margin: "0 0 8px" }
const buttonWrapper: React.CSSProperties = { margin: "8px 0 24px" }
const buttonPrimary: React.CSSProperties = { backgroundColor: "#ea580c", borderRadius: "6px", color: "#ffffff", fontSize: "15px", fontWeight: "600", textDecoration: "none", textAlign: "center", display: "inline-block", padding: "14px 28px" }
const linkList: React.CSSProperties = { fontSize: "14px", lineHeight: "2", color: "#475569", margin: "0 0 16px", whiteSpace: "pre-wrap" }
const inlineLink: React.CSSProperties = { color: "#ea580c", fontWeight: "600", textDecoration: "none" }
const divider: React.CSSProperties = { borderColor: "#e2e8f0", margin: "8px 40px" }
const signoff: React.CSSProperties = { fontSize: "14px", color: "#64748b", lineHeight: "1.6", whiteSpace: "pre-wrap" }
const muted: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "8px 0 0" }
const footer: React.CSSProperties = { padding: "16px 40px 32px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", textAlign: "center" }
const footerLink: React.CSSProperties = { color: "#94a3b8", textDecoration: "underline" }
