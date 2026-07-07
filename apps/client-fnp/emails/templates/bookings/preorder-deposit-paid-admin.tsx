import { Body, Button, Container, Head, Hr, Html, Preview, Row, Column, Section, Text } from "@react-email/components"

interface Props { bookingRef?: string; customerName?: string; productName?: string; quantity?: string; depositAmount?: string; adminUrl?: string }

export default function PreorderAmountPaidAdminEmail({
  bookingRef = "FNP-BK-PO-0001",
  customerName = "Okandas",
  productName = "Fivet Cobb 500 Day-Old Chicks",
  quantity = "100",
  depositAmount = "$50.00",
  adminUrl = "https://admin.farmnport.com",
}: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`Payment received from ${customerName} — ${quantity} ${productName}`}</Preview>
      <Body style={body}><Container style={container}>
        <Section style={header}><Text style={brandName}>farmnport</Text><Text style={brandTagline}>admin alert</Text></Section>
        <Hr style={headerDivider} />
        <Section style={content}>
          <Section style={pillWrapper}><Text style={pill}>Payment Received</Text></Section>
          <Text style={paragraph}>Payment received for a pre-order booking.</Text>
          <Section style={refCard}><Text style={refLabel}>Booking reference</Text><Text style={refNumber}>{bookingRef}</Text></Section>
          <Row style={detailRow}><Column style={detailKey}><Text style={keyText}>Customer</Text></Column><Column><Text style={valText}>{customerName}</Text></Column></Row>
          <Row style={detailRow}><Column style={detailKey}><Text style={keyText}>Produce</Text></Column><Column><Text style={valText}>{productName}</Text></Column></Row>
          <Row style={detailRow}><Column style={detailKey}><Text style={keyText}>Quantity</Text></Column><Column><Text style={valText}>{quantity} units</Text></Column></Row>
          <Row style={detailRow}><Column style={detailKey}><Text style={keyText}>Amount</Text></Column><Column><Text style={depositText}>{depositAmount}</Text></Column></Row>
          <Section style={buttonWrapper}><Button href={adminUrl} style={button}>View Booking</Button></Section>
        </Section>
        <Section style={footer}><Text style={footerText}>farmnport admin</Text></Section>
      </Container></Body>
    </Html>
  )
}

const body: React.CSSProperties = { backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", margin: 0, padding: "40px 0" }
const container: React.CSSProperties = { backgroundColor: "#ffffff", margin: "0 auto", maxWidth: "580px" }
const header: React.CSSProperties = { padding: "28px 40px 20px" }
const brandName: React.CSSProperties = { fontSize: "22px", fontWeight: "600", color: "#0f172a", margin: "0 0 2px", letterSpacing: "-0.3px" }
const brandTagline: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }
const headerDivider: React.CSSProperties = { borderColor: "#f1f5f9", margin: 0 }
const content: React.CSSProperties = { padding: "32px 40px 24px" }
const pillWrapper: React.CSSProperties = { marginBottom: "24px" }
const pill: React.CSSProperties = { display: "inline-block", fontSize: "12px", fontWeight: "600", letterSpacing: "0.04em", color: "#16a34a", border: "1px solid #16a34a", padding: "4px 12px", margin: 0 }
const paragraph: React.CSSProperties = { fontSize: "15px", lineHeight: "1.7", color: "#475569", margin: "0 0 24px" }
const refCard: React.CSSProperties = { backgroundColor: "#f8fafc", padding: "14px 18px", marginBottom: "28px" }
const refLabel: React.CSSProperties = { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }
const refNumber: React.CSSProperties = { fontSize: "20px", fontWeight: "600", color: "#0f172a", margin: 0 }
const detailRow: React.CSSProperties = { marginBottom: "8px" }
const detailKey: React.CSSProperties = { width: "160px", verticalAlign: "top" }
const keyText: React.CSSProperties = { fontSize: "13px", color: "#94a3b8", margin: 0 }
const valText: React.CSSProperties = { fontSize: "14px", color: "#0f172a", margin: 0 }
const depositText: React.CSSProperties = { fontSize: "14px", fontWeight: "600", color: "#16a34a", margin: 0 }
const buttonWrapper: React.CSSProperties = { margin: "28px 0 8px" }
const button: React.CSSProperties = { backgroundColor: "#ea580c", borderRadius: "6px", color: "#ffffff", fontSize: "14px", fontWeight: "600", textDecoration: "none", textAlign: "center", display: "inline-block", padding: "13px 24px" }
const footer: React.CSSProperties = { backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "20px 40px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", textAlign: "center" }
