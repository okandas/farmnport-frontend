"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { captureException } from "@sentry/nextjs";

import { useForm } from "react-hook-form"
import Link from "next/link"

import { toast } from "sonner"

import { AuthSchema, LoginFormData } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { loginUser } from "@/lib/actions"
import { signIn } from "next-auth/react"

import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Icons } from "@/components/icons/lucide"
import { logtail } from "@/lib/logger";

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }


export function AuthForm({ className, ...props }: AuthFormProps) {

    const { register, handleSubmit, formState } = useForm<LoginFormData>({
        resolver: zodResolver(AuthSchema),
    })

    const router = useRouter()
    const searchParams = useSearchParams()

    const { errors } = formState

    const { mutate, isPending, isSuccess, isError } = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            toast("Success", {
                description: "Login Successful redirecting you to dashboard.",
            })

            const next = searchParams.get("next");
            const entity = searchParams.get("entity");
            const wantToSee = searchParams.get("wantToSee");

            if (next) {
                window.location.href = next
            } else if (wantToSee && entity) {
                window.location.href = `/${entity}/${wantToSee}`
            } else {
                window.location.href = "/"
            }
        },
        onError: async (error) => {

            toast("Failed to login", {
                description: "Incorrect email or password."
            })

            await logtail.error(error)

            captureException(error)
        },
    })


    const submitLoginForm = async (payload: LoginFormData) => {
        mutate(payload)
    }

    const redirectTo = searchParams.get("next") || "/"

    return (
        <div className={cn("", className)} {...props}>
            {/* Social login buttons */}
            <div className="grid gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: redirectTo })}
                    className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
                >
                    <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                        <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                        <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                        <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                    </svg>
                    <span>Continue with Google</span>
                </button>

            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-4 text-muted-foreground">or continue with email</span>
                </div>
            </div>

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
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="password">
                            Password
                        </Label>
                        <Input
                            id="password"
                            placeholder="password"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="off"
                            disabled={isPending}
                            {...register("password", { required: true })}
                        />
                        {errors?.password && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.password.message}
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
                        Login
                    </button>

                    {isError && (
                        <div className="rounded-md bg-orange-50 border border-orange-200 p-3 text-sm text-center">
                            <p className="text-orange-800">Forgot your password?{" "}
                                <Link href="/reset" className="font-semibold underline text-orange-600 hover:text-orange-500">
                                    Reset it here
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </form>

            <div className="flex items-center justify-between mt-6">
                <div className="text-sm leading-6">
                    <Link href="/reset" className="font-semibold text-orange-600 hover:text-orange-500">
                        Forgotten your password?
                    </Link>
                </div>
            </div>

            <div>
                <div className="relative mt-8">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm font-medium leading-6">
                        <span className="bg-card px-6 text-muted-foreground">Don&apos;t have an account?</span>
                    </div>
                </div>

                <div className="text-sm leading-6 flex justify-center mt-6">
                    <Link href="/signup" className="font-semibold text-orange-600 hover:text-orange-500">
                        Get Started Here!
                    </Link>
                </div>
            </div>
        </div>
    )
}
