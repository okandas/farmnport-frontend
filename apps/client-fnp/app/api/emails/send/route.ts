import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { render } from "@react-email/render"
import {
  WelcomeEmail,
  VerifyReminderEmail,
  MagicLinkEmail,
  ScheduleEmail,
  OrderConfirmationEmail,
  OrderDispatchEmail,
  OrderStatusEmail,
  BlastEmail,
  MenusBlastEmail,
  MenusReviewsFavouritesEmail,
  BookingConfirmedEmail,
  BookingStatusEmail,
  BookingAdminAlertEmail,
  OrderDocumentConfirmationEmail,
  PreorderRequestReceivedEmail,
  PreorderRequestAdminEmail,
  PreorderRequestSellerEmail,
  PreorderConfirmedEmail,
  PreorderRejectedEmail,
  PreorderDepositPaidEmail,
  PreorderDepositPaidAdminEmail,
  PreorderReadyEmail,
  PreorderCollectedEmail,
  PreorderExpiredEmail,
  MarketingLaunchEmail,
  TermsUpdateEmail,
  LotBidReceivedEmail,
  LotBidAcceptedEmail,
  LotBidRejectedEmail,
  LotBidCounteredEmail,
  PhoneUpdateCodeEmail,
} from "@/emails"

const FROM_FARMNPORT = "farmnport <noreply@farmnport.com>"
const FROM_MENUS = "menus <noreply@farmnport.com>"

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
  let from = FROM_FARMNPORT

  switch (template) {
    case "welcome":
      subject = "Welcome to farmnport"
      html = await render(WelcomeEmail(props as Parameters<typeof WelcomeEmail>[0]))
      break

    case "verify-reminder":
      subject = (props as { subject?: string }).subject ?? "Verify your farmnport account to start trading"
      html = await render(VerifyReminderEmail(props as Parameters<typeof VerifyReminderEmail>[0]))
      break

    case "phone-update-code":
      subject = (props as { subject?: string }).subject ?? "Your farmnport verification code"
      html = await render(PhoneUpdateCodeEmail(props as Parameters<typeof PhoneUpdateCodeEmail>[0]))
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

    case "menus-blast": {
      const p = props as Parameters<typeof MenusBlastEmail>[0]
      subject = (props as { subject?: string }).subject ?? "Message from menus.co.zw"
      html = await render(MenusBlastEmail(p))
      from = FROM_MENUS
      break
    }

    case "menus-reviews-favourites": {
      const p = props as Parameters<typeof MenusReviewsFavouritesEmail>[0]
      subject = "Leave a review, save your favourites — menus.co.zw"
      html = await render(MenusReviewsFavouritesEmail(p))
      from = FROM_MENUS
      break
    }

    case "marketing-launch": {
      const p = props as Parameters<typeof MarketingLaunchEmail>[0]
      subject = "New ways to trade on farmnport — bookings and lots"
      html = await render(MarketingLaunchEmail(p))
      break
    }

    case "terms-update": {
      const p = props as Parameters<typeof TermsUpdateEmail>[0]
      subject = "We've updated our Terms of Service"
      html = await render(TermsUpdateEmail(p))
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

    case "preorder-request-received":
      subject = `Booking Request Submitted — ${(props as { bookingRef?: string }).bookingRef ?? ""}`
      html = await render(PreorderRequestReceivedEmail(props as Parameters<typeof PreorderRequestReceivedEmail>[0]))
      break

    case "preorder-request-admin":
      subject = `New Pre-Order Request — ${(props as { bookingRef?: string }).bookingRef ?? ""}`
      html = await render(PreorderRequestAdminEmail(props as Parameters<typeof PreorderRequestAdminEmail>[0]))
      break

    case "preorder-request-seller":
      subject = `New Booking on Your Listing — ${(props as { bookingRef?: string }).bookingRef ?? ""}`
      html = await render(PreorderRequestSellerEmail(props as Parameters<typeof PreorderRequestSellerEmail>[0]))
      break

    case "preorder-confirmed":
      subject = `Booking Confirmed — ${(props as { bookingRef?: string }).bookingRef ?? ""}`
      html = await render(PreorderConfirmedEmail(props as Parameters<typeof PreorderConfirmedEmail>[0]))
      break

    case "preorder-rejected":
      subject = `Booking Not Fulfilled — ${(props as { bookingRef?: string }).bookingRef ?? ""}`
      html = await render(PreorderRejectedEmail(props as Parameters<typeof PreorderRejectedEmail>[0]))
      break

    case "preorder-deposit-paid":
      subject = `Payment Received — ${(props as { bookingRef?: string }).bookingRef ?? ""}`
      html = await render(PreorderDepositPaidEmail(props as Parameters<typeof PreorderDepositPaidEmail>[0]))
      break

    case "preorder-deposit-paid-admin":
      subject = `Payment Received — ${(props as { bookingRef?: string }).bookingRef ?? ""}`
      html = await render(PreorderDepositPaidAdminEmail(props as Parameters<typeof PreorderDepositPaidAdminEmail>[0]))
      break

    case "preorder-ready":
      subject = `Order Ready For Collection — ${(props as { bookingRef?: string }).bookingRef ?? ""}`
      html = await render(PreorderReadyEmail(props as Parameters<typeof PreorderReadyEmail>[0]))
      break

    case "preorder-collected":
      subject = `Order Collected — ${(props as { bookingRef?: string }).bookingRef ?? ""}`
      html = await render(PreorderCollectedEmail(props as Parameters<typeof PreorderCollectedEmail>[0]))
      break

    case "preorder-expired":
      subject = `Booking Expired — ${(props as { bookingRef?: string }).bookingRef ?? ""}`
      html = await render(PreorderExpiredEmail(props as Parameters<typeof PreorderExpiredEmail>[0]))
      break

    case "lot-bid-received":
      subject = "New offer on your lot"
      html = await render(LotBidReceivedEmail(props as Parameters<typeof LotBidReceivedEmail>[0]))
      break

    case "lot-bid-accepted":
      subject = "Your offer was accepted"
      html = await render(LotBidAcceptedEmail(props as Parameters<typeof LotBidAcceptedEmail>[0]))
      break

    case "lot-bid-rejected":
      subject = "Your offer was not accepted"
      html = await render(LotBidRejectedEmail(props as Parameters<typeof LotBidRejectedEmail>[0]))
      break

    case "lot-bid-countered":
      subject = `Counter-offer received — lot ${(props as { lotSlug?: string }).lotSlug ?? ""}`
      html = await render(LotBidCounteredEmail(props as Parameters<typeof LotBidCounteredEmail>[0]))
      break

    default:
      return NextResponse.json({ error: `Unknown template: ${template}` }, { status: 400 })
  }

  const { data, error } = await resend.emails.send({ from, to, subject, html })

  if (error) {
    console.error("[resend] send error:", error)
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ id: data?.id })
}
