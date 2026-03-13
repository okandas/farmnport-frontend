"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { sendGTMEvent } from "@next/third-parties/google"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { queryBuyerContacts } from "@/lib/query"
import { AuthenticatedUser } from "@/lib/schemas"
import { capitalizeFirstLetter, slug } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"
import { Button } from "@/components/ui/button"

interface BuyerContact {
  id: string
  client_id: string
  client_name: string
  name: string
  phone: string
  alternative_phone?: string
  email?: string
  position?: string
  status: string
  subscribed?: boolean
}

interface BuyerContactsProps {
  clientId: string
  clientName: string
  user: AuthenticatedUser | null
}

function ShowPhone({ phone }: { phone: string }) {
  const [show, setShow] = useState(false)

  return show ? (
    <Link href={`tel:${phone}`} className="text-sm text-muted-foreground hover:underline">
      {phone}
    </Link>
  ) : (
    <Button
      className="p-0 h-[22px]"
      variant="link"
      onClick={() => {
        sendGTMEvent({ event: 'action', value: 'ViewBuyerContactPhone' })
        setShow(true)
      }}
    >
      Show phone
    </Button>
  )
}

function ShowEmail({ email }: { email: string }) {
  const [show, setShow] = useState(false)

  return show ? (
    <Link href={`mailto:${email}`} className="text-sm text-muted-foreground hover:underline">
      {email}
    </Link>
  ) : (
    <Button
      className="p-0 h-[22px]"
      variant="link"
      onClick={() => {
        sendGTMEvent({ event: 'action', value: 'ViewBuyerContactEmail' })
        setShow(true)
      }}
    >
      Show email
    </Button>
  )
}

export function BuyerContacts({ clientId, clientName, user }: BuyerContactsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { data, isLoading } = useQuery({
    queryKey: ["buyer-contacts", clientId],
    queryFn: () => queryBuyerContacts(clientId),
    enabled: !!clientId,
    refetchOnWindowFocus: false,
  })

  const contacts = (data?.data || []) as BuyerContact[]

  if (isLoading || contacts.length === 0) return null

  const isSubscribed = contacts[0]?.subscribed === true
  const nameSlug = slug(clientName)
  const queryString = new URLSearchParams(searchParams?.toString())
  queryString.set('entity', 'buyer')
  queryString.set('wantToSee', nameSlug)

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Icons.users className="h-5 w-5 text-primary" />
        Buyer Contacts
      </h2>
      <div className="space-y-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="border-b last:border-b-0 pb-3 last:pb-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold">{capitalizeFirstLetter(contact.name)}</p>
              {contact.position && (
                <span className="text-xs text-muted-foreground">— {capitalizeFirstLetter(contact.position)}</span>
              )}
            </div>
            <div className="flex flex-col gap-1 ml-0.5">
              <div className="flex items-center gap-2">
                <Icons.phone className="h-3.5 w-3.5 text-muted-foreground" />
                {!user ? (
                  <Button
                    className="p-0 h-[22px]"
                    variant="link"
                    onClick={() => {
                      sendGTMEvent({ event: 'action', value: 'LoggedOutViewBuyerContactPhone' })
                      router.push(`/login?${queryString.toString()}`)
                    }}
                  >
                    Login to view
                  </Button>
                ) : isSubscribed && contact.phone ? (
                  <ShowPhone phone={contact.phone} />
                ) : (
                  <Button
                    className="p-0 h-[22px]"
                    variant="link"
                    onClick={() => {
                      sendGTMEvent({ event: 'action', value: 'SubscribeToViewBuyerContactPhone' })
                      router.push('/pricing')
                    }}
                  >
                    Subscribe to view
                  </Button>
                )}
              </div>
              {(contact.email || !isSubscribed) && (
                <div className="flex items-center gap-2">
                  <Icons.mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {!user ? (
                    <Button
                      className="p-0 h-[22px]"
                      variant="link"
                      onClick={() => {
                        sendGTMEvent({ event: 'action', value: 'LoggedOutViewBuyerContactEmail' })
                        router.push(`/login?${queryString.toString()}`)
                      }}
                    >
                      Login to view
                    </Button>
                  ) : isSubscribed && contact.email ? (
                    <ShowEmail email={contact.email} />
                  ) : (
                    <Button
                      className="p-0 h-[22px]"
                      variant="link"
                      onClick={() => {
                        sendGTMEvent({ event: 'action', value: 'SubscribeToViewBuyerContactEmail' })
                        router.push('/pricing')
                      }}
                    >
                      Subscribe to view
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
