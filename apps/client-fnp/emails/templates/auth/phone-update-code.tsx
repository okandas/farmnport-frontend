import { Body, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"
import { titleCase } from "@/lib/utilities"

interface PhoneUpdateCodeEmailProps {
  name?: string
  code?: string
  phone?: string
}

export default function PhoneUpdateCodeEmail({
  name = "Okandas",
  code = "123456",
  phone = "+263775099790",
}: PhoneUpdateCodeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your farmnport verification code: {code}</Preview>
      <Body style={body}>
        <Container style={container}>

          <Section style={header}>
            <Text style={brand}>farmnport</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {titleCase(name)},</Text>
            <Text style={paragraph}>
              You requested to update your phone number to {phone}. Use the verification code below to confirm the change.
            </Text>
          </Section>

          <Section style={codeWrapper}>
            <Text style={codeStyle}>{code}</Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              This code expires in 10 minutes. If you didn't request this change, you can safely ignore this email.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={content}>
            <Text style={signoff}>— the farmnport team</Text>
          </Section>

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
const codeWrapper: React.CSSProperties = { padding: "0 40px", textAlign: "center" }
const codeStyle: React.CSSProperties = { fontSize: "36px", fontWeight: "700", color: "#0f172a", letterSpacing: "8px", fontFamily: "monospace", backgroundColor: "#f1f5f9", borderRadius: "8px", padding: "20px 0", margin: "0 0 16px", textAlign: "center" }
const divider: React.CSSProperties = { borderColor: "#e2e8f0", margin: "8px 40px" }
const signoff: React.CSSProperties = { fontSize: "14px", color: "#64748b", lineHeight: "1.6", whiteSpace: "pre-wrap" }
const footer: React.CSSProperties = { padding: "16px 40px 32px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", textAlign: "center" }
const footerLink: React.CSSProperties = { color: "#94a3b8", textDecoration: "underline" }
