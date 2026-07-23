import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components"

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
          <Section style={content}>
            <Text style={brand}>farmnport</Text>

            <Text style={greeting}>Hi {name},</Text>
            <Text style={paragraph}>
              We have added two new ways for you to trade directly on farmnport. Whether you supply or buy produce, these tools help you connect faster.
            </Text>

            <Text style={paragraph}>
              <strong>Bookings — for regular supply and demand</strong>{"\n"}
              Use bookings for produce you supply or buy on a regular basis — daily, weekly, monthly, throughout the year.
            </Text>

            <Text style={paragraph}>
              If you supply produce: create a booking so buyers can order from you on a schedule. Set your price, quantity, and availability — buyers come to you.{"\n"}
              <Link href={`https://farmnport.com/bookings/new/sell${UTM_BOOKING_SELL}`} style={link}>I Supply — Create a Booking</Link>
            </Text>

            <Text style={paragraph}>
              If you buy produce: post what you need on a regular basis and let farmers come to you with their supply.{"\n"}
              <Link href={`https://farmnport.com/bookings/new/buy${UTM_BOOKING_BUY}`} style={link}>I Buy — Post a Buying Request</Link>
            </Text>

            <Text style={paragraph}>
              <strong>Lots — for immediate, one-time sales</strong>{"\n"}
              Use lots when you have stock ready now or need produce immediately. Listings expire after a set number of days.
            </Text>

            <Text style={paragraph}>
              If you have stock ready: list your available produce and buyers can bid or buy directly. Set your price and how many days the listing stays live.{"\n"}
              <Link href={`https://farmnport.com/lots/new/sell${UTM_LOT_SELL}`} style={link}>I Have Stock — List a Lot</Link>
            </Text>

            <Text style={paragraph}>
              If you need stock now: post what you need and let farmers offer their produce to you.{"\n"}
              <Link href={`https://farmnport.com/lots/new/buy${UTM_LOT_BUY}`} style={link}>I Need Stock — Post a Request</Link>
            </Text>

            <Text style={paragraph}>
              <strong>Quick summary</strong>{"\n"}
              Bookings = recurring (daily, weekly, monthly, year-round){"\n"}
              Lots = one-time, immediate (expires in days){"\n\n"}
              Both are free to use. Both work for sellers and buyers.
            </Text>

            <Text style={paragraph}>
              Once you create a booking or list a lot, manage everything from your account:{"\n"}
              <Link href={`https://farmnport.com/account/booking-preorders?utm_source=blast&utm_medium=email&utm_campaign=bookings_lots_launch&utm_content=manage_bookings`} style={link}>My Bookings</Link> — view, edit, and manage your booking listings{"\n"}
              <Link href={`https://farmnport.com/account/lots?utm_source=blast&utm_medium=email&utm_campaign=bookings_lots_launch&utm_content=manage_lots`} style={link}>My Lots</Link> — track your lots, view bids, accept offers{"\n"}
              <Link href={`https://farmnport.com/account/incoming-bookings?utm_source=blast&utm_medium=email&utm_campaign=bookings_lots_launch&utm_content=manage_incoming`} style={link}>Incoming Bookings</Link> — review and confirm booking requests from buyers
            </Text>

            <Text style={signoff}>Happy trading,{"\n"}the farmnport team</Text>
          </Section>

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

const body: React.CSSProperties = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", margin: 0, padding: "40px 0" }
const container: React.CSSProperties = { backgroundColor: "#ffffff", margin: "0 auto", maxWidth: "580px" }
const content: React.CSSProperties = { padding: "32px 40px 24px" }
const brand: React.CSSProperties = { fontSize: "20px", fontWeight: "600", color: "#0f172a", margin: "0 0 20px" }
const greeting: React.CSSProperties = { fontSize: "18px", fontWeight: "600", color: "#0f172a", margin: "0 0 12px" }
const paragraph: React.CSSProperties = { fontSize: "15px", lineHeight: "1.7", color: "#475569", margin: "0 0 16px", whiteSpace: "pre-wrap" }
const link: React.CSSProperties = { color: "#ea580c", textDecoration: "underline" }
const signoff: React.CSSProperties = { fontSize: "14px", color: "#64748b", margin: 0 }
const footer: React.CSSProperties = { padding: "0 40px 32px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: 0, textAlign: "center" }
const footerLink: React.CSSProperties = { color: "#94a3b8", textDecoration: "underline" }
