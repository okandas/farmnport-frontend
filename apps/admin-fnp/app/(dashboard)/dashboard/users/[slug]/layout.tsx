import { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utilities";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons/lucide";
import ViewClientHeader from "@/components/navigation/view-client-header";

interface ViewClientLayoutProps {
  children: ReactNode;
  params: {
    slug: string;
  };
}

export default async function ViewClientLayout({
  children,
  params,
}: ViewClientLayoutProps) {
  return (
    <div className="flex flex-col gap-7">
      <>
        <Link
          href="/dashboard/users"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-5 top-24",
          )}
        >
          <>
            <Icons.chevronLeft className="w-4 h-4 mr-2" />
            Back
          </>
        </Link>
      </>
      <ViewClientHeader params={params} />
      <div>{children}</div>
    </div>
  );
}
