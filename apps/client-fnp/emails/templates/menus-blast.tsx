import { Body, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"
import { titleCase } from "@/lib/utilities"

interface MenusBlastEmailProps {
  name?: string
  message?: string
  subject?: string
}

const UTM = "?utm_source=blast&utm_medium=email&utm_campaign=menus_blast"

export default function MenusBlastEmail({ name = "there", message = "" }: MenusBlastEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{message.slice(0, 120)}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brand}>menus</Text>
            <Text style={brandSub}>menus.co.zw</Text>
          </Section>

          {/* Greeting + Message */}
          <Section style={content}>
            <Text style={greeting}>Hi {titleCase(name)},</Text>
            <Text style={paragraph}>{message}</Text>
          </Section>

          <Hr style={divider} />

          {/* Action links */}
          <Section style={content}>
            <Text style={sectionLabel}>EXPLORE</Text>
            <Text style={sectionTitle}>Discover restaurants near you</Text>
            <Text style={linkList}>
              <Link href={`https://menus.co.zw/restaurants/harare${UTM}`} style={inlineLink}>Restaurants in Harare</Link>{"\n"}
              <Link href={`https://menus.co.zw/restaurants/bulawayo${UTM}`} style={inlineLink}>Restaurants in Bulawayo</Link>{"\n"}
              <Link href={`https://menus.co.zw${UTM}`} style={inlineLink}>Browse All Restaurants</Link>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Sign-off */}
          <Section style={content}>
            <Text style={signoff}>Enjoy your meal,{"\n"}the menus team</Text>
            <Text style={muted}>
              You are receiving this because you have an account on menus.co.zw.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              menus &nbsp;&middot;&nbsp; Marondera, Zimbabwe
            </Text>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} <Link href="https://menus.co.zw" style={footerLink}>menus.co.zw</Link>. All rights reserved.
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
const brand: React.CSSProperties = { fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "0" }
const brandSub: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 8px" }
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
