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

interface MagicLinkEmailProps {
  name: string
  resetUrl: string
}

export default function MagicLinkEmail({ name, resetUrl }: MagicLinkEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset link expires in 20 minutes — sign in now.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={content}>
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>
              You have requested a reset password token to your farmnport account.
            </Text>
            <Text style={paragraph}>Click on the button or copy and paste the link shown below.</Text>
            <Button href={resetUrl} style={button}>Reset Link</Button>
            <Text style={linkText}>{resetUrl}</Text>
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
  fontWeight: "400",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "13px 24px",
  marginBottom: "1em",
}

const linkText: React.CSSProperties = {
  fontSize: "14px",
  color: "#2ea664",
  wordBreak: "break-all",
  marginBottom: "1em",
}

const footer: React.CSSProperties = {
  fontSize: "12.5px",
  color: "#999999",
  textAlign: "center",
  padding: "16px 40px",
}
