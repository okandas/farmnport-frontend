import React from "react";
import { useFieldArray, Control } from "react-hook-form";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"

import {
    FormProductModel,
} from "@/lib/schemas"

import { Icons } from "@/components/icons/lucide"
import { Button } from "@/components/ui/button"


interface productExamplesProps {
    nestedIndex: number
    control: Control<FormProductModel>
}

export function ProductExamples({ nestedIndex, control }: productExamplesProps) {

    const { fields, remove, append } = useFieldArray({
        control: control,
        name: `instructions.examples.${nestedIndex}.values`
    });

    return (

        <div>
            {fields.map((field, secondIndex) => {
                return (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-5" key={secondIndex}>

                        <FormField
                            control={control}
                            key={secondIndex}
                            name={`instructions.examples.${nestedIndex}.values.${secondIndex}.dosage.value`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="">
                                        Dosage Value
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            key={secondIndex}
                            name={`instructions.examples.${nestedIndex}.values.${secondIndex}.dosage.unit`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="">
                                        Dosage Unit
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={control}
                            key={secondIndex}
                            name={`instructions.examples.${nestedIndex}.values.${secondIndex}.mass.weight`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="">
                                        Mass Weight
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={control}
                            key={secondIndex}
                            name={`instructions.examples.${nestedIndex}.values.${secondIndex}.mass.unit`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="">
                                        Mass Unit
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />



                        <div className="sm:colspan-1 sm:flex sm:justify-end sm:flex-col">
                            <Button variant="outline" size="icon" onClick={() => remove(secondIndex)} >
                                <Icons.bin className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );
            })}

            <div className="sm:flex justify-end mt-2">
                <Button onClick={() =>
                    append({
                        dosage: {
                            unit: "",
                            value: 0
                        },
                        mass: {
                            unit: "",
                            weight: 0
                        }
                    })
                }>
                    <Icons.add className="h-4 w-4" /> Add Dosage Example
                </Button>
            </div>
        </div>
    );
};
