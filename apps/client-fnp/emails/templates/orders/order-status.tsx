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

interface OrderStatusEmailProps {
  name?: string
  orderNumber?: string
  status?: string
  statusMessage?: string
  orderUrl?: string
}

const STATUS_COLORS: Record<string, string> = {
  processing: "#3b82f6",
  dispatched:  "#8b5cf6",
  ready:       "#0d9488",
  delivered:   "#16a34a",
  cancelled:   "#ef4444",
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
  delivered:   "Your order has been delivered. Thank you for shopping with farm&port.",
  cancelled:   "Your order has been cancelled. Contact us if you have any questions.",
}

export default function OrderStatusEmail({
  name = "Okandas",
  orderNumber = "FNP-0001",
  status = "dispatched",
  statusMessage = "",
  orderUrl = "https://farmnport.com/account/orders/preview",
}: OrderStatusEmailProps) {
  const color = STATUS_COLORS[status] ?? "#64748b"
  const label = STATUS_LABELS[status] ?? status
  const message = statusMessage || (STATUS_MESSAGES[status] ?? "")

  return (
    <Html lang="en">
      <Head />
      <Preview>Order {orderNumber} — {label}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brandName}>farm<span style={amp}>&amp;</span>port</Text>
            <Text style={brandTagline}>getting you to market</Text>
          </Section>

          <Hr style={headerDivider} />

          {/* Body */}
          <Section style={content}>

            {/* Status pill */}
            <Section style={pillWrapper}>
              <Text style={{ ...pill, color, borderColor: color }}>
                ● &nbsp;{label}
              </Text>
            </Section>

            <Text style={greeting}>Order update</Text>
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>{message}</Text>

            {/* Order ref card */}
            <Section style={orderCard}>
              <Text style={orderCardLabel}>Order</Text>
              <Text style={orderCardNumber}>{orderNumber}</Text>
            </Section>

            <Section style={buttonWrapper}>
              <Button href={orderUrl} style={button}>Track your order</Button>
            </Section>

            <Hr style={divider} />
            <Text style={helpText}>
              Questions? Reply to this email and quote <strong>{orderNumber}</strong>.
            </Text>
            <Text style={signoff}>the farm&amp;port team</Text>
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

const headerDivider: React.CSSProperties = {
  borderColor: "#f1f5f9",
  margin: 0,
}

const content: React.CSSProperties = {
  padding: "32px 40px 24px",
}

const pillWrapper: React.CSSProperties = {
  marginBottom: "24px",
}

const pill: React.CSSProperties = {
  display: "inline-block",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.04em",
  border: "1px solid",
  borderRadius: "999px",
  padding: "4px 12px",
  margin: 0,
  backgroundColor: "#ffffff",
}

const greeting: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#0f172a",
  margin: "0 0 12px",
}

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#475569",
  margin: "0 0 16px",
}

const orderCard: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "6px",
  padding: "14px 18px",
  margin: "20px 0",
}

const orderCardLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  margin: "0 0 3px",
}

const orderCardNumber: React.CSSProperties = {
  fontSize: "17px",
  fontWeight: "700",
  color: "#0f172a",
  margin: 0,
}

const buttonWrapper: React.CSSProperties = {
  margin: "24px 0 8px",
}

const button: React.CSSProperties = {
  backgroundColor: "#ea580c",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "13px 24px",
}

const divider: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "24px 0",
}

const helpText: React.CSSProperties = {
  fontSize: "13px",
  color: "#94a3b8",
  lineHeight: "1.6",
  margin: "0 0 16px",
}

const signoff: React.CSSProperties = {
  fontSize: "14px",
  color: "#64748b",
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
