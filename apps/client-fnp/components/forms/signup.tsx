"use client"

import { useState } from "react"
import axios from 'axios'

import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { captureException } from "@sentry/nextjs";
import { useForm, Controller } from "react-hook-form"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons/lucide"
import { toast } from "sonner"

import { AuthSignUpSchema, SignUpFormData, LoginFormData } from "@/lib/schemas"
import { cn, capitalizeFirstLetter } from "@/lib/utilities"
import { clientSignup } from "@/lib/query"
import { handleTokenRefresh, auth, signIn} from "@/auth"
import { loginUser } from "@/lib/actions"


import {
    clientTypes,
    mainActivity,
    provinces,
    scales,
    specializations,
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

    const router = useRouter()
    const searchParams = useSearchParams()
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

    const changingSpecialization = watch("specialization")

    const selectedMainActivity = watch("main_activity")

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
                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
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
                    <div className="sm:col-span-4">
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

                    <div className="sm:col-span-2">
                        <Label htmlFor="type">
                            Category
                        </Label>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) =>
                                <Select
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select Category" />
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

                    <div className="sm:col-span-3">
                        <Label htmlFor="specialization">
                            Specilization
                        </Label>
                        <Controller
                            name="specialization"
                            control={control}
                            render={({ field }) =>
                                <Select
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Pick Your Specialization" />
                                    </SelectTrigger>

                                    <SelectContent className="overflow-visible max-h-44">
                                        {specializations.map((specialization) => {
                                            return (
                                                <SelectItem key={specialization} value={specialization}>
                                                    {capitalizeFirstLetter(specialization)}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>}
                        />
                        {errors?.specialization && (
                            <p className="px-2 text-xs text-red-600 py-2">
                                {errors.specialization.message}
                            </p>
                        )}
                    </div>

                    <div className="sm:col-span-2 sm:col-start-1">
                        <Label htmlFor="main_activity">
                            Main Product
                        </Label>
                        <Controller
                            name="main_activity"
                            control={control}
                            render={({ field }) =>
                                <Select
                                    onValueChange={field.onChange}
                                >

                                    <SelectTrigger
                                        className="mt-2"
                                        disabled={typeof changingSpecialization === "undefined"}
                                    >
                                        <SelectValue placeholder={typeof changingSpecialization === "undefined" ?
                                            "Pick A Specialization First" : "Select Main Product."
                                        } />
                                    </SelectTrigger>

                                    <SelectContent className="overflow-visible max-h-44">
                                        {mainActivity[changingSpecialization]?.map((activity) => {
                                            return (
                                                <SelectItem key={activity} value={activity}>
                                                    {capitalizeFirstLetter(activity)}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            }
                        />
                        {errors?.main_activity && (
                            <p className="px-2 text-xs text-red-600 py-2">
                                {errors.main_activity.message}
                            </p>
                        )}
                    </div>

                    <div className="sm:col-span-2">
                        <Label htmlFor="password">
                            Password
                        </Label>
                        <Input
                            className="mt-2"
                            id="password"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="password"
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

                    <div className="sm:col-span-2">
                        <Label htmlFor="confirm_password">
                            Confirm Password
                        </Label>
                        <Input
                            className="mt-2"
                            id="confirm_password"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="confirm_password"
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

                    <div className="sm:col-span-4">
                        <Label htmlFor="specializations">
                            Other Products
                        </Label>
                        <Controller
                            name="specializations"
                            control={control}
                            render={({ field }) =>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <div className="group min-h-[2.5rem] rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
                                            <div className="flex flex-wrap gap-1">
                                                {selectedSpecializations?.length >= 1
                                                    ? selectedSpecializations?.map((selected) => {
                                                        if (selected.length !== 0) {
                                                            return (
                                                                <Badge
                                                                    key={selected}
                                                                    variant="outline"
                                                                    className="flex justify-between text-green-800 bg-green-100 border-green-400"
                                                                >
                                                                    {capitalizeFirstLetter(selected)}
                                                                </Badge>
                                                            )
                                                        }
                                                    })
                                                    : "Select Specialization ..."}
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
                                                {specializations.map((specialization) => {
                                                    return (
                                                        <CommandGroup
                                                            key={specialization}
                                                            heading={specialization}
                                                        >
                                                            {mainActivity[specialization].map(
                                                                (activity) => {
                                                                    if (selectedMainActivity !== activity) {
                                                                        return (
                                                                            <CommandItem
                                                                                key={activity}
                                                                                onSelect={(value) => {
                                                                                    if (
                                                                                        !selectedSpecializations?.includes(
                                                                                            value,
                                                                                        )
                                                                                    ) {
                                                                                        

        
                                                                                        if (typeof selectedSpecializations === 'undefined') {
                                                                                            const NewSpecialization = [
                                                                                                value,
                                                                                            ]

                                                                                            setValue(
                                                                                                "specializations",
                                                                                                NewSpecialization,
                                                                                            )
                                                                                        } else {
                                                                                            const NewSpecialization = [
                                                                                                ...selectedSpecializations,
                                                                                                value,
                                                                                            ]

                                                                                            setValue(
                                                                                                "specializations",
                                                                                                NewSpecialization,
                                                                                            )
                                                                                        }
                                                                                    

                                                                                   
                                                                                    } else {
                                                                                        const removeAtIndex =
                                                                                            selectedSpecializations?.indexOf(
                                                                                                value,
                                                                                            )

                                                                                        selectedSpecializations?.splice(
                                                                                            removeAtIndex,
                                                                                            1,
                                                                                        )

                                                                                        setValue(
                                                                                            "specializations",
                                                                                            selectedSpecializations,
                                                                                        )
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {selectedSpecializations?.includes(
                                                                                    activity,
                                                                                ) ? (
                                                                                    <Icons.check className="w-4 h-4 mr-2" />
                                                                                ) : null}

                                                                                <span>{capitalizeFirstLetter(activity)}</span>
                                                                            </CommandItem>
                                                                        )
                                                                    } else {
                                                                        null
                                                                    }
                                                                },
                                                            )}
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
                        {errors?.specializations && (
                            <p className="px-2 text-xs text-red-600 py-2">
                                {errors.specializations.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end mt-3">
                    <button
                        className={cn(buttonVariants())}
                        disabled={isPending || isSuccess}
                        type="submit"
                    >
                        {isPending && (
                            <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Sign Up
                    </button>
                </div>
            </form>



            <div className="flex items-center justify-start mt-3 space-x-2">

                <div className="flex items-center text-sm">
                    <p>Already have an account ?</p>
                </div>

                <div className="text-sm leading-6">
                    <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-500">
                        Login here!
                    </Link>
                </div>
            </div>
        </div>
    )
}
