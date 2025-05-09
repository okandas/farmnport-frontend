"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import Cookies from "js-cookie"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { queryLogin } from "@/lib/query"
import { AuthSchema } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

type FormData = z.infer<typeof AuthSchema>

export function AuthForm({ className, ...props }: AuthFormProps) {
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(AuthSchema),
  })

  const router = useRouter()

  const { errors } = formState

  const { mutate, isPending } = useMutation({
    mutationFn: queryLogin,
    onSuccess: (data) => {
      toast({
        description: "Login Successful redirecting you to dashboard.",
      })

      Cookies.set("cl_jtkn", data?.data?.token, {
        expires: 30,
      })

      router.push("/dashboard")
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        switch (error.code) {
          case "ERR_NETWORK":
            toast({
              description: "There seems to be a network error.",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
            break

          default:
            toast({
              title: "Uh oh! Admin login failed.",
              description: "There was a problem with your request.",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
            break
        }
      }
    },
  })

  const onSubmit = (payload: FormData) => {
    mutate(payload)
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
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
            disabled={isPending}
            type="submit"
          >
            {isPending && (
              <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
            )}
            Login
          </button>
        </div>
      </form>
    </div>
  )
}
