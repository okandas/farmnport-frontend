"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

interface GlobalErrorProps {
    error: Error & { digest?: string },
    children: React.ReactNode
}

export default function GlobalError({ error, children }: GlobalErrorProps) {

    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html>
            <body>
                {/* This is the default Next.js error component but it doesn't allow omitting the statusCode property yet. */}
                <NextError statusCode={undefined as any}>
                    {children}
                </NextError>
            </body>
        </html>
    );
}