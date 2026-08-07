"use client"

import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { captureException } from "@sentry/nextjs"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { cn } from "@/lib/utilities"
import { shopperSignup } from "@/lib/query"

interface QuickSignupData {
  name: string
  email: string
  phone: string
  password: string
  confirm_password: string
}

interface QuickSignupFormProps {
  redirectTo?: string
  className?: string
}

export function QuickSignupForm({ redirectTo = "/", className }: QuickSignupFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<QuickSignupData>()

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: async (data: QuickSignupData) => {
      await shopperSignup(data)
      // Auto-login after signup
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) throw new Error("Login after signup failed")
    },
    onSuccess: () => {
      toast.success("Account created successfully")
      window.location.href = redirectTo
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to create account"
      toast.error(msg)
      captureException(error)
    },
  })

  return (
    <div className={cn("", className)}>
      {/* Google button */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: redirectTo })}
        className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors mb-4"
      >
        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
          <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
          <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
          <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-4 text-muted-foreground">or create an account</span>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutate(data))}>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label htmlFor="qs-name">Full name</Label>
            <Input
              id="qs-name"
              placeholder="John Doe"
              disabled={isPending}
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="qs-email">Email</Label>
            <Input
              id="qs-email"
              type="email"
              placeholder="you@example.com"
              disabled={isPending}
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="qs-phone">Phone number</Label>
            <Input
              id="qs-phone"
              type="tel"
              placeholder="0771234567"
              disabled={isPending}
              {...register("phone", { required: "Phone number is required" })}
            />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="qs-password">Password</Label>
            <Input
              id="qs-password"
              type="password"
              placeholder="Min 8 characters"
              disabled={isPending}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Min 8 characters" },
              })}
            />
            {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="qs-confirm">Confirm password</Label>
            <Input
              id="qs-confirm"
              type="password"
              placeholder="Confirm password"
              disabled={isPending}
              {...register("confirm_password", { required: "Please confirm your password" })}
            />
            {errors.confirm_password && <p className="text-xs text-red-600">{errors.confirm_password.message}</p>}
          </div>

          <button
            type="submit"
            className={cn(buttonVariants(), "w-full")}
            disabled={isPending || isSuccess}
          >
            {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
            Create Account
          </button>
        </div>
      </form>

      <div className="text-center mt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={`/login?next=${redirectTo}`} className="font-semibold text-orange-600 hover:text-orange-500">
          Sign in
        </Link>
      </div>
    </div>
  )
}
