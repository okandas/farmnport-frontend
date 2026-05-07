import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

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
      <Preview>Welcome to farm&port — confirm your email to get started.</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brandName}>farm<span style={amp}>&amp;</span>port</Text>
            <Text style={brandTagline}>getting you to market</Text>
          </Section>

          {/* Body */}
          <Section style={content}>
            <Text style={greeting}>Welcome, {name}.</Text>
            <Text style={paragraph}>
              You've taken the first step into a new frontier for agribusiness. We're excited to have
              you on board and will follow up with a short call to verify you and your business.
            </Text>
            <Text style={paragraph}>
              To get started, please confirm your email address:
            </Text>
            <Section style={buttonWrapper}>
              <Button href={confirmUrl} style={button}>Confirm Email</Button>
            </Section>
            <Text style={paragraph}>
              If you didn't create this account you can safely ignore this email.
            </Text>
            <Hr style={divider} />
            <Text style={signoff}>Welcome to business,<br />the farm&amp;port team</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              farm&amp;port &nbsp;·&nbsp; 13 Grace Rd, Winston Park, Marondera, Zimbabwe
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} farm&amp;port. All rights reserved.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  margin: 0,
  padding: "40px 0",
}

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "580px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
}

const header: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "28px 40px 20px",
}

const brandName: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#0f172a",
  margin: "0 0 2px",
  letterSpacing: "-0.3px",
}

const amp: React.CSSProperties = {
  color: "#ea580c",
}

const brandTagline: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: 0,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
}

const content: React.CSSProperties = {
  padding: "36px 40px 24px",
}

const greeting: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#0f172a",
  margin: "0 0 20px",
}

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#475569",
  margin: "0 0 16px",
}

const buttonWrapper: React.CSSProperties = {
  margin: "28px 0",
}

const button: React.CSSProperties = {
  backgroundColor: "#ea580c",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "14px 28px",
}

const divider: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "24px 0",
}

const signoff: React.CSSProperties = {
  fontSize: "14px",
  color: "#64748b",
  lineHeight: "1.6",
  margin: 0,
}

const footer: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderTop: "1px solid #e2e8f0",
  padding: "20px 40px",
}

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "0 0 4px",
  textAlign: "center",
}
