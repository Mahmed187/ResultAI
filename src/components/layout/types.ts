import { type IconProps } from '@tabler/icons-react'

interface User {
  name: string
  email: string
  avatar: string
}

interface Team {
  name: string
  logo: React.ElementType
  plan: string
}

interface BaseNavItem {
  title: string
  badge?: string
  icon?: React.ElementType
}

type NavLink = BaseNavItem & {
  url: string
  items?: (BaseNavItem & { url: string; searchParams?: Record<string, string> })[]
  searchParams?: Record<string, string>
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: string; searchParams?: Record<string, string> })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

interface NavGroup {
  title: string
  items: NavItem[]
}

interface SidebarData {
  user: User
  teams: Team[]
  navGroups: NavGroup[]
}

// Additional nav item types for consistent navigation
export interface ExtendedNavItem {
  title: string
  url?: string
  disabled?: boolean
  external?: boolean
  icon?: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>
  label?: string
  description?: string
  items?: ExtendedNavItem[]
}

export interface NavItemWithChildren extends ExtendedNavItem {
  items: NavItemWithChildren[]
}

export interface NavItemWithOptionalChildren extends ExtendedNavItem {
  items?: NavItemWithChildren[]
}

export interface FooterItem {
  title: string
  items: {
    title: string
    href: string
    external?: boolean
  }[]
}

export type MainNavItem = NavItemWithOptionalChildren
export type SidebarNavItem = NavItemWithChildren

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink, Team, User } 