import { auth } from "@/auth"

interface AuthLayoutProps {
    children: React.ReactNode
}

export default async function AuthLayout({ children }: AuthLayoutProps) {

    return (
        <main>
            {children}
        </main>
    )
}