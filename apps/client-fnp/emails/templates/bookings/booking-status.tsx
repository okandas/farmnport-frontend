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

interface BookingStatusEmailProps {
  name?: string
  bookingRef?: string
  status?: string
  statusMessage?: string
  estimatedDate?: string
  bookingUrl?: string
}

const STATUS_COLORS: Record<string, string> = {
  confirmed:   "#16a34a",
  dispatched:  "#8b5cf6",
  ready:       "#0d9488",
  completed:   "#16a34a",
  cancelled:   "#ef4444",
}

const STATUS_LABELS: Record<string, string> = {
  confirmed:   "Confirmed",
  dispatched:  "On Its Way",
  ready:       "Ready for Collection",
  completed:   "Completed",
  cancelled:   "Cancelled",
}

const STATUS_MESSAGES: Record<string, string> = {
  confirmed:   "Your booking has been confirmed. We'll be in touch with collection details.",
  dispatched:  "Your order is on its way. Estimated arrival date is shown below.",
  ready:       "Your order is ready for collection. Please bring your booking reference.",
  completed:   "Your booking is complete. Thank you for sourcing with farmnport.",
  cancelled:   "Your booking has been cancelled. Contact us if you have any questions.",
}

export default function BookingStatusEmail({
  name = "Okandas",
  bookingRef = "FNP-BK-0001",
  status = "ready",
  statusMessage = "",
  estimatedDate = "",
  bookingUrl = "https://farmnport.com/account/bookings/preview",
}: BookingStatusEmailProps) {
  const color = STATUS_COLORS[status] ?? "#64748b"
  const label = STATUS_LABELS[status] ?? status
  const message = statusMessage || (STATUS_MESSAGES[status] ?? "")

  return (
    <Html lang="en">
      <Head />
      <Preview>Booking {bookingRef} — {label}</Preview>
      <Body style={body}>
        <Container style={container}>

          <Section style={header}>
            <Text style={brandName}>farmnport</Text>
            <Text style={brandTagline}>getting you to market</Text>
          </Section>

          <Hr style={headerDivider} />

          <Section style={content}>

            <Section style={pillWrapper}>
              <Text style={{ ...pill, color, borderColor: color }}>
                ● &nbsp;{label}
              </Text>
            </Section>

            <Text style={greeting}>Booking update</Text>
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>{message}</Text>

            {estimatedDate && (
              <Text style={paragraph}>
                <strong>Estimated date:</strong> {estimatedDate}
              </Text>
            )}

            <Section style={refCard}>
              <Text style={refLabel}>Booking reference</Text>
              <Text style={refNumber}>{bookingRef}</Text>
            </Section>

            <Section style={buttonWrapper}>
              <Button href={bookingUrl} style={button}>View your booking</Button>
            </Section>

            <Hr style={divider} />
            <Text style={helpText}>
              Questions? Reply to this email and quote <strong>{bookingRef}</strong>.
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

const body: React.CSSProperties = { backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", margin: 0, padding: "40px 0" }
const container: React.CSSProperties = { backgroundColor: "#ffffff", margin: "0 auto", maxWidth: "580px", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
const header: React.CSSProperties = { backgroundColor: "#ffffff", padding: "28px 40px 20px" }
const brandName: React.CSSProperties = { fontSize: "22px", color: "#0f172a", margin: "0 0 2px", letterSpacing: "-0.3px" }
const brandTagline: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }
const headerDivider: React.CSSProperties = { borderColor: "#f1f5f9", margin: 0 }
const content: React.CSSProperties = { padding: "32px 40px 24px" }
const pillWrapper: React.CSSProperties = { marginBottom: "24px" }
const pill: React.CSSProperties = { display: "inline-block", fontSize: "12px", letterSpacing: "0.04em", border: "1px solid", borderRadius: "999px", padding: "4px 12px", margin: 0, backgroundColor: "#ffffff" }
const greeting: React.CSSProperties = { fontSize: "20px", color: "#0f172a", margin: "0 0 12px" }
const paragraph: React.CSSProperties = { fontSize: "15px", lineHeight: "1.7", color: "#475569", margin: "0 0 16px" }
const refCard: React.CSSProperties = { backgroundColor: "#f8fafc", borderRadius: "6px", padding: "14px 18px", margin: "20px 0" }
const refLabel: React.CSSProperties = { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }
const refNumber: React.CSSProperties = { fontSize: "17px", fontWeight: "600", color: "#0f172a", margin: 0 }
const buttonWrapper: React.CSSProperties = { margin: "24px 0 8px" }
const button: React.CSSProperties = { backgroundColor: "#ea580c", borderRadius: "6px", color: "#ffffff", fontSize: "14px", fontWeight: "600", textDecoration: "none", textAlign: "center", display: "inline-block", padding: "13px 24px" }
const divider: React.CSSProperties = { borderColor: "#e2e8f0", margin: "24px 0" }
const helpText: React.CSSProperties = { fontSize: "13px", color: "#94a3b8", lineHeight: "1.6", margin: "0 0 16px" }
const signoff: React.CSSProperties = { fontSize: "14px", color: "#64748b", margin: 0 }
const footer: React.CSSProperties = { backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "20px 40px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", textAlign: "center" }
