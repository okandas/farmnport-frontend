"use client"

import Link from "next/link"

interface ActionsSidebarProps {
  type?: "buyers" | "farmers"
}

export function ActionsSidebar({type = "buyers"}: ActionsSidebarProps) {

  return (
    <aside className="mt-[21px] space-y-6">
      {/* Join Waiting List */}
      <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Unlock Premium Features</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get direct contact information and connect with {type === "buyers" ? "buyers" : "sellers"} instantly.
        </p>
        <Link
          href="/waiting-list-paying"
          className="block w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm text-center"
        >
          Join Waiting List
        </Link>
      </div>
    </aside>
  )
}
