'use client' // Error boundaries must be Client Components

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);
    return (
        // global-error must include html and body tags
        <html>
            <body>
                <NextError statusCode={0} />
            </body>
        </html>
    )
}