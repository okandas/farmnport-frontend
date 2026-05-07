import { NextRequest, NextResponse } from "next/server"
import { render } from "@react-email/render"
import {
  WelcomeEmail,
  MagicLinkEmail,
  ScheduleEmail,
  OrderConfirmationEmail,
  OrderDispatchEmail,
  OrderStatusEmail,
} from "@/emails"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { template, ...props } = body as { template: string; [key: string]: unknown }

  if (!template) {
    return NextResponse.json({ error: "Missing template" }, { status: 400 })
  }

  let html: string

  switch (template) {
    case "welcome":
      html = await render(WelcomeEmail(props as Parameters<typeof WelcomeEmail>[0]))
      break
    case "magic-link":
      html = await render(MagicLinkEmail(props as Parameters<typeof MagicLinkEmail>[0]))
      break
    case "schedule":
      html = await render(ScheduleEmail(props as Parameters<typeof ScheduleEmail>[0]))
      break
    case "order-confirmation":
      html = await render(OrderConfirmationEmail(props as Parameters<typeof OrderConfirmationEmail>[0]))
      break
    case "order-dispatch":
      html = await render(OrderDispatchEmail(props as Parameters<typeof OrderDispatchEmail>[0]))
      break
    case "order-status":
      html = await render(OrderStatusEmail(props as Parameters<typeof OrderStatusEmail>[0]))
      break
    default:
      return NextResponse.json({ error: `Unknown template: ${template}` }, { status: 400 })
  }

  return NextResponse.json({ html })
}
