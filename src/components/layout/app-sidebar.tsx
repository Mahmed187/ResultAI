"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { sidebarData } from '@/data/sidebar-data'
import { cn } from '@/lib/utils'
import { Menu, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar 
      collapsible="icon" 
      variant="sidebar" 
      side="left"
      className={cn(
        "sidebar-custom h-full z-50",
        "bg-gradient-to-b from-sidebar/95 to-sidebar/90 backdrop-blur-xl",
        "border-r border-sidebar-border/50 shadow-2xl",
        className
      )}
      {...props}
    >
      <SidebarHeader className="sidebar-header-custom">
        <div className={`${isCollapsed ? "justify-center" : "justify-between" } flex items-center  w-full gap-2`}>
          {/* Logo/Icon */}
          <div className={cn(
            "flex items-center justify-center rounded-xl font-bold select-none",
            isCollapsed ? "w-10 h-10 text-lg" : "w-12 h-12 text-2xl",
            "bg-primary text-primary-foreground"
          )}>
            RA
          </div>
          {/* Text (only when expanded) */}
          {!isCollapsed && (
            <div className="flex flex-col ml-2 flex-1 min-w-0">
              <span className="font-bold text-lg leading-tight truncate">ResultAI</span>
              <span className="text-sm text-muted-foreground leading-tight truncate">Healthcare</span>
            </div>
          )}
         
        </div>
      </SidebarHeader>
      <SidebarContent className="sidebar-normal">
        <div className="sidebar-links px-2 py-4 space-y-1">
          {sidebarData.navGroups.map((props) => (
            <NavGroup key={props.title} {...props} />
          ))}
        </div>
      </SidebarContent>
      <SidebarFooter className="sidebar-footer-custom">
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
} 