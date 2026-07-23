import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components"

interface MagicLinkEmailProps {
  name?: string
  resetUrl?: string
}

export default function MagicLinkEmail({
  name = "Okandas",
  resetUrl = "https://farmnport.com/reset/client/preview",
}: MagicLinkEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your farmnport password — link expires in 20 minutes.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={content}>
            <Text style={brand}>farmnport</Text>
            <Text style={greeting}>Password reset</Text>
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>
              We received a request to reset the password for your farmnport account.{"\n"}
              <Link href={resetUrl} style={link}>Click here to choose a new password</Link>.
            </Text>
            <Text style={paragraph}>Or copy this link into your browser:{"\n"}{resetUrl}</Text>
            <Text style={paragraph}>
              This link expires in <strong>20 minutes</strong>. If you didn't request a password
              reset you can safely ignore this email.
            </Text>
            <Text style={signoff}>the farmnport team</Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              farmnport · 13 Grace Rd, Winston Park, Marondera, Zimbabwe
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} farmnport. All rights reserved.
            </Text>
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
