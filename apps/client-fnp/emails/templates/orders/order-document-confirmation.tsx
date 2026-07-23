import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

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
  const itemLines = items.map((item) => item.product_name).join("\n")

  return (
    <Html lang="en">
      <Head />
      <Preview>Your document is ready to download — order {orderNumber} confirmed.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={content}>
            <Text style={brand}>farmnport</Text>

            <Text style={greeting}>Your document is ready, {name}.</Text>
            <Text style={paragraph}>
              Payment confirmed. You can now download your document from your account at any time.
            </Text>

            <Text style={paragraph}>Order number: <strong>{orderNumber}</strong></Text>

            <Text style={paragraph}>
              Documents purchased:{"\n"}{itemLines}
            </Text>

            <Text style={paragraph}>Total paid: {fmt(total)}</Text>

            <Text style={paragraph}>Payment ref: {paymentRef}</Text>

            <Text style={paragraph}>
              <Link href={downloadsUrl} style={link}>Download your document</Link>
            </Text>

            <Text style={signoff}>the farmnport team</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              farmnport &nbsp;·&nbsp; 13 Grace Rd, Winston Park, Marondera, Zimbabwe
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
