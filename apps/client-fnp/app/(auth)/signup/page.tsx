import { SignUpAuthForm } from "@/components/forms/signup"


export const metadata = {
    title: 'Sign Up | Farmnport — Join Zimbabwe\'s Largest Farming Marketplace',
    description: 'Create a free Farmnport account to buy and sell agricultural produce, access agrochemical guides, and connect directly with farmers and buyers across Zimbabwe.',
    alternates: {
        canonical: '/signup',
    },
    openGraph: {
        title: 'Sign Up | Farmnport — Join Zimbabwe\'s Largest Farming Marketplace',
        description: 'Create a free Farmnport account to buy and sell agricultural produce and connect with farmers and buyers across Zimbabwe.',
        siteName: 'farmnport',
        type: 'website',
    },
}

export default function SignUpPage() {

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center py-10 px-3 sm:px-6 lg:px-8">
                <div className="mx-auto sm:w-full sm:max-w-2xl text-center mb-8">
                    <h1 className="text-2xl/9 font-bold tracking-tight">Join Farmnport</h1>
                    <p className="mt-2 text-sm/6 text-muted-foreground">
                        Enter your information below and join the largest farming ecosystem in Zimbabwe
                    </p>
                </div>

                <div className="sm:mx-auto sm:w-full sm:max-w-3xl bg-card shadow-sm rounded-lg border outline outline-1 outline-black/5 dark:shadow-none dark:outline-white/15">
                    <div className="px-6 py-8 sm:px-12 sm:py-10">

                        <SignUpAuthForm />

                    </div>
                </div>
            </div>
        </>
    )
}
