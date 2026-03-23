import { AuthForm } from "@/components/forms/login"


export const metadata = {
    title: 'Sign In | Farmnport — Access Your Farm & Market Dashboard',
    description: 'Sign in to Farmnport to connect with buyers, track produce prices, and manage your agricultural business. Access agrochemical guides, market listings, and more.',
    alternates: {
        canonical: '/login',
    },
    openGraph: {
        title: 'Sign In | Farmnport',
        description: 'Sign in to Farmnport to connect with buyers, track produce prices, and manage your agricultural business.',
        url: '/login',
        siteName: 'farmnport',
        type: 'website',
    },
}

export default function LoginPage() {

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center py-16 px-3 sm:px-6 lg:px-8">
                <div className="mx-auto sm:w-full sm:max-w-md h-10 text-center">
                    <h1 className="text-lg">Sign into Farmnport</h1>
                    <p className="text-muted-foreground text-sm">We pleased to have you back.</p>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[380px] bg-card text-card-foreground shadow-sm rounded-lg border border-zinc-100 py-6 dark:border-zinc-700/40">
                    <div className="px-6 py-12 sm:px-12">

                        <AuthForm />

                    </div>
                </div>
            </div>
        </>
    )
}
