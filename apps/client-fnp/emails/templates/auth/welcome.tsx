import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components"

interface WelcomeEmailProps {
  name?: string
  confirmUrl?: string
}

export default function WelcomeEmail({
  name = "Okandas",
  confirmUrl = "https://farmnport.com/verify/mail/preview",
}: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to farmnport — confirm your email to get started.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={content}>
            <Text style={brand}>farmnport</Text>
            <Text style={greeting}>Welcome, {name}.</Text>
            <Text style={paragraph}>
              You've taken the first step into a new frontier for agribusiness. We're excited to have
              you on board and will follow up with a short call to verify you and your business.
            </Text>
            <Text style={paragraph}>
              To get started, please{" "}
              <Link href={confirmUrl} style={link}>confirm your email address</Link>.
            </Text>
            <Text style={paragraph}>
              If you didn't create this account you can safely ignore this email.
            </Text>
            <Text style={signoff}>Welcome to business,{"\n"}the farmnport team</Text>
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
