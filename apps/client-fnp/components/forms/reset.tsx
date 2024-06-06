"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { useForm } from "react-hook-form"
import Link from 'next/link'

import { toast } from "sonner"

import { ResetSchema, ResetFormData } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { resetUser } from "@/lib/actions"

import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Icons } from "@/components/icons/lucide"

interface RessetFormProps extends React.HTMLAttributes<HTMLDivElement> { }


export function ResetAuthForm({ className, ...props }: RessetFormProps) {

    const { register, handleSubmit, formState } = useForm<ResetFormData>({
        resolver: zodResolver(ResetSchema),
    })

    const router = useRouter()

    const { errors } = formState

    const { mutate, isPending, isSuccess } = useMutation({
        mutationFn: resetUser,
        onSuccess: (data) => {
            toast("Success", {
                description: "Reset email sent successfully, please check your email",
            })
        },
        onError: (error) => {
            if (isAxiosError(error)) {
                switch (error.code) {
                    case "ERR_NETWORK":
                        toast("Network Issues", {
                            description: "There seems to be a network error."
                        })
                        break

                    default:
                        toast("Unsuccesful", {
                            description: "There was a problem with your request."
                        })
                        break
                }
            }

            toast("Failed send reset password link", {
                description: 'System Failure or Network Failure Please Try Again'
            })
        },
    })


    const submitLoginForm = async (payload: ResetFormData) => {
        mutate(payload)
    }

    return (
        <div className={cn("", className)} {...props}>
            <form onSubmit={handleSubmit((data) => submitLoginForm(data))}>
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
                        disabled={isPending || isSuccess}
                        type="submit"
                    >
                        {isPending && (
                            <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Reset Password
                    </button>
                </div>
            </form>
        </div>
    )
}
