import { isAxiosError } from "axios"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

interface ErrorHandlerOptions {
    onRetry?: () => void
    context?: string
}

/**
 * Centralized error handler for API requests
 * Displays specific error messages based on error type and status code
 */
export function handleApiError(error: unknown, options?: ErrorHandlerOptions) {
    const { onRetry, context = "request" } = options || {}

    if (isAxiosError(error)) {
        // Check if it's a connection refused error (shows as ERR_NETWORK in axios but net::ERR_CONNECTION_REFUSED in browser)
        const isConnectionRefused = error.code === "ERR_NETWORK" && error.message.toLowerCase().includes("network error")

        switch (error.code) {
            case "ERR_NETWORK":
                if (isConnectionRefused) {
                    toast({
                        title: "Connection Refused",
                        description: "Cannot connect to the server. Please verify the backend is running on the correct port.",
                        variant: "destructive",
                        action: onRetry ? <ToastAction altText="Try again" onClick={onRetry}>Try again</ToastAction> : undefined,
                    })
                } else {
                    toast({
                        title: "Network Error",
                        description: "A network error occurred. Please check your connection and try again.",
                        variant: "destructive",
                        action: onRetry ? <ToastAction altText="Try again" onClick={onRetry}>Try again</ToastAction> : undefined,
                    })
                }
                break

            case "ECONNABORTED":
                toast({
                    title: "Request Timeout",
                    description: "The request took too long and was cancelled. Please try again.",
                    variant: "destructive",
                    action: onRetry ? <ToastAction altText="Try again" onClick={onRetry}>Try again</ToastAction> : undefined,
                })
                break

            default:
                const status = error.response?.status
                if (status === 400) {
                    toast({
                        title: "Bad Request",
                        description: error.response?.data?.message || "Invalid request. Please check your input.",
                        variant: "destructive",
                    })
                } else if (status === 401) {
                    toast({
                        title: "Unauthorized",
                        description: "Your session has expired. Please log in again.",
                        variant: "destructive",
                    })
                } else if (status === 403) {
                    toast({
                        title: "Forbidden",
                        description: "You don't have permission to perform this action.",
                        variant: "destructive",
                    })
                } else if (status === 404) {
                    toast({
                        title: "Not Found",
                        description: `The requested ${context} could not be found.`,
                        variant: "destructive",
                    })
                } else if (status === 413) {
                    toast({
                        title: "File Too Large",
                        description: "The file is too large. Please use a smaller file.",
                        variant: "destructive",
                    })
                } else if (status === 415) {
                    toast({
                        title: "Invalid File Type",
                        description: "This file type is not supported.",
                        variant: "destructive",
                    })
                } else if (status === 422) {
                    toast({
                        title: "Validation Error",
                        description: error.response?.data?.message || "Please check your input and try again.",
                        variant: "destructive",
                    })
                } else if (status && status >= 500) {
                    toast({
                        title: "Server Error",
                        description: "The server encountered an error. Please try again later.",
                        variant: "destructive",
                        action: onRetry ? <ToastAction altText="Try again" onClick={onRetry}>Try again</ToastAction> : undefined,
                    })
                } else {
                    toast({
                        title: "Request Failed",
                        description: error.message || `Failed to complete ${context}. Please try again.`,
                        variant: "destructive",
                        action: onRetry ? <ToastAction altText="Try again" onClick={onRetry}>Try again</ToastAction> : undefined,
                    })
                }
                break
        }
    } else {
        toast({
            title: "Error",
            description: error instanceof Error ? error.message : `An unknown error occurred during ${context}.`,
            variant: "destructive",
            action: onRetry ? <ToastAction altText="Try again" onClick={onRetry}>Try again</ToastAction> : undefined,
        })
    }
}

/**
 * Specific error handler for upload operations
 */
export function handleUploadError(error: unknown, options?: ErrorHandlerOptions) {
    handleApiError(error, { ...options, context: "upload" })
}

/**
 * Specific error handler for delete operations
 */
export function handleDeleteError(error: unknown, options?: ErrorHandlerOptions) {
    handleApiError(error, { ...options, context: "deletion" })
}

/**
 * Specific error handler for fetch operations
 */
export function handleFetchError(error: unknown, options?: ErrorHandlerOptions) {
    handleApiError(error, { ...options, context: "fetch" })
}
