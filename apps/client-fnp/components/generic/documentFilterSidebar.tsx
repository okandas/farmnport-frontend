"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useQueryStates, parseAsString } from "nuqs"
import { Filter, X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

const DOCUMENT_CATEGORIES = [
  { value: "rural_infrastructure", label: "Rural Infrastructure" },
  { value: "financial_planning", label: "Financial Planning" },
  { value: "agronomy", label: "Agronomy" },
  { value: "livestock", label: "Livestock" },
]

function FilterContent({ onClearAll }: { onClearAll: () => void }) {
  const [queryState, setQueryState] = useQueryStates({
    category: parseAsString,
  })

  const hasFilters = !!queryState.category

  function handleToggle(value: string) {
    setQueryState({ category: queryState.category === value ? null : value })
  }

  return (
    <div className="flex flex-col h-full">
      {hasFilters && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <span className="text-sm text-muted-foreground">1 filter applied</span>
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-8 px-2 lg:px-3">
            Clear all
            <X className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      <Accordion type="multiple" className="w-full flex-1" defaultValue={["Category"]}>
        <AccordionItem value="Category">
          <AccordionTrigger>
            <div className="flex items-center justify-between w-full pr-2">
              <span>Category</span>
              {queryState.category && (
                <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">1</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {DOCUMENT_CATEGORIES.map((cat) => {
                const isChecked = queryState.category === cat.value
                return (
                  <div className="flex items-start space-x-2" key={cat.value}>
                    <Checkbox
                      id={`doc-cat-${cat.value}`}
                      checked={isChecked}
                      onCheckedChange={() => handleToggle(cat.value)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={`doc-cat-${cat.value}`}
                      className="text-sm font-medium leading-none cursor-pointer flex-1 flex items-center justify-between"
                    >
                      <span>{cat.label}</span>
                    </label>
                  </div>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export function DocumentFilterSidebar() {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [, setQueryState] = useQueryStates({ category: parseAsString })

  function handleClearAll() {
    setQueryState({ category: null })
  }

  if (isDesktop) {
    return (
      <div className="sticky top-20 mt-[20px] max-h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden">
        <FilterContent onClearAll={handleClearAll} />
      </div>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full mb-4">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Filter Documents</SheetTitle>
        </SheetHeader>
        <FilterContent onClearAll={handleClearAll} />
      </SheetContent>
    </Sheet>
  )
}
