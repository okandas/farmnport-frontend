import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {defaultSideBarData, sideBarFilterData} from "@/config/data";
import {capitalizeFirstLetter} from "@/lib/utilities";
import {Checkbox} from "@/components/ui/checkbox";



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

export function FilterSidebar() {
  return (
    <div className="sticky top-20 mt-[20px]">
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
