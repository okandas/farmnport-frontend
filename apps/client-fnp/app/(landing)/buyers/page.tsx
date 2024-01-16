import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

import {
    defaultSideBarData,
    sideBarFilterData
} from "@/config/data"

import { capitalizeFirstLetter } from "@/lib/utilities"

import { Checkbox } from "@/components/ui/checkbox"
import { Buyers } from "@/components/layouts/buyers"
import { auth } from "@/auth"
import { AuthenticatedUser } from "@/lib/schemas"
import { retrieveUser } from "@/lib/actions"


export const metadata = {
    title: 'Buyers in Zimbabwe',
    description: 'Agri produce, fresh produce, buyers buying directly from farmers in Zimbabwe'
}

export default async function BuyersPage() {

    const user = await retrieveUser()

    return (
        <main>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="lg:flex lg:space-x-6">

                    <div className="hidden lg:block lg:w-44">
                        <FilterSidebar />
                    </div>

                    <div className="lg:w-2/3">
                        <Buyers user={user} />
                    </div>
                </div>
            </div>
        </main>
    )
}

function FilterSidebar() {
    return (
        <div className="mt-6">
            <Accordion type="multiple" className="w-full" defaultValue={defaultSideBarData}>
                {
                    sideBarFilterData.map((filterData, filterDataIndex) => (
                        <AccordionItem value={filterData.name} key={filterDataIndex}>
                            <AccordionTrigger>{capitalizeFirstLetter(filterData.name)}</AccordionTrigger>
                            <AccordionContent>
                                <CheckboxesWithText filters={filterData.data} />
                            </AccordionContent>
                        </AccordionItem>
                    ))
                }

            </Accordion>
        </div>
    )
}

function CheckboxesWithText({ filters }: { filters: string[] }) {
    return (
        <>
            {filters.map((filter, filterIndex) => (
                <div className="items-top flex space-x-2 my-2" key={filterIndex}>
                    <Checkbox id={filter} />
                    <div className="grid gap-1.5 leading-none">
                        <label
                            htmlFor="terms1"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {capitalizeFirstLetter(filter)}
                        </label>
                    </div>
                </div>
            ))}
        </>


    )
}






