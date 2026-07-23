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

interface OrderStatusEmailProps {
  name?: string
  orderNumber?: string
  status?: string
  statusMessage?: string
  orderUrl?: string
}

const STATUS_LABELS: Record<string, string> = {
  processing: "Being Processed",
  dispatched:  "On Its Way",
  ready:       "Ready for Collection",
  delivered:   "Delivered",
  cancelled:   "Cancelled",
}

const STATUS_MESSAGES: Record<string, string> = {
  processing: "We've received your payment and your order is now being prepared.",
  dispatched:  "Your order has left our warehouse and is on its way to you.",
  ready:       "Your order is packed and ready for collection at our store.",
  delivered:   "Your order has been delivered. Thank you for sourcing with farmnport.",
  cancelled:   "Your order has been cancelled. Contact us if you have any questions.",
}

export default function OrderStatusEmail({
  name = "Okandas",
  orderNumber = "FNP-0001",
  status = "dispatched",
  statusMessage = "",
  orderUrl = "https://farmnport.com/account/orders/preview",
}: OrderStatusEmailProps) {
  const label = STATUS_LABELS[status] ?? status
  const message = statusMessage || (STATUS_MESSAGES[status] ?? "")

  return (
    <Html lang="en">
      <Head />
      <Preview>Order {orderNumber} — {label}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={content}>
            <Text style={brand}>farmnport</Text>

            <Text style={greeting}>Order update</Text>
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>{message}</Text>

            <Text style={paragraph}>Order: <strong>{orderNumber}</strong></Text>

            <Text style={paragraph}>
              <Link href={orderUrl} style={link}>Track your order</Link>
            </Text>

            <Text style={paragraph}>
              Questions? Reply to this email and quote <strong>{orderNumber}</strong>.
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
