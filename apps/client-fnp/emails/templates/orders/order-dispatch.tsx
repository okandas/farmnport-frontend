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
  return (
    <Html lang="en">
      <Head />
      <Preview>New order {orderNumber} — action required.</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brandName}>farm<span style={amp}>&amp;</span>port</Text>
            <Text style={brandTagline}>internal dispatch alert</Text>
          </Section>

          {/* Body */}
          <Section style={content}>

            {/* Alert pill */}
            <Section style={pillWrapper}>
              <Text style={pill}>New Paid Order — Action Required</Text>
            </Section>

            <Row style={metaGrid}>
              <Column style={metaCol}>
                <Text style={metaLabel}>Order</Text>
                <Text style={metaValue}>{orderNumber}</Text>
              </Column>
              <Column style={metaCol}>
                <Text style={metaLabel}>Placed</Text>
                <Text style={metaValue}>{placedAt}</Text>
              </Column>
              <Column style={metaCol}>
                <Text style={metaLabel}>Fulfillment</Text>
                <Text style={metaValue}>{fulfillment === "delivery" ? "Delivery" : "Collection"}</Text>
              </Column>
            </Row>

            <Hr style={thinDivider} />

            {/* Customer */}
            <Text style={sectionLabel}>Customer</Text>
            <Text style={metaValue}>{customerName}</Text>
            <Text style={subValue}>{customerEmail}</Text>

            {/* Deliver to */}
            {fulfillment === "delivery" && deliveryAddress && (
              <>
                <Text style={sectionLabel}>Deliver to</Text>
                <Text style={addressBlock}>
                  {deliveryAddress.name}<br />
                  {deliveryAddress.phone}<br />
                  {deliveryAddress.address}<br />
                  {deliveryAddress.city}, {deliveryAddress.province}
                </Text>
              </>
            )}

            <Hr style={thinDivider} />

            {/* Items to pack */}
            <Text style={sectionLabel}>Items to pack</Text>
            {items.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column style={qtyCol}>
                  <Text style={qty}>×{item.quantity}</Text>
                </Column>
                <Column>
                  <Text style={itemName}>{item.product_name}</Text>
                </Column>
                <Column style={priceCol}>
                  <Text style={itemPrice}>{fmt(item.line_total)}</Text>
                </Column>
              </Row>
            ))}

            <Hr style={thinDivider} />

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

            <Text style={sectionLabel}>Payment</Text>
            <Text style={metaValue}>{paymentProvider}</Text>
            <Text style={subValue}>Ref: {paymentRef}</Text>

            <Section style={buttonWrapper}>
              <Button href={adminOrderUrl} style={button}>Open in Admin</Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              farm&amp;port internal notification &nbsp;·&nbsp; do not reply to this email
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

const pillWrapper: React.CSSProperties = {
  marginBottom: "20px",
}

const pill: React.CSSProperties = {
  display: "inline-block",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.04em",
  color: "#ea580c",
  border: "1px solid #ea580c",
  borderRadius: "999px",
  padding: "4px 12px",
  margin: 0,
}

const content: React.CSSProperties = {
  padding: "28px 40px 24px",
}

const metaGrid: React.CSSProperties = {
  marginBottom: "4px",
}

const metaCol: React.CSSProperties = {
  verticalAlign: "top",
  paddingRight: "16px",
}

const metaLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  margin: "0 0 3px",
}

const metaValue: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#0f172a",
  margin: "0 0 4px",
}

const subValue: React.CSSProperties = {
  fontSize: "13px",
  color: "#64748b",
  margin: "0 0 16px",
}

const sectionLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#94a3b8",
  margin: "16px 0 8px",
}

const addressBlock: React.CSSProperties = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.8",
  margin: "0 0 8px",
}

const thinDivider: React.CSSProperties = {
  borderColor: "#f1f5f9",
  margin: "16px 0",
}

const itemRow: React.CSSProperties = {
  marginBottom: "8px",
}

const qtyCol: React.CSSProperties = {
  width: "32px",
  verticalAlign: "top",
}

const priceCol: React.CSSProperties = {
  width: "80px",
  textAlign: "right",
  verticalAlign: "top",
}

const qty: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#ea580c",
  margin: 0,
}

const itemName: React.CSSProperties = {
  fontSize: "14px",
  color: "#0f172a",
  margin: 0,
}

const itemPrice: React.CSSProperties = {
  fontSize: "14px",
  color: "#0f172a",
  margin: 0,
  textAlign: "right",
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

const buttonWrapper: React.CSSProperties = {
  margin: "24px 0 8px",
}

const button: React.CSSProperties = {
  backgroundColor: "#0f172a",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "13px 24px",
}

const footer: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderTop: "1px solid #e2e8f0",
  padding: "16px 40px",
}

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: 0,
  textAlign: "center",
}
