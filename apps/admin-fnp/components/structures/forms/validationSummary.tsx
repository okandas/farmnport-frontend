import { FieldErrors } from "react-hook-form"
import { ProducerPriceList } from "@/lib/schemas"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icons } from "@/components/icons/lucide"
import { ScrollArea } from "@/components/ui/scroll-area"

type ValidationSummaryProps = {
  errors: FieldErrors<ProducerPriceList>
  isSubmitted: boolean
}

/**
 * Validation summary component
 * Shows all form errors in a clear, actionable list
 */
export function ValidationSummary({
  errors,
  isSubmitted,
}: ValidationSummaryProps) {
  // Only show if form has been submitted and has errors
  if (!isSubmitted || Object.keys(errors).length === 0) return null

  // Flatten nested errors into readable messages
  const getErrorMessages = (
    errors: FieldErrors<ProducerPriceList>,
  ): { field: string; message: string }[] => {
    const messages: { field: string; message: string }[] = []

    const processError = (error: any, path: string[] = []) => {
      if (error?.message) {
        messages.push({
          field: path.join(" → "),
          message: error.message as string,
        })
      } else if (typeof error === "object" && error !== null) {
        Object.entries(error).forEach(([key, value]) => {
          processError(value, [...path, formatFieldName(key)])
        })
      }
    }

    Object.entries(errors).forEach(([key, value]) => {
      processError(value, [formatFieldName(key)])
    })

    return messages
  }

  // Format field names to be more readable
  const formatFieldName = (field: string): string => {
    const replacements: Record<string, string> = {
      client_id: "Client",
      client_name: "Client Name",
      effectiveDate: "Effective Date",
      a_grade_over_1_75: "A Grade Over 1.75kg",
      a_grade_1_55_1_75: "A Grade 1.55-1.75kg",
      a_grade_under_1_55: "A Grade Under 1.55kg",
      off_layers: "Off Layers",
      super_premium: "Super Premium",
      delivered: "Delivered Price",
      collected: "Collected Price",
    }

    if (replacements[field]) return replacements[field]

    // Capitalize and add spaces
    return field
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const errorMessages = getErrorMessages(errors)

  return (
    <Alert variant="destructive" className="mb-6">
      <Icons.alertCircle className="size-4" />
      <AlertTitle>Please fix the following errors:</AlertTitle>
      <AlertDescription>
        <ScrollArea className="mt-2 max-h-48">
          <ul className="space-y-1 text-sm list-disc list-inside">
            {errorMessages.map((error, index) => (
              <li key={index}>
                <strong>{error.field}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </AlertDescription>
    </Alert>
  )
}
