"use client"

import { useState } from "react"

import { queryUserAsAdmin } from "@/lib/query"
import { AdminEditApplicationUser, ApplicationUser } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { AdminCreateForm } from "@/components/structures/forms/adminCreateClient"

export default function CreateClientPage() {
  const [adminClient, _] = useState<AdminEditApplicationUser>({
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

  return <AdminCreateForm client={adminClient} />
}
