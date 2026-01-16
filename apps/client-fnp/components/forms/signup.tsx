"use client"

import { useState, useEffect } from "react"
import axios from 'axios'

import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { captureException } from "@sentry/nextjs";
import { useForm, Controller } from "react-hook-form"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons/lucide"
import { toast } from "sonner"

import { AuthSignUpSchema, SignUpFormData, LoginFormData, FarmProduceCategoriesResponse, FarmProduceResponse, FarmProduce } from "@/lib/schemas"
import { cn, capitalizeFirstLetter } from "@/lib/utilities"
import { clientSignup, queryFarmProduceCategories, queryFarmProduceByCategory } from "@/lib/query"
import { signIn} from "@/auth"



import {
    clientTypes,
    provinces,
    scales,
} from "@/components/structures/repository/data"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }


export function SignUpAuthForm({ className, ...props }: AuthFormProps) {

    const { register, handleSubmit, formState, control, watch, setValue, setError  } = useForm<SignUpFormData>({
        resolver: zodResolver(AuthSignUpSchema)
    })

    const [open, setOpen] = useState(false)
    const [credentials, setCredentials] = useState<LoginFormData>({
        email: '',
        password: ''
    })

    const { errors } = formState

    const { mutate, isPending, isSuccess } = useMutation({
        mutationFn: clientSignup,
        onSuccess: async (response) => {
    
            toast("Success", {
                description: "Sign up successful, logging you in and redirecting you to dashboard.",
            })

            const signedInResponse = await signIn('credentials', { email: credentials.email, password: credentials.password, redirect: true })
    
        },
        onError: (error) => {

            captureException(error)

            if (axios.isAxiosError(error))  {

                if (error.response?.data.message == "This name has already been registered") {

                    setError('name', { message: "Change this name"}, {shouldFocus: true})

                } else if (error.response?.data.message == "This email has already been registered")  {

                    setError('email', { message: "Change this email"}, {shouldFocus: true})
                
                } else if (error.response?.data.message == "This phone has already been registered") {
                
                    setError('phone', { message: "Change this phone number "}, {shouldFocus: true})

                } else {
                    toast("Failed to signup", {
                          description: `(${error?.message}) Please Try Again`
                    })
                }                
            } else {
                toast("Failed to signup", {
                    description: `(${error?.message}) Please Try Again`
                })

                console.log(error?.message)
            }
        },
    })

    const selectedSpecializations = watch("specializations") || []
    const selectedOtherProduceIDs = watch("other_produce_ids") || []

    const changingSpecialization = watch("specialization")
    const changingPrimaryProduceID = watch("primary_produce_id")

    const selectedMainActivity = watch("main_activity")
    const selectedMainProduceID = watch("main_produce_id")

    const selectedType = watch("type")

    // Fetch all categories
    const { data: categoriesData } = useQuery({
        queryKey: ["farm-produce-categories"],
        queryFn: () => queryFarmProduceCategories(),
    })

    const categories = (categoriesData?.data as FarmProduceCategoriesResponse)?.data || []

    // Fetch produce for selected category
    const selectedCategory = categories.find(cat => cat.id === changingPrimaryProduceID)

    const { data: produceData } = useQuery({
        queryKey: ["farm-produce-by-category", selectedCategory?.slug],
        queryFn: () => queryFarmProduceByCategory(selectedCategory!.slug),
        enabled: !!selectedCategory?.slug,
    })

    const produceItems = (produceData?.data as FarmProduceResponse)?.data || []

    // For "Other Activities", we need all produce grouped by category
    const [allProduceByCategory, setAllProduceByCategory] = useState<Record<string, FarmProduce[]>>({})

    useEffect(() => {
        const fetchAllProduce = async () => {
            const produceByCategory: Record<string, FarmProduce[]> = {}

            for (const category of categories) {
                try {
                    const response = await queryFarmProduceByCategory(category.slug)
                    const data = response.data as FarmProduceResponse
                    produceByCategory[category.id] = data.data
                } catch (error) {
                    console.error(`Failed to fetch produce for ${category.name}`, error)
                }
            }

            setAllProduceByCategory(produceByCategory)
        }

        if (categories.length > 0) {
            fetchAllProduce()
        }
    }, [categories])

    const submitSignUpForm = async (payload: SignUpFormData) => {

        const credentialsPayload: LoginFormData = {
            email: payload.email,
            password: payload.password
        }

        setCredentials(credentialsPayload)
        mutate(payload)
    }

    return (
        <div className={cn("", className)} {...props}>
            <form onSubmit={handleSubmit((data) => submitSignUpForm(data))}>
                <div className="space-y-12">
                    {/* Business Information Section */}
                    <div className="border-b border-zinc-900/10 pb-12 dark:border-zinc-700/40">
                        <h2 className="text-base/7 font-semibold text-zinc-900 dark:text-white">Business Information</h2>
                        <p className="mt-1 text-sm/6 text-zinc-600 dark:text-zinc-400">
                            Tell us about your farm or business. This information will be visible to potential partners.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <Label htmlFor="name">
                            Company or Farm Name
                        </Label>
                        <Input 
                            className="mt-2"
                            id="name"
                            placeholder="BaRa Farm"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="name"
                            autoCorrect="off"
                            disabled={isPending}
                            {...register("name", { required: true })}
                        />
                        {errors?.name && (
                            <p className="px-2 text-xs text-red-600 py-2">
                                {errors.name.message}
                            </p>
                        )}
                    </div>
                    <div className="sm:col-span-3">
                        <Label htmlFor="phone">
                            Phone number
                        </Label>
                        <Input
                            className="mt-2"
                            id="phone"
                            placeholder="0719 099 790"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="off"
                            disabled={isPending}
                            {...register("phone", { required: true })}
                        />
                        {errors?.phone && (
                            <p className="px-2 text-xs text-red-600 py-2">
                                {errors.phone.message}
                            </p>
                        )}
                    </div>
                    <div className="sm:col-span-3">
                        <Label htmlFor="email">
                            Email
                        </Label>
                        <Input
                            className="mt-2"
                            id="email"
                            placeholder="info@farmnport.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isPending}
                            {...register("email", { required: true })}
                        />
                        {errors?.email && (
                            <p className="px-2 text-xs text-red-600 py-2">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="sm:col-span-3">
                        <Label htmlFor="type">
                            Business Type
                        </Label>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) =>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Are you a Farmer or Buyer?" />
                                    </SelectTrigger>

                                    <SelectContent className="overflow-visible max-h-44">
                                        {clientTypes.map((type) => {
                                            return (
                                                <SelectItem key={type} value={type}>
                                                    {capitalizeFirstLetter(type)}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>}
                        />
                        {errors?.type && (
                            <p className="px-2 text-xs text-red-600 py-2">
                                {errors.type.message}
                            </p>
                        )}
                    </div>

                    <div className="col-span-full">
                        <Label htmlFor="email">
                            Address
                        </Label>
                        <Input
                            className="mt-2"
                            id="address"
                            placeholder="13 Grace Road Winston Park"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="address"
                            autoCorrect="off"
                            disabled={isPending}
                            {...register("address", { required: true })}
                        />
                        {errors?.address && (
                            <p className="px-2 text-xs text-red-600 py-2">
                                {errors.address.message}
                            </p>
                        )}
                    </div>

                    <div className="sm:col-span-2 sm:col-start-1">
                        <Label htmlFor="city">
                            City
                        </Label>
                        <Input
                            className="mt-2"
                            id="city"
                            placeholder="Marondera"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="city"
                            autoCorrect="off"
                            disabled={isPending}
                            {...register("city", { required: true })}
                        />
                        {errors?.city && (
                            <p className="px-2 text-xs text-red-600 py-2">
                                {errors.city.message}
                            </p>
                        )}
                    </div>

                    <div className="sm:col-span-2">
                        <Label htmlFor="province">
                            Province
                        </Label>
                        <Controller
                            name="province"
                            control={control}
                            render={({ field }) =>
                                <Select
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select Province." />
                                    </SelectTrigger>

                                    <SelectContent className="overflow-visible max-h-44">
                                        {provinces.map((province) => {
                                            return (
                                                <SelectItem key={province} value={province}>
                                                    {capitalizeFirstLetter(province)}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>}
                        />
                        {errors?.province && (
                            <p className="px-2 text-xs text-red-600 py-2">
                                {errors.province.message}
                            </p>)}
                    </div>

                    <div className="sm:col-span-2">
                        <Label htmlFor="scale">
                            Scale
                        </Label>
                        <Controller
                            name="scale"
                            control={control}
                            render={({ field }) =>
                                <Select
                                    onValueChange={field.onChange}
                                >

                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="What is your scale ?" />
                                    </SelectTrigger>

                                    <SelectContent className="overflow-visible max-h-44">
                                        {scales.map((scale) => {
                                            return (
                                                <SelectItem key={scale} value={scale}>
                                                    {capitalizeFirstLetter(scale)}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>}
                        />
                        {errors?.scale && (
                            <p className="px-2 text-xs text-red-600 py-2">
                                {errors.scale.message}
                            </p>
                        )}
                    </div>
                        </div>
                    </div>

                    {/* Farming Activities Section */}
                    <div className="pb-12">
                        <h2 className="text-base/7 font-semibold text-zinc-900 dark:text-white">
                            {selectedType === "buyer" ? "Buying Interests" : "Farming Activities"}
                        </h2>
                        <p className="mt-1 text-sm/6 text-zinc-600 dark:text-zinc-400">
                            {selectedType === "buyer"
                                ? "Select your primary buying focus and the products you're interested in."
                                : "Select your primary focus and the products you work with."}
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                    <div className="sm:col-span-3">
                        <Label htmlFor="primary_produce_id">
                            Primary Focus
                        </Label>
                        <Controller
                            name="primary_produce_id"
                            control={control}
                            render={({ field }) =>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select Your Primary Focus" />
                                    </SelectTrigger>

                                    <SelectContent className="overflow-visible max-h-44">
                                        {categories.map((category) => {
                                            return (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {capitalizeFirstLetter(category.name)}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>}
                        />
                        {errors?.primary_produce_id && (
                            <p className="px-2 text-xs text-red-600 py-2">
                                {errors.primary_produce_id.message}
                            </p>
                        )}
                    </div>

                    <div className="sm:col-span-3">
                        <Label htmlFor="main_produce_id">
                            Main Product
                        </Label>
                        <Controller
                            name="main_produce_id"
                            control={control}
                            render={({ field }) =>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >

                                    <SelectTrigger
                                        className="mt-2"
                                        disabled={!changingPrimaryProduceID}
                                    >
                                        <SelectValue placeholder={!changingPrimaryProduceID ?
                                            "Select Primary Focus First" : "Select Your Main Product"
                                        } />
                                    </SelectTrigger>

                                    <SelectContent className="overflow-visible max-h-44">
                                        {produceItems.map((produce) => {
                                            return (
                                                <SelectItem key={produce.id} value={produce.id}>
                                                    {capitalizeFirstLetter(produce.name)}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            }
                        />
                        {errors?.main_produce_id && (
                            <p className="px-2 text-xs text-red-600 py-2">
                                {errors.main_produce_id.message}
                            </p>
                        )}
                    </div>

                    <div className="col-span-full">
                        <Label htmlFor="other_produce_ids">
                            Other Products
                        </Label>
                        <Controller
                            name="other_produce_ids"
                            control={control}
                            render={({ field }) =>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <div className="group mt-2 min-h-[2.5rem] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 cursor-pointer">
                                            <div className="flex flex-wrap gap-1">
                                                {selectedOtherProduceIDs?.length >= 1
                                                    ? selectedOtherProduceIDs?.map((produceID) => {
                                                                // Find the produce name from all produce
                                                                let produceName = ""
                                                                for (const categoryID in allProduceByCategory) {
                                                                    const produce = allProduceByCategory[categoryID].find(p => p.id === produceID)
                                                                    if (produce) {
                                                                        produceName = produce.name
                                                                        break
                                                                    }
                                                                }

                                                                if (produceName) {
                                                                    return (
                                                                        <Badge
                                                                            key={produceID}
                                                                            variant="outline"
                                                                            className="flex justify-between text-green-800 bg-green-100 border-green-400 dark:text-green-300 dark:bg-green-900/30 dark:border-green-600"
                                                                        >
                                                                            {capitalizeFirstLetter(produceName)}
                                                                        </Badge>
                                                                    )
                                                                }
                                                                return null
                                                            })
                                                    : <span className="text-muted-foreground">Select other products you practice...</span>}
                                            </div>
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[320px] sm:w-[520px] p-0">
                                        <Command className="border rounded-lg shadow-md max-h-52">
                                            <CommandInput placeholder="Search..." />
                                            <CommandList>
                                                <CommandEmpty className="py-3 text-center">
                                                    No results found.
                                                </CommandEmpty>
                                                {categories.map((category) => {
                                                    const categoryProduce = allProduceByCategory[category.id] || []

                                                    return (
                                                        <CommandGroup
                                                            key={category.id}
                                                            heading={capitalizeFirstLetter(category.name)}
                                                        >
                                                            {categoryProduce.map((produce) => {
                                                                if (produce.id !== selectedMainProduceID) {
                                                                    return (
                                                                        <CommandItem
                                                                            key={produce.id}
                                                                            onSelect={() => {
                                                                                if (!selectedOtherProduceIDs?.includes(produce.id)) {
                                                                                    const newIDs = selectedOtherProduceIDs ? [...selectedOtherProduceIDs, produce.id] : [produce.id]
                                                                                    setValue("other_produce_ids", newIDs)
                                                                                } else {
                                                                                    const newIDs = selectedOtherProduceIDs.filter(id => id !== produce.id)
                                                                                    setValue("other_produce_ids", newIDs)
                                                                                }
                                                                            }}
                                                                        >
                                                                            {selectedOtherProduceIDs?.includes(produce.id) ? (
                                                                                <Icons.check className="w-4 h-4 mr-2" />
                                                                            ) : null}
                                                                            <span>{capitalizeFirstLetter(produce.name)}</span>
                                                                        </CommandItem>
                                                                    )
                                                                }
                                                                return null
                                                            })}
                                                        </CommandGroup>
                                                    )
                                                })}
                                                <CommandSeparator />
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            }
                        />
                        {errors?.other_produce_ids && (
                            <p className="px-2 text-xs text-red-600 py-2">
                                {errors.other_produce_ids.message}
                            </p>
                        )}
                    </div>
                        </div>
                    </div>

                    {/* Account Security Section */}
                    <div className="pb-12">
                        <h2 className="text-base/7 font-semibold text-zinc-900 dark:text-white">Account Security</h2>
                        <p className="mt-1 text-sm/6 text-zinc-600 dark:text-zinc-400">
                            Create a secure password for your account.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <Label htmlFor="password">
                                    Password
                                </Label>
                                <Input
                                    className="mt-2"
                                    id="password"
                                    type="password"
                                    autoCapitalize="none"
                                    autoComplete="new-password"
                                    autoCorrect="off"
                                    disabled={isPending}
                                    {...register("password", { required: true })}
                                />
                                {errors?.password && (
                                    <p className="px-2 text-xs text-red-600 py-2">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="sm:col-span-3">
                                <Label htmlFor="confirm_password">
                                    Confirm Password
                                </Label>
                                <Input
                                    className="mt-2"
                                    id="confirm_password"
                                    type="password"
                                    autoCapitalize="none"
                                    autoComplete="new-password"
                                    autoCorrect="off"
                                    disabled={isPending}
                                    {...register("confirm_password", {
                                            validate: (value, formValues) =>
                                                value === formValues.password || "The passwords do not match"
                                        })
                                    }
                                />
                                {errors?.confirm_password && (
                                    <p className="px-2 text-xs text-red-600 py-2">
                                        {errors.confirm_password.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <Link
                        href="/login"
                        className="text-sm/6 font-semibold text-zinc-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                        Already have an account? Login here
                    </Link>
                    <button
                        className="rounded-md bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 dark:focus-visible:outline-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={isPending || isSuccess}
                        type="submit"
                    >
                        {isPending && (
                            <Icons.spinner className="w-4 h-4 mr-2 animate-spin inline" />
                        )}
                        Sign Up
                    </button>
                </div>
            </form>
        </div>
    )
}
