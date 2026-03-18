"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import { Toaster } from "@/components/ui/toaster"

type QueryClientProps = {
    children: React.ReactNode
}

export function QueryProvider({ children }: QueryClientProps) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: process.env.NODE_ENV === "production" ? 5 * 60 * 1000 : 0,
                refetchOnWindowFocus: false,
            },
        },
    }))
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
