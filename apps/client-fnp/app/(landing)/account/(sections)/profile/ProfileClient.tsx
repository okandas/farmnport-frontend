"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { requestPhoneCode, verifyPhoneCode } from "@/lib/query"
import { BaseURL } from "@/lib/schemas"
import axios from "axios"

type View = "idle" | "entering_phone" | "entering_code"

export default function AccountProfilePage() {
    const { data: session } = useSession()
    const user = session?.user as any

    const [view, setView] = useState<View>("idle")
    const [phone, setPhone] = useState("")
    const [code, setCode] = useState("")
    const [currentPhone, setCurrentPhone] = useState("")
    const [currentEmail, setCurrentEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        if (!user?.token) return
        axios.get(`${BaseURL}/client/me`, {
            headers: { Authorization: `Bearer ${user.token}` }
        }).then(res => {
            setCurrentPhone(res.data?.phone || "")
            setCurrentEmail(res.data?.email || user?.email || "")
        }).catch(() => {}).finally(() => setFetching(false))
    }, [user])

    async function handleRequestCode() {
        if (!phone.trim()) {
            toast.error("Please enter a phone number")
            return
        }
        setLoading(true)
        try {
            await requestPhoneCode(phone)
            toast.success("Verification code sent to your email and phone")
            setView("entering_code")
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to send code")
        } finally {
            setLoading(false)
        }
    }

    async function handleVerifyCode() {
        if (!code.trim()) {
            toast.error("Please enter the verification code")
            return
        }
        setLoading(true)
        try {
            const res = await verifyPhoneCode(code)
            setCurrentPhone(res.data?.phone || phone)
            setView("idle")
            setPhone("")
            setCode("")
            toast.success("Phone number updated successfully")
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to verify code")
        } finally {
            setLoading(false)
        }
    }

    function handleCancel() {
        setView("idle")
        setPhone("")
        setCode("")
    }

    if (fetching) return <div className="py-10 text-center text-sm text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold">Profile</h1>
            <div className="border rounded-xl divide-y">
                <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-sm text-muted-foreground">Username</span>
                    <span className="text-sm font-medium capitalize">{user?.username ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm font-medium">{currentEmail || "—"}</span>
                </div>
                <div className="px-5 py-4">
                    {view === "idle" && (
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm text-muted-foreground">Phone</span>
                                <p className="text-sm font-medium mt-0.5">{currentPhone || "Not set"}</p>
                            </div>
                            <button
                                onClick={() => setView("entering_phone")}
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                {currentPhone ? "Change" : "Add phone"}
                            </button>
                        </div>
                    )}

                    {view === "entering_phone" && (
                        <div className="space-y-3">
                            <label className="text-sm text-muted-foreground">New phone number</label>
                            <input
                                type="tel"
                                placeholder="07XXXXXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background outline-none"
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">A verification code will be sent to your email and this number</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRequestCode}
                                    disabled={loading}
                                    className="h-9 px-4 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {loading ? "Sending..." : "Send Code"}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="h-9 px-4 rounded-md border text-sm font-medium hover:bg-muted"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {view === "entering_code" && (
                        <div className="space-y-3">
                            <label className="text-sm text-muted-foreground">Enter verification code</label>
                            <input
                                type="text"
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background outline-none"
                                maxLength={6}
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">Check your email and phone for the 6-digit code</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleVerifyCode}
                                    disabled={loading || code.length !== 6}
                                    className="h-9 px-4 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {loading ? "Verifying..." : "Verify"}
                                </button>
                                <button
                                    onClick={() => { setView("entering_phone"); setCode("") }}
                                    className="h-9 px-4 rounded-md border text-sm font-medium hover:bg-muted"
                                >
                                    Resend
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="h-9 px-4 rounded-md border text-sm font-medium hover:bg-muted"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
