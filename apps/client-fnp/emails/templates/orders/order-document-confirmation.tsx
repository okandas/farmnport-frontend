import { Body, Button, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface OrderItem {
  product_name: string
  quantity: number
  unit_price: number
  line_total: number
}

interface OrderDocumentConfirmationEmailProps {
  name?: string
  orderNumber?: string
  items?: OrderItem[]
  total?: number
  paymentRef?: string
  downloadsUrl?: string
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

const PREVIEW_ITEMS: OrderItem[] = [
  { product_name: "Broiler Management Guide", quantity: 1, unit_price: 100, line_total: 100 },
]

export default function OrderDocumentConfirmationEmail({
  name = "Okandas",
  orderNumber = "FNP-0001",
  items = PREVIEW_ITEMS,
  total = 100,
  paymentRef = "FNP-DOC-PREVIEW",
  downloadsUrl = "https://farmnport.com/account/documents",
}: OrderDocumentConfirmationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your document is ready to download — order {orderNumber} confirmed.</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brand}>farmnport</Text>
          </Section>

          {/* Greeting */}
          <Section style={content}>
            <Text style={greeting}>Your document is ready, {name}.</Text>
            <Text style={paragraph}>
              Payment confirmed. You can now download your document from your account at any time.
            </Text>
            <Text style={paragraph}>
              {"Order number: "}<strong>{orderNumber}</strong>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Document details */}
          <Section style={content}>
            <Text style={subheading}>Documents purchased</Text>
            {items.map((item, i) => (
              <Text key={i} style={paragraph}>{item.product_name}</Text>
            ))}
            <Text style={paragraph}>
              {"Total paid: "}{fmt(total)}{"\n"}{"Payment ref: "}{paymentRef}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={content}>
            <Section style={buttonWrapper}>
              <Button href={downloadsUrl} style={buttonPrimary}>Download your document</Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Sign-off */}
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
const subheading: React.CSSProperties = { fontSize: "15px", fontWeight: "600", color: "#0f172a", margin: "0 0 8px" }
const buttonWrapper: React.CSSProperties = { margin: "8px 0 24px" }
const buttonPrimary: React.CSSProperties = { backgroundColor: "#ea580c", borderRadius: "6px", color: "#ffffff", fontSize: "15px", fontWeight: "600", textDecoration: "none", textAlign: "center", display: "inline-block", padding: "14px 28px" }
const divider: React.CSSProperties = { borderColor: "#e2e8f0", margin: "8px 40px" }
const signoff: React.CSSProperties = { fontSize: "14px", color: "#64748b", lineHeight: "1.6", whiteSpace: "pre-wrap" }
const footer: React.CSSProperties = { padding: "16px 40px 32px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", textAlign: "center" }
const footerLink: React.CSSProperties = { color: "#94a3b8", textDecoration: "underline" }
