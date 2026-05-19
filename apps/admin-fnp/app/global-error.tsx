"use client"

interface GlobalErrorProps {
    error: Error & { digest?: string },
    reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    return (
        <div>
            <h2>Something went wrong!</h2>
            <button onClick={() => reset()}>Try again</button>
        </div>
    );
}