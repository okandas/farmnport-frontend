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
                    <div className="" key={secondIndex}>
                        <FormField
                            control={control}
                            key={secondIndex + 1}
                            name={`instructions.examples.${nestedIndex}.values.${secondIndex}.dosage.unit`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="">
                                        Dosage Unit
                                    </FormLabel>
                                    <FormDescription className="">
                                        Unit Name
                                    </FormDescription>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            key={secondIndex + 2}
                            name={`instructions.examples.${nestedIndex}.values.${secondIndex}.dosage.value`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="">
                                        Dosage Value
                                    </FormLabel>
                                    <FormDescription className="">
                                        Unit Name
                                    </FormDescription>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            key={secondIndex + 3}
                            name={`instructions.examples.${nestedIndex}.values.${secondIndex}.mass.unit`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="">
                                        Mass Unit
                                    </FormLabel>
                                    <FormDescription className="">
                                        Unit Name
                                    </FormDescription>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            key={secondIndex + 4}
                            name={`instructions.examples.${nestedIndex}.values.${secondIndex}.mass.weight`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="">
                                        Mass Weight
                                    </FormLabel>
                                    <FormDescription className="">
                                        Mass Value
                                    </FormDescription>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />





                        <div className="">
                            <button
                                type="button"
                                className=""
                                onClick={() => remove(secondIndex)}
                            >
                                Delete Nested
                            </button>
                        </div>
                    </div>
                );
            })}

            <button
                type="button"
                className=""
                onClick={() =>
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
                }
            >
                Append Nested
            </button>
        </div>
    );
};
