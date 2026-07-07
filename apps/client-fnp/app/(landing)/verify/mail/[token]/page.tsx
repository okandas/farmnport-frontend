import { CheckCircle, XCircle } from "lucide-react"

const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL

async function verifyEmail(token: string) {
    try {
        const res = await fetch(`${BASE_URL}/v1/verify/mail/${token}`, { cache: "no-store" })
        return res.ok
    } catch {
        return false
    }
}

export default async function VerifyMailPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const success = await verifyEmail(token)

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
            <div className="text-center max-w-sm">
                {success ? (
                    <>
                        <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
                        <h1 className="text-xl font-bold mb-2">Email Confirmed</h1>
                        <p className="text-muted-foreground text-sm">Your email has been verified. You can now log in to your account.</p>
                        <a href="/" className="mt-6 inline-block text-sm font-medium text-primary underline underline-offset-4">Go to farmnport</a>
                    </>
                ) : (
                    <>
                        <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
                        <h1 className="text-xl font-bold mb-2">Link Invalid or Expired</h1>
                        <p className="text-muted-foreground text-sm">This confirmation link is invalid or has already been used.</p>
                    </>
                )}
            </div>
        </div>
    )
}
