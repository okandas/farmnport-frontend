"use client"

import { useState } from "react"

import { EditApplicationUser, ApplicationUser } from "@/lib/schemas"
import { CreateForm } from "@/components/structures/forms/createClient"

export default function CreateClientPage() {
  const [client, _] = useState<EditApplicationUser>({
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

  return <CreateForm client={client} />
}
