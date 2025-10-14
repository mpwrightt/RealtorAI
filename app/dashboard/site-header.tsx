"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

function getPageTitle(pathname: string): string {
  const exactMatches: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/payment-gated": "Payment Gated",
    "/dashboard/listings/new": "Add Listing",
    "/dashboard/buyers/new": "Create Buyer Session",
    "/dashboard/sellers/new": "Create Seller Session",
    "/dashboard/invites": "Portal Invites",
  }

  if (exactMatches[pathname]) {
    return exactMatches[pathname]
  }

  if (pathname.startsWith("/dashboard/listings")) {
    return "My Listings"
  }

  if (pathname.startsWith("/dashboard/buyers")) {
    return "Buyer Sessions"
  }

  if (pathname.startsWith("/dashboard/sellers")) {
    return "Seller Sessions"
  }

  if (pathname.startsWith("/dashboard/campaigns") || pathname.startsWith("/dashboard/sms-campaigns")) {
    return "Campaigns"
  }

  if (pathname.startsWith("/dashboard/messages")) {
    return "Messages"
  }

  if (pathname.startsWith("/dashboard/clients")) {
    return "Client Tracker"
  }

  if (pathname.startsWith("/dashboard/settings")) {
    return "Settings"
  }

  if (pathname.startsWith("/dashboard/help")) {
    return "Help & Support"
  }

  return "Page"
}

export function SiteHeader() {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
      </div>
    </header>
  )
}
