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
  name: string
  orderNumber: string
  orderId: string
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
  orderUrl: string
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function OrderConfirmationEmail({
  name,
  orderNumber,
  orderId,
  items,
  subtotal,
  deliveryFee,
  total,
  fulfillment,
  deliveryAddress,
  paymentProvider,
  paymentRef,
  orderUrl,
}: OrderConfirmationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Order {orderNumber} confirmed — thank you for your purchase.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={logo}>farm &amp; port — <strong>getting you to market</strong></Text>
          <Hr style={divider} />

          <Section style={content}>
            <Text style={heading}>Order Confirmed</Text>
            <Text style={paragraph}>Dear {name},</Text>
            <Text style={paragraph}>
              Thank you for your order. We have received your payment and your order is now being
              processed.
            </Text>

            <Section style={orderBox}>
              <Text style={orderBoxLabel}>Order Number</Text>
              <Text style={orderBoxValue}>{orderNumber}</Text>
            </Section>

            {/* Items */}
            <Text style={sectionLabel}>Items</Text>
            {items.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column style={itemNameCol}>
                  <Text style={itemText}>{item.product_name}</Text>
                  <Text style={itemMeta}>Qty: {item.quantity} × {formatPrice(item.unit_price)}</Text>
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
                <Column><Text style={totalLabel}>Delivery</Text></Column>
                <Column style={totalValueCol}><Text style={totalValue}>{formatPrice(deliveryFee)}</Text></Column>
              </Row>
            )}
            <Row style={totalRow}>
              <Column><Text style={grandTotalLabel}>Total</Text></Column>
              <Column style={totalValueCol}><Text style={grandTotalValue}>{formatPrice(total)}</Text></Column>
            </Row>

            <Hr style={thinDivider} />

            {/* Fulfillment */}
            <Text style={sectionLabel}>Fulfillment</Text>
            <Text style={paragraph}>
              {fulfillment === "delivery" ? "Delivery to your address" : "Collection from store"}
            </Text>
            {fulfillment === "delivery" && deliveryAddress && (
              <Text style={addressText}>
                {deliveryAddress.name}<br />
                {deliveryAddress.phone}<br />
                {deliveryAddress.address}<br />
                {deliveryAddress.city}, {deliveryAddress.province}
              </Text>
            )}

            {/* Payment */}
            <Text style={sectionLabel}>Payment</Text>
            <Text style={paragraph}>
              Provider: {paymentProvider}<br />
              Reference: {paymentRef}
            </Text>

            <Button href={orderUrl} style={button}>View Order</Button>

            <Text style={paragraph}>
              If you have any questions about your order, please contact us and quote your order
              number.
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
  color: "#2ea664",
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

const orderBox: React.CSSProperties = {
  backgroundColor: "#f2f5f7",
  borderRadius: "4px",
  padding: "12px 16px",
  marginBottom: "20px",
}

const orderBoxLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#999999",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  margin: 0,
}

const orderBoxValue: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#2ea664",
  margin: "4px 0 0",
}

const itemRow: React.CSSProperties = {
  marginBottom: "8px",
}

const itemNameCol: React.CSSProperties = {
  verticalAlign: "top",
}

const itemPriceCol: React.CSSProperties = {
  verticalAlign: "top",
  textAlign: "right",
  width: "100px",
}

const itemText: React.CSSProperties = {
  fontSize: "15px",
  color: "#374151",
  margin: 0,
}

const itemMeta: React.CSSProperties = {
  fontSize: "13px",
  color: "#9ca3af",
  margin: "2px 0 0",
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
  backgroundColor: "#2ea664",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "13px 24px",
  marginBottom: "20px",
  marginTop: "8px",
}

const footer: React.CSSProperties = {
  fontSize: "12.5px",
  color: "#999999",
  textAlign: "center",
  padding: "16px 40px",
}
