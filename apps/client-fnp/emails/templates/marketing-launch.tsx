import { Body, Button, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface MarketingLaunchEmailProps {
  name?: string
}

const UTM_BOOKING_SELL = "?utm_source=blast&utm_medium=email&utm_campaign=bookings_lots_launch&utm_content=cta_booking_sell"
const UTM_BOOKING_BUY = "?utm_source=blast&utm_medium=email&utm_campaign=bookings_lots_launch&utm_content=cta_booking_buy"
const UTM_LOT_SELL = "?utm_source=blast&utm_medium=email&utm_campaign=bookings_lots_launch&utm_content=cta_lot_sell"
const UTM_LOT_BUY = "?utm_source=blast&utm_medium=email&utm_campaign=bookings_lots_launch&utm_content=cta_lot_buy"

export default function MarketingLaunchEmail({ name = "Member" }: MarketingLaunchEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Two new ways to trade on farmnport — create bookings or list lots</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brand}>farmnport</Text>
          </Section>

          {/* Greeting */}
          <Section style={content}>
            <Text style={greeting}>Hi {name},</Text>
            <Text style={paragraph}>
              We have added two new ways for you to trade directly on farmnport. Whether you supply or buy produce, these tools help you connect faster.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Section 1: Bookings */}
          <Section style={content}>
            <Text style={sectionLabel}>NEW</Text>
            <Text style={sectionTitle}>Bookings — for regular supply and demand</Text>
            <Text style={paragraph}>
              Use bookings for produce you supply or buy on a regular basis — daily, weekly, monthly, throughout the year.
            </Text>

            <Text style={subheading}>If you supply produce:</Text>
            <Text style={paragraph}>
              Create a booking so buyers can order from you on a schedule. Set your price, quantity, and availability — buyers come to you.
            </Text>
            <Section style={buttonWrapper}>
              <Button href={`https://farmnport.com/bookings/new/sell${UTM_BOOKING_SELL}`} style={buttonPrimary}>I Supply — Create a Booking</Button>
            </Section>

            <Text style={subheading}>If you buy produce:</Text>
            <Text style={paragraph}>
              Post what you need on a regular basis and let farmers come to you with their supply.
            </Text>
            <Section style={buttonWrapper}>
              <Button href={`https://farmnport.com/bookings/new/buy${UTM_BOOKING_BUY}`} style={buttonOutline}>I Buy — Post a Buying Request</Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Section 2: Lots */}
          <Section style={content}>
            <Text style={sectionLabel}>NEW</Text>
            <Text style={sectionTitle}>Lots — for immediate, one-time sales</Text>
            <Text style={paragraph}>
              Use lots when you have stock ready now or need produce immediately. Listings expire after a set number of days.
            </Text>

            <Text style={subheading}>If you have stock ready:</Text>
            <Text style={paragraph}>
              List your available produce and buyers can bid or buy directly. Set your price and how many days the listing stays live.
            </Text>
            <Section style={buttonWrapper}>
              <Button href={`https://farmnport.com/lots/new/sell${UTM_LOT_SELL}`} style={buttonPrimary}>I Have Stock — List a Lot</Button>
            </Section>

            <Text style={subheading}>If you need stock now:</Text>
            <Text style={paragraph}>
              Post what you need and let farmers offer their produce to you.
            </Text>
            <Section style={buttonWrapper}>
              <Button href={`https://farmnport.com/lots/new/buy${UTM_LOT_BUY}`} style={buttonOutline}>I Need Stock — Post a Request</Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Summary */}
          <Section style={content}>
            <Text style={subheading}>Quick summary</Text>
            <Text style={paragraph}>
              <strong>Bookings</strong> = recurring (daily, weekly, monthly, year-round){"\n"}
              <strong>Lots</strong> = one-time, immediate (expires in days)
            </Text>
            <Text style={paragraph}>
              Both are free to use. Both work for sellers and buyers.
            </Text>
            <Text style={signoff}>Happy trading,{"\n"}the farmnport team</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              farmnport &nbsp;&middot;&nbsp; 13 Grace Rd, Winston Park, Marondera, Zimbabwe
            </Text>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} <Link href="https://farmnport.com" style={footerLink}>farmnport.com</Link>. All rights reserved.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = { backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", margin: 0, padding: "40px 0" }
const container: React.CSSProperties = { backgroundColor: "#ffffff", margin: "0 auto", maxWidth: "580px", borderRadius: "8px", overflow: "hidden" }
const header: React.CSSProperties = { padding: "32px 40px 0" }
const brand: React.CSSProperties = { fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: 0 }
const content: React.CSSProperties = { padding: "16px 40px" }
const greeting: React.CSSProperties = { fontSize: "18px", fontWeight: "600", color: "#0f172a", margin: "0 0 12px" }
const paragraph: React.CSSProperties = { fontSize: "15px", lineHeight: "1.7", color: "#475569", margin: "0 0 16px", whiteSpace: "pre-wrap" }
const sectionLabel: React.CSSProperties = { fontSize: "11px", fontWeight: "700", color: "#ea580c", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }
const sectionTitle: React.CSSProperties = { fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 12px", lineHeight: "1.3" }
const subheading: React.CSSProperties = { fontSize: "15px", fontWeight: "600", color: "#0f172a", margin: "0 0 8px" }
const buttonWrapper: React.CSSProperties = { margin: "8px 0 24px" }
const buttonPrimary: React.CSSProperties = { backgroundColor: "#ea580c", borderRadius: "6px", color: "#ffffff", fontSize: "15px", fontWeight: "600", textDecoration: "none", textAlign: "center", display: "inline-block", padding: "14px 28px" }
const buttonOutline: React.CSSProperties = { backgroundColor: "#ffffff", borderRadius: "6px", color: "#0f172a", fontSize: "15px", fontWeight: "600", textDecoration: "none", textAlign: "center", display: "inline-block", padding: "12px 26px", border: "2px solid #e2e8f0" }
const divider: React.CSSProperties = { borderColor: "#e2e8f0", margin: "8px 40px" }
const signoff: React.CSSProperties = { fontSize: "14px", color: "#64748b", lineHeight: "1.6", whiteSpace: "pre-wrap" }
const footer: React.CSSProperties = { padding: "16px 40px 32px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", textAlign: "center" }
const footerLink: React.CSSProperties = { color: "#94a3b8", textDecoration: "underline" }
