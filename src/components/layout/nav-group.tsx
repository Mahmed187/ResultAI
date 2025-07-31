"use client"

import * as React from "react"
import * as Collapsible from "@radix-ui/react-collapsible"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { type NavGroup as NavGroupType, type NavItem, type NavLink, type NavCollapsible } from "./types"

interface NavGroupProps extends NavGroupType {}

// Utility functions (not hooks)
function isItemActive(url: string | undefined, currentPath: string): boolean {
  if (!url) return false
  return currentPath === url || currentPath.startsWith(`${url}/`)
}

function hasActiveSubItem(items: Array<{ url: string }>, currentPath: string): boolean {
  return items.some(item => isItemActive(item.url, currentPath))
}

export function NavGroup({ title, items }: NavGroupProps) {
  const { state } = useSidebar()
  const currentPath = usePathname()

  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({})

  const toggleOpen = (itemTitle: string) => {
    setOpenItems(prev => ({ ...prev, [itemTitle]: !prev[itemTitle] }))
  }

  return (
    <SidebarGroup data-sidebar="group">
      {state !== "collapsed" && (
        <SidebarGroupLabel data-sidebar="group-label">{title}</SidebarGroupLabel>
      )}
      <SidebarMenu data-sidebar="menu" className="">
        {items.map((item, index) => {
          const key = `${item.title}-${index}`
          const isMatched = isItemActive(item.url, currentPath)
          const isOpen = openItems[key] || false
          const hasChildren = item.items && item.items.length > 0

          const content = (
            <div
              className={`
                ${isMatched ? "bg-gray-300 border-l-2 border-black" : ""} ${state === "collapsed" ? " justify-center" : "justify-start pl-2"}
                py-2 rounded-lg flex items-center gap-2 cursor-pointer
              `}
              onClick={() => hasChildren && toggleOpen(key)}
            >
              {item.icon && <item.icon className="w-6" />}
              {state !== "collapsed" && <h3>{item.title}</h3>}
              {hasChildren && state !== "collapsed" &&
                (isOpen ? (
                  <ChevronDown className="ml-auto w-4" />
                ) : (
                  <ChevronUp className="ml-auto w-4" />
                ))}
            </div>
          )

          return (
            <div key={key}>
              {item.url && !hasChildren ? (
                <Link href={item.url} className="">{content}</Link>
              ) : (
                content
              )}

              {hasChildren && isOpen && state !== "collapsed" && (
                <div className="ml-6 mt-1 space-y-1">
                  {item?.items?.map((child, childIndex) => {
                    const childKey = `${child.title}-${childIndex}`
                    const isChildActive = isItemActive(child.url, currentPath)
                    return (
                      <Link
                        key={childKey}
                        href={child.url || "#"}
                        className={`
                          flex items-center gap-2 py-2 pl-2 rounded-lg
                          ${isChildActive ? "bg-gray-300 border-l-2 border-black" : ""}
                        `}
                      >
                        {child.icon && <child.icon className="w-5" />}
                        <span>{child.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

const SidebarMenuLink = React.memo(({ item, currentPath }: { item: NavLink; currentPath: string }) => {
  const { setOpenMobile, state } = useSidebar()
  const isActive = isItemActive(item.url, currentPath)

  const handleClick = React.useCallback(() => {
    setOpenMobile(false)
  }, [setOpenMobile])

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpenMobile(false)
    }
  }, [setOpenMobile])

  return (
    <SidebarMenuItem data-sidebar="menu-item">
      <SidebarMenuButton
        tooltip={item.title}
        isActive={isActive}
        className={`sidebar-nav-item nav-link-inner ${isActive ? 'active' : ''}`}
        data-sidebar="menu-button"
        asChild
      >
        <Link 
          href={item.url} 
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-current={isActive ? 'page' : undefined}
          className="group"
        >
          {item.icon && (
            <div className="sidebar-nav-icon-wrapper">
              <item.icon className="sidebar-nav-icon" aria-hidden="true" />
              {/* <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
            </div>
          )}
          <span className="sidebar-nav-text">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm">
              {item.badge}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
})
SidebarMenuLink.displayName = 'SidebarMenuLink'

const SidebarMenuCollapsible = React.memo(({ 
  item, 
  currentPath 
}: { 
  item: NavCollapsible; 
  currentPath: string 
}) => {
  const { setOpenMobile } = useSidebar()
  
  // Memoize the isActive calculation to prevent unnecessary re-renders
  const isActive = React.useMemo(() => hasActiveSubItem(item.items, currentPath), [item.items, currentPath])
  
  // Initialize isOpen state with isActive, but don't update it in useEffect
  const [isOpen, setIsOpen] = React.useState(() => isActive)

  const handleSubItemClick = React.useCallback(() => {
    setOpenMobile(false)
  }, [setOpenMobile])

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpenMobile(false)
    }
  }, [setOpenMobile])

  // Only update isOpen when isActive changes and component is not already open
  React.useEffect(() => {
    if (isActive && !isOpen) {
      setIsOpen(true)
    }
  }, [isActive, isOpen])

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuItem>
        <Collapsible.Trigger asChild>
          <SidebarMenuButton 
            tooltip={item.title} 
            className={`sidebar-nav-item nav-link-inner group ${isActive ? 'active' : ''}`}
            aria-expanded={isOpen}
          >
            {item.icon && (
              <div className="sidebar-nav-icon-wrapper">
                <item.icon className="sidebar-nav-icon" aria-hidden="true" />
                {/* <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
              </div>
            )}
            <span className="sidebar-nav-text">{item.title}</span>
            <div id="svg-container-chevron-down" className="ml-auto">
              <ChevronDown 
                className="h-4 w-4 transition-all duration-300 ease-out group-hover:scale-110 data-[state=open]:rotate-180" 
                aria-hidden="true" 
              />
            </div>
          </SidebarMenuButton>
        </Collapsible.Trigger>
        <Collapsible.Content className="overflow-hidden transition-all duration-300 ease-out">
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isItemActive(subItem.url, currentPath)}
                  className="nav-link-inner group"
                >
                  <Link 
                    href={subItem.url} 
                    onClick={handleSubItemClick}
                    onKeyDown={handleKeyDown}
                    aria-current={isItemActive(subItem.url, currentPath) ? 'page' : undefined}
                  >
                    {subItem.icon && (
                      <div className="sidebar-nav-icon-wrapper">
                        <subItem.icon className="sidebar-nav-icon" aria-hidden="true" />
                        {/* <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
                      </div>
                    )}
                    <span className="sidebar-nav-text">{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </Collapsible.Content>
      </SidebarMenuItem>
    </Collapsible.Root>
  )
})
SidebarMenuCollapsible.displayName = 'SidebarMenuCollapsible'

const SidebarMenuCollapsedDropdown = React.memo(({ 
  item, 
  currentPath 
}: { 
  item: NavCollapsible; 
  currentPath: string 
}) => {
  const handleSubItemClick = React.useCallback(() => {
    // Close mobile menu when item is clicked
  }, [])

  return (
    <SidebarMenuItem data-sidebar="menu-item">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            // tooltip={item.title}
            data-sidebar="menu-button"
            aria-label={`${item.title} menu`}
          >
            {item.icon && <item.icon className="sidebar-nav-icon" aria-hidden="true" />}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-lg"
          side="right"
          align="start"
        >
          <DropdownMenuItem className="gap-2 p-2" disabled>
            {item.icon && <item.icon size={16} aria-hidden="true" />}
            <span>{item.title}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {item.items.map((subItem) => (
            <DropdownMenuItem key={subItem.title} asChild>
              <Link 
                href={subItem.url} 
                className="gap-2 p-2"
                onClick={handleSubItemClick}
                aria-current={isItemActive(subItem.url, currentPath) ? 'page' : undefined}
              >
                <span>{subItem.title}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
})
SidebarMenuCollapsedDropdown.displayName = 'SidebarMenuCollapsedDropdown' 