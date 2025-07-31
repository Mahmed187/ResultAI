"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Microscope, Scan, X, Activity, Heart } from "lucide-react"

const mainNavItems = [
  {
    title: "Home",
    href: "/home",
  },
  {
    title: "Consultation",
    href: "/consultation",
  },
  {
    title: "Lab Results",
    href: "/results",
    subItems: [
      {
        title: "Pathology",
        href: "/results/pathology",
        icon: Microscope,
      },
      {
        title: "MRI Scans",
        href: "/results/mri",
        icon: Scan,
      },
      {
        title: "X-Ray",
        href: "/results/xray",
        icon: X,
      },
      {
        title: "ECG",
        href: "/results/ecg",
        icon: Activity,
      },
      {
        title: "Cardiac",
        href: "/results/cardiac",
        icon: Heart,
      },
    ],
  },
  {
    title: "Messages",
    href: "/chats",
  },
  {
    title: "Appointments",
    href: "/calendar",
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {mainNavItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.subItems && item.subItems.some(subItem => pathname === subItem.href))

        if (item.subItems) {
          return (
            <DropdownMenu key={item.href}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.title}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {item.subItems.map((subItem) => (
                  <DropdownMenuItem key={subItem.href} asChild>
                    <Link
                      href={subItem.href}
                      className={cn(
                        "flex items-center",
                        pathname === subItem.href ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <subItem.icon className="mr-2 h-4 w-4" />
                      {subItem.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
} 