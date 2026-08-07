import { QuickSignupWrapper } from "./wrapper"

export const metadata = {
    title: 'Quick Sign Up | Farmnport — Start Shopping in Seconds',
    description: 'Create a free Farmnport account in seconds. Browse and buy agrochemicals, seeds, feeds, and more from Zimbabwe\'s largest agricultural marketplace.',
    alternates: {
        canonical: '/signup/quick',
    },
    openGraph: {
        title: 'Quick Sign Up | Farmnport — Start Shopping in Seconds',
        description: 'Create a free Farmnport account in seconds and start shopping for agricultural products.',
        url: '/signup/quick',
        siteName: 'farmnport',
        type: 'website',
    },
}

export default function QuickSignUpPage() {
    return (
        <div className="flex min-h-full flex-1 flex-col justify-center py-10 px-3 sm:px-6 lg:px-8">
            <div className="mx-auto sm:w-full sm:max-w-md text-center mb-8">
                <h1 className="text-2xl/9 font-bold tracking-tight">Create an Account</h1>
                <p className="mt-2 text-sm/6 text-muted-foreground">
                    Sign up to start shopping on Farmnport
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-card shadow-sm rounded-lg border outline outline-1 outline-black/5 dark:shadow-none dark:outline-white/15">
                <div className="px-6 py-8 sm:px-8">
                    <QuickSignupWrapper />
                </div>
            </div>
        </div>
    )
}
