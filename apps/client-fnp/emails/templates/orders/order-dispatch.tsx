import { Body, Button, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface OrderItem {
  product_name: string
  quantity: number
  unit_price: number
  line_total: number
}

interface OrderDispatchEmailProps {
  orderNumber?: string
  orderId?: string
  customerName?: string
  customerEmail?: string
  items?: OrderItem[]
  subtotal?: number
  deliveryFee?: number
  total?: number
  fulfillment?: string
  deliveryAddress?: {
    name: string
    phone: string
    address: string
    city: string
    province: string
  }
  paymentProvider?: string
  paymentRef?: string
  adminOrderUrl?: string
  placedAt?: string
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

const PREVIEW_ITEMS: OrderItem[] = [
  { product_name: "Plesiva Star 60WG", quantity: 2, unit_price: 2500, line_total: 5000 },
]

export default function OrderDispatchEmail({
  orderNumber = "FNP-0001",
  orderId: _orderId = "preview",
  customerName = "Okandas",
  customerEmail = "okandas@farmnport.com",
  items = PREVIEW_ITEMS,
  subtotal = 5000,
  deliveryFee = 500,
  total = 5500,
  fulfillment = "delivery",
  deliveryAddress,
  paymentProvider = "BillPay",
  paymentRef = "FNP-ORD-PREVIEW",
  adminOrderUrl = "https://admin.farmnport.com/dashboard/farmnport/orders/sales/preview",
  placedAt = "30 Apr 2026, 10:00",
}: OrderDispatchEmailProps) {
  const totalsLines = [
    `Subtotal    ${fmt(subtotal)}`,
    fulfillment === "delivery" ? `Delivery    ${fmt(deliveryFee)}` : null,
    `Total paid  ${fmt(total)}`,
  ]
    .filter(Boolean)
    .join("\n")

  return (
    <Html lang="en">
      <Head />
      <Preview>New order {orderNumber} — action required.</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brand}>farmnport</Text>
          </Section>

          {/* Greeting */}
          <Section style={content}>
            <Text style={greeting}>New paid order — action required.</Text>
            <Text style={paragraph}>
              {"Order: "}{orderNumber}{"\n"}{"Placed: "}{placedAt}{"\n"}{"Fulfillment: "}{fulfillment === "delivery" ? "Delivery" : "Collection"}
            </Text>
            <Text style={paragraph}>
              {"Customer: "}{customerName}{"\n"}{customerEmail}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Order items */}
          <Section style={content}>
            {items.map((item, i) => (
              <Text key={i} style={paragraph}>
                {"×"}{item.quantity}{"  "}{item.product_name}{"  "}{fmt(item.line_total)}
              </Text>
            ))}
            <Text style={paragraph}>{totalsLines}</Text>
            <Text style={paragraph}>
              {"Payment: "}{paymentProvider}{"\n"}{"Ref: "}{paymentRef}
            </Text>
            {fulfillment === "delivery" && deliveryAddress && (
              <Text style={paragraph}>
                {"Deliver to:\n"}{deliveryAddress.name}{"\n"}{deliveryAddress.phone}{"\n"}{deliveryAddress.address}{"\n"}{deliveryAddress.city}, {deliveryAddress.province}
              </Text>
            )}
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={content}>
            <Section style={buttonWrapper}>
              <Button href={adminOrderUrl} style={buttonPrimary}>Open in Admin</Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              farmnport internal notification &nbsp;&middot;&nbsp; do not reply to this email
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
const buttonWrapper: React.CSSProperties = { margin: "8px 0 24px" }
const buttonPrimary: React.CSSProperties = { backgroundColor: "#ea580c", borderRadius: "6px", color: "#ffffff", fontSize: "15px", fontWeight: "600", textDecoration: "none", textAlign: "center", display: "inline-block", padding: "14px 28px" }
const divider: React.CSSProperties = { borderColor: "#e2e8f0", margin: "8px 40px" }
const footer: React.CSSProperties = { padding: "16px 40px 32px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", textAlign: "center" }
const footerLink: React.CSSProperties = { color: "#94a3b8", textDecoration: "underline" }
