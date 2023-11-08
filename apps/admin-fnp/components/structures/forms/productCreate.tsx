"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useForm, useFieldArray, FieldErrors } from "react-hook-form"
import { useRouter } from "next/navigation"

import { addProduct } from "@/lib/query"
import {
    FormProductModel,
    FormProductSchema,
} from "@/lib/schemas"
import { cn } from "@/lib/utilities"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"


import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"
import { ProductExamples } from "./productEditNestedArray"
import { FileInput } from "../controls/file-input"
import { Button } from "@/components/ui/button"

import { buttonVariants } from "@/components/ui/button"

interface EditFormProps extends React.HTMLAttributes<HTMLDivElement> {
    product: FormProductModel
}

export function CreateProductForm({ product }: EditFormProps) {

    const form = useForm({
        defaultValues: {
            id: product?.id,
            name: product?.name,
            descriptions: product?.descriptions,
            reg_number: product?.reg_number,
            cat: product?.cat,
            images: product?.images,
            unit: product?.unit,
            manufacturer: product?.manufacturer,
            distributor: product?.distributor,
            warnings: product?.warnings,
            instructions: product?.instructions,
        },
        resolver: zodResolver(FormProductSchema),
    })

    const router = useRouter()

    const control = form.control

    const { fields, append, remove } = useFieldArray({
        name: "descriptions",
        control: form.control
    });

    const { fields: unitFields, append: unitAppend, remove: unitRemove } = useFieldArray({
        name: "unit",
        control: form.control
    });

    const { fields: warningFields, append: warningAppend, remove: warningRemove } = useFieldArray({
        name: "warnings",
        control: form.control
    });

    const { fields: usageFields, append: usageAppend, remove: usageRemove } = useFieldArray({
        name: "instructions.usage",
        control: form.control
    });

    const { fields: examplesField, append: examplesAppend, remove: examplesRemove } = useFieldArray({
        name: "instructions.examples",
        control: form.control
    });

    const { fields: efficacyTableFields, append: efficacyTableAppend, remove: efficacyTableRemove } = useFieldArray({
        name: "instructions.efficacy_table",
        control: form.control
    });

    const { fields: efficacyFields, append: efficacyAppend, remove: efficacyRemove } = useFieldArray({
        name: "instructions.efficacy",
        control: form.control
    });

    const { fields: keyMapValueFields, append: keyMapValueAppend, remove: keyMapValueRemove } = useFieldArray({
        name: "instructions.key_map.values",
        control: form.control
    });

    const { mutate, isPending } = useMutation({
        mutationFn: addProduct,
        onSuccess: (data) => {
            toast({
                description: "Added Product Succesfully",
            })

            // router.push(`/dashboard/products`)
        },
        onError: (error) => {
            if (isAxiosError(error)) {
                switch (error.code) {
                    case "ERR_NETWORK":
                        toast({
                            description: "There seems to be a network error.",
                            action: <ToastAction altText="Try again">Try again</ToastAction>,
                        })
                        break

                    default:
                        toast({
                            title: "Uh oh!  client update failed.",
                            description: "There was a problem with your request.",
                            action: <ToastAction altText="Try again">Try again</ToastAction>,
                        })
                        break
                }
            }
        },

    })

    async function onSubmit(payload: FormProductModel) {
        mutate(payload)
    }

    const onError = (errors: FieldErrors<FormProductModel>) => {
        console.log(errors)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
                className="w-full gap-4 mx-auto mb-8 px-3"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"

                        render={({ field }) => (
                            <FormItem >
                                <FormLabel>Name</FormLabel>
                                <FormControl className="col-span-3">
                                    <Input placeholder="Product name" {...field} />
                                </FormControl>
                                <FormDescription></FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div>
                    <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                            <FormItem >
                                <FormControl>
                                    <FileInput id={product.id} {...field} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight sm:my-3">
                        Product Description
                    </h3>
                    {fields.map((field, index) => {
                        return (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5 first:mb-2" key={field.id}>
                                <FormField
                                    control={form.control}
                                    name={`descriptions.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-1 mb-1">
                                            {
                                                index === 0 ? (<>
                                                    <FormLabel>
                                                        Description Name
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Describe the discription name.
                                                    </FormDescription></>) : null
                                            }
                                            <FormControl >
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`descriptions.${index}.value`}
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-3  mb-1">
                                            {
                                                index === 0 ? (<>
                                                    <FormLabel>
                                                        Description Value
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Describe the discription name.
                                                    </FormDescription></>) : null
                                            }
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="sm:colspan-1 sm:flex sm:justify-end sm:flex-col pb-2">
                                    <Button variant="outline" size="icon" onClick={() => remove(index)} >
                                        <Icons.bin className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}


                    <div className="sm:flex justify-end">
                        <Button onClick={() =>
                            append({
                                name: "",
                                value: ""
                            })
                        }>
                            <Icons.add className="h-4 w-4" /> Add Description
                        </Button>
                    </div>

                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <FormField
                        control={form.control}
                        name="manufacturer.name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Manufacturer</FormLabel>
                                <FormControl>
                                    <Input placeholder="Manufacturer name" {...field} />
                                </FormControl>
                                <FormDescription></FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <FormField
                        control={form.control}
                        name="distributor.name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Distributor</FormLabel>
                                <FormControl>
                                    <Input placeholder="Distributor name" {...field} />
                                </FormControl>
                                <FormDescription></FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>

                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight sm:my-3">
                        Measurement Unit
                    </h3>
                    {unitFields.map((field, index) => {
                        return (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5 first:mb-2" key={field.id}>
                                <FormField
                                    control={form.control}
                                    name={`unit.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-1 mb-1">
                                            {
                                                index === 0 ? (<>
                                                    <FormLabel>
                                                        Unit Name
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Describe the discription name.
                                                    </FormDescription></>) : null
                                            }
                                            <FormControl >
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`unit.${index}.value`}
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-3  mb-1">
                                            {
                                                index === 0 ? (<>
                                                    <FormLabel>
                                                        Unit Value
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Describe the discription name.
                                                    </FormDescription></>) : null
                                            }
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="sm:colspan-1 sm:flex sm:justify-end sm:flex-col pb-2">
                                    <Button variant="outline" size="icon" onClick={() => unitRemove(index)} >
                                        <Icons.bin className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}


                    <div className="sm:flex justify-end">
                        <Button onClick={() =>
                            unitAppend({
                                name: "",
                                value: 0
                            })
                        }>
                            <Icons.add className="h-4 w-4" /> Add Unit
                        </Button>
                    </div>

                </div>

                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight sm:my-3">
                        Warning Info
                    </h3>
                    {warningFields.map((field, index) => {
                        return (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5" key={field.id}>
                                <FormField
                                    control={form.control}
                                    name={`warnings.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-1 mb-1">
                                            {
                                                index === 0 ? (<>
                                                    <FormLabel className="">
                                                        Warning Name
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Warning Attribute Name
                                                    </FormDescription>
                                                </>) : null
                                            }
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`warnings.${index}.location`}
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-1 mb-1">

                                            {
                                                index === 0 ? (
                                                    <>
                                                        <FormLabel className="">
                                                            Warning Location
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Where the warning is located.
                                                        </FormDescription>
                                                    </>
                                                ) : null
                                            }
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`warnings.${index}.value`}
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2 mb-1">

                                            {
                                                index === 0 ? (
                                                    <>
                                                        <FormLabel className="">
                                                            Warning Value
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Warning Describe the discription name.
                                                        </FormDescription>
                                                    </>) : null
                                            }
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="sm:colspan-1 sm:flex sm:justify-end sm:flex-col pb-2">
                                    <Button variant="outline" size="icon" onClick={() => warningRemove(index)} >
                                        <Icons.bin className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}


                    <div className="sm:flex justify-end">
                        <Button onClick={() =>
                            warningAppend({
                                name: "",
                                value: "",
                                location: ""
                            })
                        }>
                            <Icons.add className="h-4 w-4" /> Add Warning
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight sm:my-3">
                        How to use product.
                    </h3>
                    {usageFields.map((field, index) => {
                        return (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5" key={field.id}>
                                <FormField
                                    control={form.control}
                                    name={`instructions.usage.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            {
                                                index === 0 ? (
                                                    <>
                                                        <FormLabel className="">
                                                            Usage Name
                                                        </FormLabel>
                                                        <FormDescription className="">
                                                            Usage Attribute Name
                                                        </FormDescription>
                                                    </>
                                                ) : null
                                            }
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`instructions.usage.${index}.value`}
                                    render={({ field }) => (
                                        <FormItem className="col-span-3">
                                            {
                                                index === 0 ? (
                                                    <>
                                                        <FormLabel>
                                                            Usage Value
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Usage the discription value.
                                                        </FormDescription>
                                                    </>
                                                ) : null
                                            }
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="sm:colspan-1 sm:flex sm:justify-end sm:flex-col pb-2">
                                    <Button variant="outline" size="icon" onClick={() => usageRemove(index)} >
                                        <Icons.bin className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}

                    <div className="sm:flex justify-end">
                        <Button onClick={() =>
                            usageAppend({
                                name: "",
                                value: ""
                            })
                        }>
                            <Icons.add className="h-4 w-4" /> Add Usage Instruction
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight sm:my-3">
                        Efficacy Table
                    </h3>
                    {efficacyTableFields.map((field, index) => {
                        return (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5 mt-2" key={field.id}>
                                <FormField
                                    control={form.control}
                                    name={`instructions.efficacy_table.${index}.species`}
                                    render={({ field }) => (
                                        <FormItem>
                                            {
                                                index === 0 ? (
                                                    <>
                                                        <FormLabel>
                                                            Species
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Species Attribute
                                                        </FormDescription>
                                                    </>
                                                ) : null
                                            }
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`instructions.efficacy_table.${index}.third_stage`}
                                    render={({ field }) => (
                                        <FormItem>

                                            {
                                                index === 0 ? (
                                                    <>
                                                        <FormLabel>
                                                            Third Stage
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Description Third Stage.
                                                        </FormDescription>
                                                    </>
                                                ) : null
                                            }
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`instructions.efficacy_table.${index}.fourth_stage`}
                                    render={({ field }) => (
                                        <FormItem>
                                            {
                                                index === 0 ? (
                                                    <>
                                                        <FormLabel>
                                                            Fourth Stage
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Description Fourth Stage.
                                                        </FormDescription>
                                                    </>
                                                ) : null
                                            }
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`instructions.efficacy_table.${index}.adults`}
                                    render={({ field }) => (
                                        <FormItem>
                                            {
                                                index === 0 ? (
                                                    <>
                                                        <FormLabel>
                                                            Adults
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Describe Adult Value.
                                                        </FormDescription>
                                                    </>
                                                ) : null
                                            }
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="sm:colspan-1 sm:flex sm:justify-end sm:flex-col">
                                    <Button variant="outline" size="icon" onClick={() => efficacyTableRemove(index)} >
                                        <Icons.bin className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}

                    <div className="sm:flex justify-end">
                        <Button onClick={() =>
                            efficacyTableAppend({
                                species: "",
                                third_stage: "",
                                fourth_stage: "",
                                adults: ""
                            })
                        }>
                            <Icons.add className="h-4 w-4" /> Add Efficacy
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight sm:my-3">
                        Efficacy Info
                    </h3>
                    {efficacyFields.map((field, index) => {
                        return (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" key={field.id}>
                                <FormField
                                    control={form.control}
                                    name={`instructions.efficacy.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="">
                                                Efficacy Name
                                            </FormLabel>
                                            <FormDescription className="">
                                                Efficacy Attribute Name
                                            </FormDescription>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`instructions.efficacy.${index}.value`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Efficacy Value
                                            </FormLabel>
                                            <FormDescription>
                                                Efficacy Describe the discription name.
                                            </FormDescription>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="sm:colspan-1 sm:flex sm:justify-end sm:flex-col">
                                    <Button variant="outline" size="icon" onClick={() => efficacyRemove(index)} >
                                        <Icons.bin className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}

                    <div className="sm:flex justify-end">
                        <Button onClick={() =>
                            efficacyAppend({
                                name: "",
                                value: ""
                            })
                        }>
                            <Icons.add className="h-4 w-4" /> Add Efficacy
                        </Button>
                    </div>
                </div>


                <div>

                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight sm:my-3">
                        Key Map Values.
                    </h3>

                    <FormField
                        control={form.control}
                        name="instructions.key_map.type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Key Map Type</FormLabel>
                                <FormControl className="w-1/2">
                                    <Input placeholder="Type" {...field} />
                                </FormControl>
                                <FormDescription></FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {keyMapValueFields.map((field, index) => {
                        return (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 mt-2" key={field.id}>
                                <FormField
                                    control={form.control}
                                    name={`instructions.key_map.values.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            {
                                                index === 0 ? (
                                                    <>
                                                        <FormLabel className="">
                                                            Keymap Name
                                                        </FormLabel>
                                                        <FormDescription className="">
                                                            Keymap Description Attribute Name
                                                        </FormDescription>
                                                    </>) : null
                                            }
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`instructions.key_map.values.${index}.value`}

                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            {
                                                index === 0 ? (
                                                    <>
                                                        <FormLabel>
                                                            Keymap Value
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Keymap Describe the discription name.
                                                        </FormDescription>
                                                    </>) : null
                                            }
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                                <div className="sm:colspan-1 sm:flex sm:justify-end sm:flex-col">
                                    <Button variant="outline" size="icon" onClick={() => keyMapValueRemove(index)} >
                                        <Icons.bin className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}




                    <div className="sm:flex justify-end">
                        <Button onClick={() =>
                            keyMapValueAppend({
                                name: "",
                                value: ""
                            })
                        }>
                            <Icons.add className="h-4 w-4" /> Add Key Map
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight sm:my-3">
                        Dosage Examples
                    </h3>
                    {examplesField.map((field, index) => {
                        return (
                            <div key={field.id}>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 mb-3">
                                    <FormField
                                        control={form.control}
                                        name={`instructions.examples.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                {
                                                    index === 0 ? (
                                                        <>
                                                            <FormLabel>
                                                                Dosage
                                                            </FormLabel>
                                                            <FormDescription>
                                                                Description For Dosage
                                                            </FormDescription>
                                                        </>
                                                    ) : null
                                                }
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="sm:colspan-1 sm:flex sm:justify-end sm:flex-col">
                                        <Button variant="outline" size="icon" onClick={() => examplesRemove(index)} >
                                            <Icons.bin className="h-4 w-4" />
                                        </Button>
                                    </div>

                                </div>
                                <ProductExamples nestedIndex={index} {...{ control }} />
                            </div>
                        );
                    })}



                    <div className="sm:flex justify-start">
                        <Button onClick={() =>
                            examplesAppend({
                                description: "",
                                values: [
                                    {
                                        dosage: {
                                            value: 0,
                                            unit: ""
                                        },
                                        mass: {
                                            weight: 0,
                                            unit: ""
                                        },
                                        pack: 0
                                    }
                                ]
                            })
                        }>
                            <Icons.add className="h-4 w-4" /> Add Full Dosage
                        </Button>
                    </div>
                </div>


                <button
                    type="submit"
                    className={cn(buttonVariants(), "mt-5")}
                    disabled={isPending}
                >
                    {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
                    Submit
                </button>

            </form>

        </Form>
    )
}
