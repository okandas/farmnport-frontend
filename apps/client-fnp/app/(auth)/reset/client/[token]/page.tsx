"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons/lucide"
import { clientResetPassword } from "@/lib/query"

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params)
    const router = useRouter()

    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [matchError, setMatchError] = useState("")

    const { mutate, isPending, isSuccess } = useMutation({
        mutationFn: () => clientResetPassword(token, password),
        onSuccess: () => {
            toast("Password updated", {
                description: "Your password has been reset. You can now log in.",
            })
            setTimeout(() => router.push("/login"), 2000)
        },
        onError: (error) => {
            if (isAxiosError(error)) {
                toast("Reset failed", {
                    description: error.response?.data?.message ?? "This link may have expired. Please request a new one.",
                })
            } else {
                toast("Something went wrong", { description: "Please try again." })
            }
        },
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (password !== confirm) {
            setMatchError("Passwords do not match")
            return
        }
        if (password.length < 8) {
            setMatchError("Password must be at least 8 characters")
            return
        }
        setMatchError("")
        mutate()
    }

    if (isSuccess) {
        return (
            <div className="flex min-h-full flex-1 flex-col justify-center py-16 sm:px-6 lg:px-8">
                <div className="mx-auto sm:w-full sm:max-w-md text-center">
                    <div className="rounded-md bg-orange-50 border border-orange-200 p-6 space-y-3">
                        <Icons.check className="w-8 h-8 mx-auto text-orange-600" />
                        <p className="font-semibold text-orange-900">Password updated</p>
                        <p className="text-sm text-orange-700">Redirecting you to login...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center py-16 sm:px-6 lg:px-8">
            <div className="mx-auto sm:w-full sm:max-w-md text-center h-10">
                <h1 className="text-lg">Set a new password</h1>
                <p className="text-muted-foreground text-sm">Enter and confirm your new password below.</p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[380px] bg-card text-card-foreground shadow-sm rounded-lg border border-zinc-100 py-6 dark:border-zinc-700/40">
                <div className="px-6 py-12 sm:px-12">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-1">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    disabled={isPending}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="confirm">Confirm Password</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    autoComplete="new-password"
                                    disabled={isPending}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                />
                                {matchError && (
                                    <p className="text-xs text-red-600 px-1">{matchError}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={isPending || !password || !confirm}
                                className="w-full rounded-md bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin inline" />}
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
