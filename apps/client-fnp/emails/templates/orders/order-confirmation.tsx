import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"

interface OrderItem {
  product_name: string
  quantity: number
  unit_price: number
  line_total: number
}

interface OrderConfirmationEmailProps {
  name?: string
  orderNumber?: string
  orderId?: string
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
  orderUrl?: string
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

const PREVIEW_ITEMS: OrderItem[] = [
  { product_name: "Plesiva Star 60WG", quantity: 2, unit_price: 2500, line_total: 5000 },
]

export default function OrderConfirmationEmail({
  name = "Okandas",
  orderNumber = "FNP-0001",
  orderId: _orderId = "preview",
  items = PREVIEW_ITEMS,
  subtotal = 5000,
  deliveryFee = 500,
  total = 5500,
  fulfillment = "delivery",
  deliveryAddress,
  paymentProvider = "BillPay",
  paymentRef = "FNP-ORD-PREVIEW",
  orderUrl = "https://farmnport.com/account/orders/preview",
}: OrderConfirmationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Order {orderNumber} confirmed — thank you for your purchase.</Preview>
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
              <Text style={pill}>✓ &nbsp;Order Confirmed</Text>
            </Section>

            <Text style={greeting}>Thanks for your order, {name}.</Text>
            <Text style={paragraph}>
              We've received your payment and your order is now being processed.
            </Text>

            {/* Order number card */}
            <Section style={orderCard}>
              <Text style={orderCardLabel}>Order number</Text>
              <Text style={orderCardNumber}>{orderNumber}</Text>
            </Section>

            {/* Items */}
            <Text style={sectionLabel}>Items</Text>
            {items.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column>
                  <Text style={itemName}>{item.product_name}</Text>
                  <Text style={itemMeta}>Qty {item.quantity} × {fmt(item.unit_price)}</Text>
                </Column>
                <Column style={itemPriceCol}>
                  <Text style={itemPrice}>{fmt(item.line_total)}</Text>
                </Column>
              </Row>
            ))}

            <Hr style={thinDivider} />

            {/* Totals */}
            <Row style={totalRow}>
              <Column><Text style={totalLabel}>Subtotal</Text></Column>
              <Column style={amountCol}><Text style={totalAmount}>{fmt(subtotal)}</Text></Column>
            </Row>
            {fulfillment === "delivery" && (
              <Row style={totalRow}>
                <Column><Text style={totalLabel}>Delivery</Text></Column>
                <Column style={amountCol}><Text style={totalAmount}>{fmt(deliveryFee)}</Text></Column>
              </Row>
            )}
            <Row style={totalRow}>
              <Column><Text style={grandLabel}>Total paid</Text></Column>
              <Column style={amountCol}><Text style={grandAmount}>{fmt(total)}</Text></Column>
            </Row>

            <Hr style={thinDivider} />

            {/* Fulfillment */}
            <Text style={sectionLabel}>Fulfillment</Text>
            <Text style={metaValue}>
              {fulfillment === "delivery" ? "Delivery to address" : "Click & Collect"}
            </Text>
            {fulfillment === "delivery" && deliveryAddress && (
              <Text style={addressBlock}>
                {deliveryAddress.name}<br />
                {deliveryAddress.phone}<br />
                {deliveryAddress.address}<br />
                {deliveryAddress.city}, {deliveryAddress.province}
              </Text>
            )}

            {/* Payment */}
            <Text style={sectionLabel}>Payment</Text>
            <Text style={metaValue}>{paymentProvider}</Text>
            <Text style={refText}>Ref: {paymentRef}</Text>

            <Section style={buttonWrapper}>
              <Button href={orderUrl} style={button}>View your order</Button>
            </Section>

            <Hr style={divider} />
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
  color: "#16a34a",
  border: "1px solid #16a34a",
  borderRadius: "999px",
  padding: "4px 12px",
  margin: 0,
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
  margin: "0 0 24px",
}

const orderCard: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "6px",
  padding: "14px 18px",
  marginBottom: "28px",
}

const orderCardLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  margin: "0 0 4px",
}

const orderCardNumber: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#0f172a",
  margin: 0,
}

const sectionLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#94a3b8",
  margin: "20px 0 10px",
}

const itemRow: React.CSSProperties = {
  marginBottom: "10px",
}

const itemName: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#0f172a",
  margin: 0,
}

const itemMeta: React.CSSProperties = {
  fontSize: "13px",
  color: "#94a3b8",
  margin: "2px 0 0",
}

const itemPriceCol: React.CSSProperties = {
  textAlign: "right",
  width: "80px",
  verticalAlign: "top",
}

const itemPrice: React.CSSProperties = {
  fontSize: "14px",
  color: "#0f172a",
  margin: 0,
  textAlign: "right",
}

const thinDivider: React.CSSProperties = {
  borderColor: "#f1f5f9",
  margin: "14px 0",
}

const totalRow: React.CSSProperties = {
  marginBottom: "6px",
}

const amountCol: React.CSSProperties = {
  textAlign: "right",
  width: "80px",
}

const totalLabel: React.CSSProperties = {
  fontSize: "14px",
  color: "#64748b",
  margin: 0,
}

const totalAmount: React.CSSProperties = {
  fontSize: "14px",
  color: "#0f172a",
  margin: 0,
  textAlign: "right",
}

const grandLabel: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#0f172a",
  margin: 0,
}

const grandAmount: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#ea580c",
  margin: 0,
  textAlign: "right",
}

const metaValue: React.CSSProperties = {
  fontSize: "14px",
  color: "#0f172a",
  margin: "0 0 4px",
}

const refText: React.CSSProperties = {
  fontSize: "13px",
  color: "#94a3b8",
  margin: 0,
}

const addressBlock: React.CSSProperties = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.8",
  margin: "4px 0 0",
}

const buttonWrapper: React.CSSProperties = {
  margin: "28px 0 8px",
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
