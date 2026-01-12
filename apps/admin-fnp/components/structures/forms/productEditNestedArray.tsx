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
    FormAgroChemicalModel,
} from "@/lib/schemas"

import { Icons } from "@/components/icons/lucide"
import { Button } from "@/components/ui/button"


interface agroChemicalExamplesProps {
    nestedIndex: number
    control: Control<FormAgroChemicalModel>
}

export function AgroChemicalExamples({ nestedIndex, control }: agroChemicalExamplesProps) {

    const { fields, remove, append } = useFieldArray({
        control: control,
        name: `instructions.examples.${nestedIndex}.values`
    });

    return (

        <div>
            {fields.map((field, secondIndex) => {
                return (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-5 mb-3" key={field.id}>
                        <div className="space-y-1">
                            <FormField
                                control={control}

                                name={`instructions.examples.${nestedIndex}.values.${secondIndex}.dosage.value`}
                                render={({ field }) => (
                                    <FormItem>

                                        {
                                            secondIndex === 0 ? (
                                                <>
                                                    <FormLabel className="">
                                                        Dosage Value
                                                    </FormLabel>
                                                </>) : null
                                        }
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}

                                name={`instructions.examples.${nestedIndex}.values.${secondIndex}.dosage.unit`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>


                        <div className="space-y-1">
                            <FormField
                                control={control}

                                name={`instructions.examples.${nestedIndex}.values.${secondIndex}.mass.weight`}
                                render={({ field }) => (
                                    <FormItem>


                                        {
                                            secondIndex === 0 ? (
                                                <>
                                                    <FormLabel className="">
                                                        Mass Weight
                                                    </FormLabel>
                                                </>) : null
                                        }

                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <FormField
                                control={control}

                                name={`instructions.examples.${nestedIndex}.values.${secondIndex}.mass.unit`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-1">
                            <FormField
                                control={control}

                                name={`instructions.examples.${nestedIndex}.values.${secondIndex}.pack`}
                                render={({ field }) => (
                                    <FormItem>


                                        {
                                            secondIndex === 0 ? (
                                                <>
                                                    <FormLabel className="">
                                                        Pack
                                                    </FormLabel>
                                                </>) : null
                                        }

                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="sm:colspan-1 sm:flex sm:flex-col">
                                <Button variant="outline" size="icon" onClick={() => remove(secondIndex)} >
                                    <Icons.bin className="h-4 w-4" />
                                </Button>
                            </div>
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
                        },
                        pack: 0
                    })
                }>
                    <Icons.add className="h-4 w-4" /> Add Dosage Example
                </Button>
            </div>
        </div>
    );
};
