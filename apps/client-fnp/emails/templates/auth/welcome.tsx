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

interface WelcomeEmailProps {
  name: string
  confirmUrl: string
}

export default function WelcomeEmail({ name, confirmUrl }: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>A warm welcome — your journey with us begins now...</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={logo}>farm &amp; port — <strong>getting you to market</strong></Text>
          <Hr style={divider} />
          <Section style={content}>
            <Text style={paragraph}>Dear {name},</Text>
            <Text style={paragraph}>
              We want to welcome you on this new frontier in agribusiness, as you go digital with us.
              You have taken the initial step, and we shall follow up with a short phone call to verify
              you and your business.
            </Text>
            <Text style={paragraph}>As for now please confirm your email:</Text>
            <Button href={confirmUrl} style={button}>Confirm Email</Button>
            <Text style={paragraph}>
              Please do not hesitate to make any further enquiries, we&apos;re happy to help.
            </Text>
            <Text style={paragraph}>Welcome to Business,</Text>
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

const content: React.CSSProperties = {
  padding: "20px 40px",
}

const paragraph: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.6",
  marginBottom: "1em",
  color: "#5d7079",
}

const button: React.CSSProperties = {
  backgroundColor: "#2ea664",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "900",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "13px 24px",
  marginBottom: "1em",
}

const footer: React.CSSProperties = {
  fontSize: "12.5px",
  color: "#999999",
  textAlign: "center",
  padding: "16px 40px",
}
