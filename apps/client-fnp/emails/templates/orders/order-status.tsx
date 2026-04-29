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
  name: string
  orderNumber: string
  status: string
  statusMessage: string
  orderUrl: string
}

const STATUS_COLORS: Record<string, string> = {
  processing: "#3b82f6",
  dispatched:  "#8b5cf6",
  ready:       "#0d9488",
  delivered:   "#2ea664",
  cancelled:   "#ef4444",
}

const STATUS_LABELS: Record<string, string> = {
  processing: "Being Processed",
  dispatched:  "On Its Way",
  ready:       "Ready for Collection",
  delivered:   "Delivered",
  cancelled:   "Cancelled",
}

export default function OrderStatusEmail({
  name,
  orderNumber,
  status,
  statusMessage,
  orderUrl,
}: OrderStatusEmailProps) {
  const color = STATUS_COLORS[status] ?? "#5d7079"
  const label = STATUS_LABELS[status] ?? status

  return (
    <Html lang="en">
      <Head />
      <Preview>Order {orderNumber} update: {label}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={logo}>farm &amp; port — <strong>getting you to market</strong></Text>
          <Hr style={divider} />

          <Section style={{ ...statusBanner, backgroundColor: color }}>
            <Text style={statusBannerText}>{label.toUpperCase()}</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>Order Update</Text>
            <Text style={paragraph}>Dear {name},</Text>
            <Text style={paragraph}>
              Your order <strong>{orderNumber}</strong> has been updated.
            </Text>

            <Section style={{ ...statusBox, borderLeftColor: color }}>
              <Text style={statusBoxLabel}>Current Status</Text>
              <Text style={{ ...statusBoxValue, color }}>{label}</Text>
              {statusMessage && (
                <Text style={statusBoxMessage}>{statusMessage}</Text>
              )}
            </Section>

            <Button href={orderUrl} style={{ ...button, backgroundColor: color }}>View Order</Button>

            <Text style={paragraph}>
              If you have any questions, please contact us and quote your order number.
            </Text>
            <Text style={paragraph}>the farmnport team</Text>
          </Section>

          <Hr style={divider} />
          <Text style={footer}>
            farmnport &nbsp;•&nbsp; 13 Grace Rd &nbsp;•&nbsp; Winston Park, Marondera, Zimbabwe
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: "#f2f5f7",
  fontFamily: "'Avenir', sans-serif",
  color: "#5d7079",
  paddingTop: "40px",
  paddingBottom: "40px",
}

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "4px",
  overflow: "hidden",
}

const logo: React.CSSProperties = {
  fontSize: "18px",
  padding: "25px 40px 10px",
  margin: 0,
}

const divider: React.CSSProperties = {
  borderColor: "#e8ecef",
  margin: "0 40px",
}

const statusBanner: React.CSSProperties = {
  padding: "12px 40px",
}

const statusBannerText: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "0.1em",
  color: "#ffffff",
  margin: 0,
}

const content: React.CSSProperties = {
  padding: "20px 40px",
}

const heading: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#374151",
  marginBottom: "8px",
}

const paragraph: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.6",
  marginBottom: "1em",
  color: "#5d7079",
}

const statusBox: React.CSSProperties = {
  borderLeft: "4px solid",
  borderLeftColor: "#5d7079",
  paddingLeft: "16px",
  marginBottom: "20px",
  marginTop: "8px",
}

const statusBoxLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#999999",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  margin: 0,
}

const statusBoxValue: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "700",
  margin: "4px 0 4px",
}

const statusBoxMessage: React.CSSProperties = {
  fontSize: "14px",
  color: "#5d7079",
  margin: 0,
  lineHeight: "1.5",
}

const button: React.CSSProperties = {
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "13px 24px",
  marginBottom: "20px",
}

const footer: React.CSSProperties = {
  fontSize: "12.5px",
  color: "#999999",
  textAlign: "center",
  padding: "16px 40px",
}
