import { CheckCircle, Package, XCircle } from "lucide-react"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

async function fetchVerifiedOrder(id: string, token: string) {
    try {
        const res = await fetch(`${BASE_URL}/v1/order/verify/${id}/${token}`, {
            cache: "no-store",
        })
        if (!res.ok) return null
        return res.json()
    } catch {
        return null
    }
}

function statusColor(status: string) {
    switch (status) {
        case "paid": return "bg-blue-100 text-blue-800"
        case "processing": return "bg-yellow-100 text-yellow-800"
        case "dispatched": return "bg-purple-100 text-purple-800"
        case "ready": return "bg-orange-100 text-orange-800"
        case "delivered": return "bg-green-100 text-green-800"
        case "cancelled": return "bg-red-100 text-red-800"
        default: return "bg-muted text-muted-foreground"
    }
}

export default async function OrderVerifyPage({ params }: { params: { id: string; token: string } }) {
    const order = await fetchVerifiedOrder(params.id, params.token)

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
                <div className="text-center max-w-sm">
                    <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
                    <h1 className="text-xl font-bold mb-2">Order Not Found</h1>
                    <p className="text-muted-foreground text-sm">This QR code is invalid or the order has already been completed.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/20 flex items-start justify-center px-4 py-12">
            <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-sm overflow-hidden">

                {/* Header */}
                <div className="bg-primary px-6 py-5 text-primary-foreground">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-7 h-7 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium opacity-80 uppercase tracking-wide">Order Verified</p>
                            <h1 className="text-lg font-bold">{order.order_number}</h1>
                        </div>
                    </div>
                </div>

                {/* Status + client */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Customer</p>
                        <p className="font-semibold text-sm">{order.client_name}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColor(order.status)}`}>
                        {order.status}
                    </span>
                </div>

                {/* Fulfillment */}
                <div className="px-6 py-3 border-b bg-muted/30">
                    <p className="text-xs text-muted-foreground">Fulfillment</p>
                    <p className="text-sm font-medium capitalize">{order.fulfillment?.replace("_", " ")}</p>
                </div>

                {/* Items */}
                <div className="px-6 py-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" /> Items
                    </p>
                    <div className="space-y-2">
                        {order.items?.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-foreground">{item.product_name} <span className="text-muted-foreground">× {item.quantity}</span></span>
                                <span className="font-medium">${Number(item.line_total).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total */}
                <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between">
                    <p className="font-bold">Total</p>
                    <p className="font-bold text-lg">{order.currency} ${Number(order.total).toFixed(2)}</p>
                </div>

            </div>
        </div>
    )
}
