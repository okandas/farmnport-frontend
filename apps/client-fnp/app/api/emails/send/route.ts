import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { render } from "@react-email/render"
import {
  WelcomeEmail,
  MagicLinkEmail,
  ScheduleEmail,
  OrderConfirmationEmail,
  OrderDispatchEmail,
  OrderStatusEmail,
} from "@/emails"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = "farmnport <noreply@farmnport.com>"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { template, to, ...props } = body as { template: string; to: string; [key: string]: unknown }

  if (!template || !to) {
    return NextResponse.json({ error: "Missing template or to" }, { status: 400 })
  }

  let subject: string
  let html: string

  switch (template) {
    case "welcome":
      subject = "Welcome to farmnport"
      html = await render(WelcomeEmail(props as Parameters<typeof WelcomeEmail>[0]))
      break

    case "magic-link":
      subject = "Reset your farmnport password"
      html = await render(MagicLinkEmail(props as Parameters<typeof MagicLinkEmail>[0]))
      break

    case "schedule":
      subject = "Confirm your farmnport schedule"
      html = await render(ScheduleEmail(props as Parameters<typeof ScheduleEmail>[0]))
      break

    case "order-confirmation":
      subject = `Order ${(props as { orderNumber?: string }).orderNumber ?? ""} confirmed`
      html = await render(OrderConfirmationEmail(props as Parameters<typeof OrderConfirmationEmail>[0]))
      break

    case "order-dispatch":
      subject = `[DISPATCH] New order ${(props as { orderNumber?: string }).orderNumber ?? ""}`
      html = await render(OrderDispatchEmail(props as Parameters<typeof OrderDispatchEmail>[0]))
      break

    case "order-status":
      subject = `Order ${(props as { orderNumber?: string }).orderNumber ?? ""} update`
      html = await render(OrderStatusEmail(props as Parameters<typeof OrderStatusEmail>[0]))
      break

    default:
      return NextResponse.json({ error: `Unknown template: ${template}` }, { status: 400 })
  }

  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html })

  if (error) {
    console.error("[resend] send error:", error)
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ id: data?.id })
}
