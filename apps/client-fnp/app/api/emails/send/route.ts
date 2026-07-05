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
  BlastEmail,
  BookingConfirmedEmail,
  BookingStatusEmail,
  BookingAdminAlertEmail,
  OrderDocumentConfirmationEmail,
} from "@/emails"

const FROM = "farmnport <noreply@farmnport.com>"

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const secret = req.headers.get("x-email-secret")
  if (secret !== process.env.EMAIL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
      subject = `Order Confirmed — ${(props as { orderNumber?: string }).orderNumber ?? ""}`
      html = await render(OrderConfirmationEmail(props as Parameters<typeof OrderConfirmationEmail>[0]))
      break

    case "order-dispatch":
      subject = `New Order ${(props as { orderNumber?: string }).orderNumber ?? ""} — Action Required`
      html = await render(OrderDispatchEmail(props as Parameters<typeof OrderDispatchEmail>[0]))
      break

    case "order-status": {
      const orderNum = (props as { orderNumber?: string }).orderNumber ?? ""
      const status = (props as { status?: string }).status ?? ""
      const statusLabels: Record<string, string> = {
        processing: "Order Processing",
        ready: "Order Ready for Collection",
        dispatched: "Order Dispatched",
        delivered: "Order Delivered",
        collected: "Order Collected",
        cancelled: "Order Cancelled",
        rejected: "Order Rejected",
      }
      subject = `${statusLabels[status] || "Order Update"} — ${orderNum}`
      html = await render(OrderStatusEmail(props as Parameters<typeof OrderStatusEmail>[0]))
      break
    }

    case "blast": {
      const p = props as Parameters<typeof BlastEmail>[0]
      subject = (props as { subject?: string }).subject ?? "Message from farmnport"
      html = await render(BlastEmail(p))
      break
    }

    case "booking-confirmed":
      subject = `Booking ${(props as { bookingRef?: string }).bookingRef ?? ""} confirmed`
      html = await render(BookingConfirmedEmail(props as Parameters<typeof BookingConfirmedEmail>[0]))
      break

    case "booking-status":
      subject = `Booking ${(props as { bookingRef?: string }).bookingRef ?? ""} update`
      html = await render(BookingStatusEmail(props as Parameters<typeof BookingStatusEmail>[0]))
      break

    case "booking-admin-alert":
      subject = `New booking ${(props as { bookingRef?: string }).bookingRef ?? ""} — action required`
      html = await render(BookingAdminAlertEmail(props as Parameters<typeof BookingAdminAlertEmail>[0]))
      break

    case "order-document-confirmation":
      subject = `Your document is ready — order ${(props as { orderNumber?: string }).orderNumber ?? ""} confirmed`
      html = await render(OrderDocumentConfirmationEmail(props as Parameters<typeof OrderDocumentConfirmationEmail>[0]))
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
