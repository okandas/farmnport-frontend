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
  orderNumber: string
  orderId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  fulfillment: string
  deliveryAddress?: {
    name: string
    phone: string
    address: string
    city: string
    province: string
  }
  paymentProvider: string
  paymentRef: string
  adminOrderUrl: string
  placedAt: string
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function OrderDispatchEmail({
  orderNumber,
  orderId,
  customerName,
  customerEmail,
  items,
  subtotal,
  deliveryFee,
  total,
  fulfillment,
  deliveryAddress,
  paymentProvider,
  paymentRef,
  adminOrderUrl,
  placedAt,
}: OrderDispatchEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>New paid order {orderNumber} — action required.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={alertBanner}>
            <Text style={alertText}>NEW ORDER — ACTION REQUIRED</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>Order {orderNumber}</Text>
            <Text style={paragraph}>
              A new order has been paid and is ready for processing. Please review and dispatch.
            </Text>

            <Row style={metaRow}>
              <Column style={metaCol}>
                <Text style={metaLabel}>Placed</Text>
                <Text style={metaValue}>{placedAt}</Text>
              </Column>
              <Column style={metaCol}>
                <Text style={metaLabel}>Fulfillment</Text>
                <Text style={metaValue}>{fulfillment === "delivery" ? "Delivery" : "Collection"}</Text>
              </Column>
              <Column style={metaCol}>
                <Text style={metaLabel}>Payment</Text>
                <Text style={metaValue}>{paymentProvider}</Text>
              </Column>
            </Row>

            <Hr style={thinDivider} />

            {/* Customer */}
            <Text style={sectionLabel}>Customer</Text>
            <Text style={paragraph}>
              {customerName}<br />
              {customerEmail}
            </Text>

            {/* Delivery address */}
            {fulfillment === "delivery" && deliveryAddress && (
              <>
                <Text style={sectionLabel}>Deliver To</Text>
                <Text style={addressText}>
                  {deliveryAddress.name}<br />
                  {deliveryAddress.phone}<br />
                  {deliveryAddress.address}<br />
                  {deliveryAddress.city}, {deliveryAddress.province}
                </Text>
              </>
            )}

            <Hr style={thinDivider} />

            {/* Items */}
            <Text style={sectionLabel}>Items to Pack</Text>
            {items.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column style={itemQtyCol}>
                  <Text style={itemQty}>×{item.quantity}</Text>
                </Column>
                <Column style={itemNameCol}>
                  <Text style={itemText}>{item.product_name}</Text>
                </Column>
                <Column style={itemPriceCol}>
                  <Text style={itemPrice}>{formatPrice(item.line_total)}</Text>
                </Column>
              </Row>
            ))}

            <Hr style={thinDivider} />

            <Row style={totalRow}>
              <Column><Text style={totalLabel}>Subtotal</Text></Column>
              <Column style={totalValueCol}><Text style={totalValue}>{formatPrice(subtotal)}</Text></Column>
            </Row>
            {fulfillment === "delivery" && (
              <Row style={totalRow}>
                <Column><Text style={totalLabel}>Delivery fee</Text></Column>
                <Column style={totalValueCol}><Text style={totalValue}>{formatPrice(deliveryFee)}</Text></Column>
              </Row>
            )}
            <Row style={totalRow}>
              <Column><Text style={grandTotalLabel}>Total Paid</Text></Column>
              <Column style={totalValueCol}><Text style={grandTotalValue}>{formatPrice(total)}</Text></Column>
            </Row>

            <Hr style={thinDivider} />

            <Text style={sectionLabel}>Payment Reference</Text>
            <Text style={paragraph}>{paymentRef}</Text>

            <Button href={adminOrderUrl} style={button}>Open in Admin</Button>
          </Section>

          <Hr style={divider} />
          <Text style={footer}>
            farmnport internal notification &nbsp;•&nbsp; do not reply
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

const alertBanner: React.CSSProperties = {
  backgroundColor: "#2ea664",
  padding: "12px 40px",
}

const alertText: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "0.1em",
  color: "#ffffff",
  margin: 0,
}

const divider: React.CSSProperties = {
  borderColor: "#e8ecef",
  margin: "0 40px",
}

const thinDivider: React.CSSProperties = {
  borderColor: "#e8ecef",
  margin: "12px 0",
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

const sectionLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#999999",
  marginTop: "20px",
  marginBottom: "8px",
}

const metaRow: React.CSSProperties = {
  margin: "16px 0",
}

const metaCol: React.CSSProperties = {
  verticalAlign: "top",
  paddingRight: "12px",
}

const metaLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#999999",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  margin: 0,
}

const metaValue: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#374151",
  margin: "4px 0 0",
}

const itemRow: React.CSSProperties = {
  marginBottom: "8px",
}

const itemQtyCol: React.CSSProperties = {
  verticalAlign: "top",
  width: "36px",
}

const itemNameCol: React.CSSProperties = {
  verticalAlign: "top",
}

const itemPriceCol: React.CSSProperties = {
  verticalAlign: "top",
  textAlign: "right",
  width: "100px",
}

const itemQty: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#2ea664",
  margin: 0,
}

const itemText: React.CSSProperties = {
  fontSize: "15px",
  color: "#374151",
  margin: 0,
}

const itemPrice: React.CSSProperties = {
  fontSize: "15px",
  color: "#374151",
  margin: 0,
  textAlign: "right",
}

const totalRow: React.CSSProperties = {
  marginBottom: "4px",
}

const totalValueCol: React.CSSProperties = {
  textAlign: "right",
  width: "100px",
}

const totalLabel: React.CSSProperties = {
  fontSize: "15px",
  color: "#5d7079",
  margin: "4px 0",
}

const totalValue: React.CSSProperties = {
  fontSize: "15px",
  color: "#374151",
  margin: "4px 0",
  textAlign: "right",
}

const grandTotalLabel: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#374151",
  margin: "4px 0",
}

const grandTotalValue: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#2ea664",
  margin: "4px 0",
  textAlign: "right",
}

const addressText: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.8",
  color: "#374151",
  marginBottom: "1em",
}

const button: React.CSSProperties = {
  backgroundColor: "#374151",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "13px 24px",
  marginTop: "16px",
  marginBottom: "8px",
}

const footer: React.CSSProperties = {
  fontSize: "12.5px",
  color: "#999999",
  textAlign: "center",
  padding: "16px 40px",
}
