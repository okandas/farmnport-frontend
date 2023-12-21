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

import { SidebarFilter } from "@/types"

import { Checkbox } from "@/components/ui/checkbox"


export const metadata = {
    title: 'Buyers in Zimbabwe',
    description: 'Agri produce, fresh produce, buyers buying directly from farmers in Zimbabwe'
}

export default function BuyersPage() {
    return (
        <main>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="lg:flex lg:space-x-6">

                    <div className="hidden lg:block lg:w-72">
                        <FilterSidebar />
                    </div>

                    <div className="lg:w-2/3">
                        <Example />
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


function Example() {

    const items = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
        { id: 9 },
        { id: 10 },
        // More items...
    ]

    return (
        <ul role="list" className="divide-y divide-gray-200">
            {items.map((item) => (
                <li key={item.id} className="py-4">
                    <div className="flex">
                        <div className="mr-4 flex-shrink-0 self-center">
                            <svg
                                className="h-16 w-16 border border-gray-300 bg-white text-gray-300"
                                preserveAspectRatio="none"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 200 200"
                                aria-hidden="true"
                            >
                                <path vectorEffect="non-scaling-stroke" strokeWidth={1} d="M0 0l200 200M0 200L200 0" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold">Lorem ipsum</h4>
                            <p className="mt-1">
                                Repudiandae sint consequuntur vel. Amet ut nobis explicabo numquam expedita quia omnis voluptatem. Minus
                                quidem ipsam quia iusto.
                            </p>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    )
}



