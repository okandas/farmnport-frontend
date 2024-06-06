import { ResetAuthForm } from "@/components/forms/reset"


export const metadata = {
    title: 'Reset Password Farmnport',
    description: 'Agri produce, fresh produce, buyers buying directly from farmers in Zimbabwe'
}

export default function ResetPage() {

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center py-16 sm:px-6 lg:px-8">
                <div className="mx-auto sm:w-full sm:max-w-md h-10 text-center">
                    <h3 className="text-lg">Reset your Farmnport password</h3>
                    <p className="text-muted-foreground text-sm">Sorry you have forgotten your password, but it is quick and easy to reset here using your email.</p>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[380px] bg-card text-card-foreground shadow-sm rounded-lg border border-zinc-100 py-6 dark:border-zinc-700/40">
                    <div className="px-6 py-12 sm:px-12">

                        <ResetAuthForm />

                    </div>
                </div>
            </div>
        </>
    )
}