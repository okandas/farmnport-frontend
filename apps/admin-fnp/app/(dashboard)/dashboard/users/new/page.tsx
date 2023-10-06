"use client"

import { useState } from "react"

import { queryUser } from "@/lib/query"
import { EditApplicationUser, ApplicationUser } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { CreateForm } from "@/components/structures/forms/createClient"

export default function CreateClientPage() {
  const [Client, _] = useState<EditApplicationUser>({
    id: "",
    name: "",
    email: "",
    address: "",
    city: "",
    province: "",
    phone: "",
    main_activity: "",
    specialization: "",
    specializations: [],
    type: "",
    scale: "",
    branches: 0,
    short_description: "",
  })

  return <CreateForm client={Client} />
}
