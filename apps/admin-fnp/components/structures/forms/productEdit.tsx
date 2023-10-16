"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useForm, useFieldArray } from "react-hook-form"

import { updateClient } from "@/lib/query"
import {
    FormProductModel,
    FormProductSchema,
} from "@/lib/schemas"
import { cn, slug } from "@/lib/utilities"


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

import { buttonVariants } from "@/components/ui/button"

interface EditFormProps extends React.HTMLAttributes<HTMLDivElement> {
    product: FormProductModel
}

export function EditForm({ product }: EditFormProps) {
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

    const control = form.control

    const { fields, append, remove } = useFieldArray({
        name: "descriptions",
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
        mutationFn: updateClient,
        onSuccess: (data) => {
            toast({
                description: "Updated Product Succesfully",
            })

            const name = slug(data.data?.name)

            // router.push(`/dashboard/users/${name}`)
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
        console.log(payload)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-3/4 gap-4 mx-auto mb-8"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Product name" {...field} />
                            </FormControl>
                            <FormDescription></FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div >
                    {fields.map((field, index) => {
                        return (
                            <div className="" key={field.id}>
                                <FormField
                                    control={form.control}
                                    key={index + 1}
                                    name={`descriptions.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="">
                                                Description Name
                                            </FormLabel>
                                            <FormDescription className="">
                                                Description Attribute Name
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
                                    key={index + 2}
                                    name={`descriptions.${index}.value`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Description Value
                                            </FormLabel>
                                            <FormDescription>
                                                Describe the discription name.
                                            </FormDescription>
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="">
                                    <button
                                        type="button"
                                        className=""
                                        onClick={() => remove(index)}
                                    >
                                        Delete
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
                                name: "",
                                value: ""
                            })
                        }
                    >
                        Append
                    </button>
                </div>

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

                <div>
                    {warningFields.map((field, index) => {
                        return (
                            <div className="" key={field.id}>
                                <FormField
                                    control={form.control}
                                    key={index + 1}
                                    name={`warnings.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="">
                                                Warning Name
                                            </FormLabel>
                                            <FormDescription className="">
                                                Warning Attribute Name
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
                                    key={index + 2}
                                    name={`warnings.${index}.value`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Warning Value
                                            </FormLabel>
                                            <FormDescription>
                                                Warning Describe the discription name.
                                            </FormDescription>
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    key={index + 3}
                                    name={`warnings.${index}.location`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Located
                                            </FormLabel>
                                            <FormDescription>
                                                Where the warning is located.
                                            </FormDescription>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="">
                                    <button
                                        type="button"
                                        className=""
                                        onClick={() => warningRemove(index)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    <button
                        type="button"
                        className=""
                        onClick={() =>
                            warningAppend({
                                name: "",
                                value: "",
                                location: ""
                            })
                        }
                    >
                        Append
                    </button>
                </div>

                <div>
                    {usageFields.map((field, index) => {
                        return (
                            <div className="" key={field.id}>
                                <FormField
                                    control={form.control}
                                    key={index + 1}
                                    name={`instructions.usage.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="">
                                                Usage Name
                                            </FormLabel>
                                            <FormDescription className="">
                                                Usage Attribute Name
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
                                    key={index + 2}
                                    name={`instructions.usage.${index}.value`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Usage Value
                                            </FormLabel>
                                            <FormDescription>
                                                Usage the discription value.
                                            </FormDescription>
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                                <div className="">
                                    <button
                                        type="button"
                                        className=""
                                        onClick={() => usageRemove(index)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    <button
                        type="button"
                        className=""
                        onClick={() =>
                            usageAppend({
                                name: "",
                                value: ""
                            })
                        }
                    >
                        Append
                    </button>
                </div>

                <div>
                    {efficacyTableFields.map((field, index) => {
                        return (
                            <div className="" key={field.id}>
                                <FormField
                                    control={form.control}
                                    key={index + 1}
                                    name={`instructions.efficacy_table.${index}.species`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="">
                                                Species
                                            </FormLabel>
                                            <FormDescription className="">
                                                Description Attribute
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
                                    key={index + 2}
                                    name={`instructions.efficacy_table.${index}.third_stage`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Description Value
                                            </FormLabel>
                                            <FormDescription>
                                                Describe the discription name.
                                            </FormDescription>
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    key={index + 2}
                                    name={`instructions.efficacy_table.${index}.fourth_stage`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Description Value
                                            </FormLabel>
                                            <FormDescription>
                                                Describe the discription name.
                                            </FormDescription>
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    key={index + 2}
                                    name={`instructions.efficacy_table.${index}.adults`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Description Value
                                            </FormLabel>
                                            <FormDescription>
                                                Describe the discription name.
                                            </FormDescription>
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                                <div className="">
                                    <button
                                        type="button"
                                        className=""
                                        onClick={() => efficacyTableRemove(index)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    <button
                        type="button"
                        className=""
                        onClick={() =>
                            efficacyTableAppend({
                                species: "",
                                third_stage: "",
                                fourth_stage: "",
                                adults: ""
                            })
                        }
                    >
                        Append
                    </button>
                </div>

                <div>
                    {efficacyFields.map((field, index) => {
                        return (
                            <div className="" key={field.id}>
                                <FormField
                                    control={form.control}
                                    key={index + 1}
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
                                    key={index + 2}
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
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="">
                                    <button
                                        type="button"
                                        className=""
                                        onClick={() => efficacyRemove(index)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    <button
                        type="button"
                        className=""
                        onClick={() =>
                            efficacyAppend({
                                name: "",
                                value: ""
                            })
                        }
                    >
                        Append
                    </button>
                </div>

                <FormField
                    control={form.control}
                    name="instructions.key_map.type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Key Map Type</FormLabel>
                            <FormControl>
                                <Input placeholder="Type" {...field} />
                            </FormControl>
                            <FormDescription></FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div>
                    {keyMapValueFields.map((field, index) => {
                        return (
                            <div className="" key={field.id}>
                                <FormField
                                    control={form.control}
                                    key={index + 1}
                                    name={`instructions.key_map.values.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="">
                                                Keymap Name
                                            </FormLabel>
                                            <FormDescription className="">
                                                Keymap Description Attribute Name
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
                                    key={index + 2}
                                    name={`instructions.key_map.values.${index}.value`}

                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Keymap Value
                                            </FormLabel>
                                            <FormDescription>
                                                Keymap Describe the discription name.
                                            </FormDescription>
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="">
                                    <button
                                        type="button"
                                        className=""
                                        onClick={() => keyMapValueRemove(index)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    <button
                        type="button"
                        className=""
                        onClick={() =>
                            keyMapValueAppend({
                                name: "",
                                value: ""
                            })
                        }
                    >
                        Append
                    </button>
                </div>

                <div>
                    {examplesField.map((field, index) => {
                        return (
                            <div className="" key={field.id}>
                                <FormField
                                    control={form.control}
                                    key={index + 1}
                                    name={`instructions.examples.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="">
                                                Keymap Name
                                            </FormLabel>
                                            <FormDescription className="">
                                                Keymap Description Attribute Name
                                            </FormDescription>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="">
                                    <button
                                        type="button"
                                        className=""
                                        onClick={() => examplesRemove(index)}
                                    >
                                        Delete
                                    </button>
                                </div>
                                <ProductExamples nestedIndex={index} {...{ control }} />
                            </div>
                        );
                    })}

                    <button
                        type="button"
                        className=""
                        onClick={() =>
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
                                        }
                                    }
                                ]
                            })
                        }
                    >
                        Append
                    </button>
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
