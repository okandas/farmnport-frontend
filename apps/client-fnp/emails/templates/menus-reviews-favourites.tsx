import { Body, Button, Container, Head, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components"

interface MenusReviewsFavouritesEmailProps {
  name?: string
}

const UTM = "?utm_source=blast&utm_medium=email&utm_campaign=menus_reviews_favourites"

export default function MenusReviewsFavouritesEmail({ name = "there" }: MenusReviewsFavouritesEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Leave a review, save your favourites — help us build Zimbabwe's restaurant guide</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brand}>menus</Text>
            <Text style={brandSub}>menus.co.zw</Text>
          </Section>

          {/* Greeting */}
          <Section style={content}>
            <Text style={greeting}>Hi {name},</Text>
            <Text style={paragraph}>
              Thank you for using menus.co.zw — we are building Zimbabwe's most complete restaurant guide and your input makes it better for everyone.
            </Text>
            <Text style={paragraph}>
              Today we are asking for two small things that make a big difference.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Section 1: Reviews */}
          <Section style={content}>
            <Img src="https://menus.co.zw/images/reviews/review.png" alt="Leave a review on menus.co.zw" width="520" style={image} />
            <Text style={sectionLabel}>YOUR VOICE MATTERS</Text>
            <Text style={sectionTitle}>Leave a review for a restaurant you have visited</Text>
            <Text style={paragraph}>
              Your honest review helps other diners decide where to eat — and it helps restaurants know what they are doing well. A few sentences is all it takes.
            </Text>
            <Section style={buttonWrapper}>
              <Button href={`https://menus.co.zw${UTM}&utm_content=cta_browse_review`} style={buttonPrimary}>Browse Restaurants to Review</Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Section 2: Favourites */}
          <Section style={content}>
            <Img src="https://menus.co.zw/images/reviews/favourites.png" alt="Save your favourite restaurants on menus.co.zw" width="520" style={image} />
            <Text style={sectionLabel}>SAVE YOUR SPOTS</Text>
            <Text style={sectionTitle}>Favourite the restaurants you love</Text>
            <Text style={paragraph}>
              Tap the heart on any restaurant to save it to your favourites. It helps you find them quickly next time — and it tells us which restaurants matter most to you.
            </Text>
            <Section style={buttonWrapper}>
              <Button href={`https://menus.co.zw${UTM}&utm_content=cta_browse_favourite`} style={buttonOutline}>Browse Restaurants</Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Section 3: Reservations */}
          <Section style={content}>
            <Img src="https://menus.co.zw/images/reviews/reservations.png" alt="Book a table online on menus.co.zw" width="520" style={image} />
            <Text style={sectionLabel}>NOW LIVE</Text>
            <Text style={sectionTitle}>Book a table online</Text>
            <Text style={paragraph}>
              You can now book a table directly from menus.co.zw — no phone call needed. Look for the "Bookable" badge on restaurants that accept online reservations.
            </Text>
            <Section style={buttonWrapper}>
              <Button href={`https://menus.co.zw/reservations${UTM}&utm_content=cta_reservations`} style={buttonPrimary}>Browse Bookable Restaurants</Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Sign-off */}
          <Section style={content}>
            <Text style={signoff}>Enjoy your next meal,{"\n"}the menus team</Text>
            <Text style={muted}>
              You are receiving this because you have an account on menus.co.zw.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              menus &nbsp;&middot;&nbsp; Harare, Zimbabwe
            </Text>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} <Link href="https://menus.co.zw" style={footerLink}>menus.co.zw</Link>. All rights reserved.
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
const brand: React.CSSProperties = { fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "0" }
const brandSub: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 8px" }
const content: React.CSSProperties = { padding: "16px 40px" }
const greeting: React.CSSProperties = { fontSize: "18px", fontWeight: "600", color: "#0f172a", margin: "0 0 12px" }
const paragraph: React.CSSProperties = { fontSize: "15px", lineHeight: "1.7", color: "#475569", margin: "0 0 16px", whiteSpace: "pre-wrap" }
const sectionLabel: React.CSSProperties = { fontSize: "11px", fontWeight: "700", color: "#ea580c", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }
const sectionTitle: React.CSSProperties = { fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 12px", lineHeight: "1.3" }
const buttonWrapper: React.CSSProperties = { margin: "8px 0 24px" }
const buttonPrimary: React.CSSProperties = { backgroundColor: "#ea580c", borderRadius: "6px", color: "#ffffff", fontSize: "15px", fontWeight: "600", textDecoration: "none", textAlign: "center", display: "inline-block", padding: "14px 28px" }
const buttonOutline: React.CSSProperties = { backgroundColor: "#ffffff", borderRadius: "6px", color: "#0f172a", fontSize: "15px", fontWeight: "600", textDecoration: "none", textAlign: "center", display: "inline-block", padding: "12px 26px", border: "2px solid #e2e8f0" }
const image: React.CSSProperties = { width: "100%", borderRadius: "6px", margin: "0 0 16px" }
const divider: React.CSSProperties = { borderColor: "#e2e8f0", margin: "8px 40px" }
const signoff: React.CSSProperties = { fontSize: "14px", color: "#64748b", lineHeight: "1.6", whiteSpace: "pre-wrap" }
const muted: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "8px 0 0" }
const footer: React.CSSProperties = { padding: "16px 40px 32px" }
const footerText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", margin: "0 0 4px", textAlign: "center" }
const footerLink: React.CSSProperties = { color: "#94a3b8", textDecoration: "underline" }
