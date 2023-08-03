export type SidebarNavigationItem = {
  title: string
  disabled?: boolean
  external?: boolean
  icon?: keyof typeof Icons
} & (
  | {
      href: string
      items?: never
    }
  | {
      href?: string
      items: NavLink[]
    }
)

export type NavigationItem = {
  title: string
  href: string
  disabled?: boolean
}

export type DashboardConfig = {
  mainNavigation: NavigationItem[]
  sidebarNavigation: SidebarNavigationItem[]
}
