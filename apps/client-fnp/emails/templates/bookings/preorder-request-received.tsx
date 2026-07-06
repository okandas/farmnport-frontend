import { Body, Button, Container, Head, Hr, Html, Preview, Row, Column, Section, Text } from "@react-email/components"

interface Props { name?: string; bookingRef?: string; productName?: string; quantity?: number; bookingUrl?: string }

export default function PreorderRequestReceivedEmail({ name = "Okandas", bookingRef = "FNP-BK-PO-0001", productName = "Fivet Cobb 500 Day-Old Chicks", quantity = 100, bookingUrl = "https://farmnport.com/account/bookings/preview" }: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Booking request {bookingRef} submitted — {productName}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}><Text style={brandName}>farmnport</Text><Text style={brandTagline}>getting you to market</Text></Section>
          <Hr style={headerDivider} />
          <Section style={content}>
            <Section style={pillWrapper}><Text style={pill}>📋 &nbsp;Request Submitted</Text></Section>
            <Text style={greeting}>Hi {name},</Text>
            <Text style={paragraph}>Your pre-order request has been submitted. We&apos;ll confirm availability and notify you to pay.</Text>
            <Section style={refCard}><Text style={refLabel}>Booking reference</Text><Text style={refNumber}>{bookingRef}</Text></Section>
            <Text style={sectionLabel}>Details</Text>
            <Row style={detailRow}><Column style={detailKey}><Text style={keyText}>Produce</Text></Column><Column><Text style={valText}>{productName}</Text></Column></Row>
            <Row style={detailRow}><Column style={detailKey}><Text style={keyText}>Quantity</Text></Column><Column><Text style={valText}>{quantity} units</Text></Column></Row>
            <Section style={buttonWrapper}><Button href={bookingUrl} style={button}>View your booking</Button></Section>
            <Hr style={divider} />
            <Text style={helpText}>Questions? Reply to this email and quote <strong>{bookingRef}</strong>.</Text>
            <Text style={signoff}>the farmnport team</Text>
          </Section>
          <Section style={footer}><Text style={footerText}>farmnport · 13 Grace Rd, Winston Park, Marondera, Zimbabwe</Text><Text style={footerText}>© {new Date().getFullYear()} farmnport. All rights reserved.</Text></Section>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = { backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", margin: 0, padding: "40px 0" }
const container: React.CSSProperties = { backgroundColor: "#ffffff", margin: "0 auto", maxWidth: "580px" }
const header: React.CSSProperties = { backgroundColor: "#ffffff", padding: "28px 40px 20px" }
const brandName: React.CSSProperties = { fontSize: "22px", color: "#0f172a", margin: "0 0 2px", letterSpacing: "-0.3px" }
const brandTagline: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }
const headerDivider: React.CSSProperties = { borderColor: "#f1f5f9", margin: 0 }
const content: React.CSSProperties = { padding: "32px 40px 24px" }
const pillWrapper: React.CSSProperties = { marginBottom: "24px" }
const pill: React.CSSProperties = { display: "inline-block", fontSize: "12px", letterSpacing: "0.04em", color: "#ca8a04", border: "1px solid #ca8a04", borderRadius: "999px", padding: "4px 12px", margin: 0 }
const greeting: React.CSSProperties = { fontSize: "20px", color: "#0f172a", margin: "0 0 12px" }
const paragraph: React.CSSProperties = { fontSize: "15px", lineHeight: "1.7", color: "#475569", margin: "0 0 24px" }
const refCard: React.CSSProperties = { backgroundColor: "#f8fafc", borderRadius: "6px", padding: "14px 18px", marginBottom: "28px" }
const refLabel: React.CSSProperties = { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }
const refNumber: React.CSSProperties = { fontSize: "20px", fontWeight: "600", color: "#0f172a", margin: 0 }
const sectionLabel: React.CSSProperties = { fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", margin: "0 0 12px" }
const detailRow: React.CSSProperties = { marginBottom: "8px" }
const detailKey: React.CSSProperties = { width: "160px", verticalAlign: "top" }
const keyText: React.CSSProperties = { fontSize: "13px", color: "#94a3b8", margin: 0 }
const valText: React.CSSProperties = { fontSize: "14px", color: "#0f172a", margin: 0 }
const buttonWrapper: React.CSSProperties = { margin: "28px 0 8px" }
const button: React.CSSProperties = { backgroundColor: "#ea580c", borderRadius: "6px", color: "#ffffff", fontSize: "14px", fontWeight: "600", textDecoration: "none", textAlign: "center", display: "inline-block", padding: "13px 24px" }
const divider: React.CSSProperties = { borderColor: "#e2e8f0", margin: "24px 0" }
const helpText: React.CSSProperties = { fontSize: "13px", color: "#94a3b8", lineHeight: "1.6", margin: "0 0 16px" }
const signoff: React.CSSProperties = { fontSize: "14px", color: "#64748b", margin: 0 }
const footer: React.CSSProperties = { backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "20px 40px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", textAlign: "center" }
