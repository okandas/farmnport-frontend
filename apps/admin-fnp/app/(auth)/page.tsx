import { AuthForm } from "@/components/structures/forms/login"

export default function Login() {
  return (
    <div className="container flex flex-col items-center justify-center w-screen h-screen">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to sign in to your account
          </p>
        </div>

        <AuthForm />

        <p className="px-8 text-sm text-center text-muted-foreground"></p>
      </div>
    </div>
  )
}
