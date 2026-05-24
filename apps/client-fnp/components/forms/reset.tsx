"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { useForm } from "react-hook-form"
import { toast } from "sonner"
import Link from "next/link"
import { ResetSchema, ResetFormData } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { clientReset } from "@/lib/query"

import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Icons } from "@/components/icons/lucide"


interface RessetFormProps extends React.HTMLAttributes<HTMLDivElement> { }


export function ResetAuthForm({ className, ...props }: RessetFormProps) {

    const { register, handleSubmit, formState, getValues } = useForm<ResetFormData>({
        resolver: zodResolver(ResetSchema),
    })

    const { errors } = formState

    const { mutate, isPending, isSuccess } = useMutation({
        mutationFn: clientReset,
        onSuccess: () => {
            // isSuccess state drives the confirmation UI below
        },
        onError: (error) => {
            if (isAxiosError(error) && error.code === "ERR_NETWORK") {
                toast("Network Issues", {
                    description: "There seems to be a network error."
                })
            } else {
                toast("Something went wrong", {
                    description: "Please try again."
                })
            }
        },
    })

    if (isSuccess) {
        return (
            <div className={cn("text-center", className)} {...props}>
                <div className="rounded-md bg-orange-50 border border-orange-200 p-6 space-y-3">
                    <Icons.mail className="w-8 h-8 mx-auto text-orange-600" />
                    <p className="font-semibold text-orange-900">Check your email</p>
                    <p className="text-sm text-orange-700">
                        If an account exists for <span className="font-medium">{getValues("email")}</span>, a password reset link has been sent. Check your inbox and spam folder.
                    </p>
                </div>
                <div className="mt-6 text-sm">
                    <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-500">
                        Back to login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("", className)} {...props}>
            <form onSubmit={handleSubmit((data) => mutate(data))}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Email
                        </Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isPending}
                            {...register("email", { required: true })}
                        />
                        {errors?.email && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                    <button
                        className={cn(buttonVariants())}
                        disabled={isPending}
                        type="submit"
                    >
                        {isPending && (
                            <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Send Reset Link
                    </button>
                </div>
            </form>
        </div>
    )
}
