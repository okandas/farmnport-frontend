import { Body, Button, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface TermsUpdateEmailProps {
  name?: string
}

export default function TermsUpdateEmail({ name = "Member" }: TermsUpdateEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>We've updated our Terms of Service — WhatsApp and email notification preferences</Preview>
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
              We have made some updates to our Terms of Service that we would like you to know about.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* What changed */}
          <Section style={content}>
            <Text style={sectionLabel}>UPDATED</Text>
            <Text style={sectionTitle}>Communications and notifications</Text>
            <Text style={paragraph}>
              We have added a new section to our Terms of Service covering how we communicate with you. This means you may now receive:
            </Text>

            <Text style={subheading}>WhatsApp notifications</Text>
            <Text style={paragraph}>
              Order updates, delivery alerts, and price changes — sent to the phone number on your account.
            </Text>

            <Text style={subheading}>Email notifications</Text>
            <Text style={paragraph}>
              Platform updates, announcements, and offers.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Your control */}
          <Section style={content}>
            <Text style={sectionTitle}>You are in control</Text>
            <Text style={paragraph}>
              You can turn off WhatsApp notifications, email notifications, or both at any time from your account settings.
            </Text>
            <Section style={buttonWrapper}>
              <Button href="https://farmnport.com/account/profile?utm_source=blast&utm_medium=email&utm_campaign=terms_update&utm_content=cta_settings" style={buttonPrimary}>Manage Notification Settings</Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Full terms */}
          <Section style={content}>
            <Text style={paragraph}>
              You can read the full updated Terms of Service here:
            </Text>
            <Text style={linkList}>
              <Link href="https://farmnport.com/terms?utm_source=blast&utm_medium=email&utm_campaign=terms_update&utm_content=read_terms" style={inlineLink}>Read Terms of Service</Link>
            </Text>
            <Text style={paragraph}>
              By continuing to use farmnport, you agree to the updated terms. If you have any questions, reply to this email or contact us at sales@farmnport.com.
            </Text>
            <Text style={signoff}>Thank you,{"\n"}the farmnport team</Text>
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
const footer: React.CSSProperties = { padding: "16px 40px 32px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", textAlign: "center" }
const footerLink: React.CSSProperties = { color: "#94a3b8", textDecoration: "underline" }
