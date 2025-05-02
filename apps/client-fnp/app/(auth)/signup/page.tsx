import { SignUpAuthForm } from "@/components/forms/signup"


export const metadata = {
    title: 'Sign Up to Farmnport',
    description: 'Agricultural produce, fresh produce, buyers buying directly from farmers in Zimbabwe'
}

export default function SignUpPage() {

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center py-16 px-3 sm:px-6 lg:px-8">
                <div className="mx-auto sm:w-full sm:max-w-md h-10 text-center">
                    <h3 className="text-lg">Join farmnport</h3>
                    <p className="text-muted-foreground text-sm">Enter your information below and join the largest farming ecosystem in Zimbabwe..</p>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[830px] bg-card text-card-foreground shadow-sm rounded-lg border border-zinc-100 py-6 dark:border-zinc-700/40">
                    <div className="px-6 py-12 sm:px-12">

                        <SignUpAuthForm />

                    </div>
                </div>
            </div>
        </>
    )
}
