"use client"

import { cn } from "@/lib/utils"
import { Microscope, Scan, X, Activity, Heart } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const categories = [
  {
    id: "pathology",
    name: "Pathology",
    icon: Microscope,
    href: "/results/pathology",
  },
  {
    id: "mri",
    name: "MRI Scans",
    icon: Scan,
    href: "/results/mri",
  },
  {
    id: "xray",
    name: "X-Ray",
    icon: X,
    href: "/results/xray",
  },
  {
    id: "ecg",
    name: "ECG",
    icon: Activity,
    href: "/results/ecg",
  },
  {
    id: "cardiac",
    name: "Cardiac",
    icon: Heart,
    href: "/results/cardiac",
  },
]

export function LabCategoryNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 border-b px-4">
      {categories.map((category) => {
        const isActive = pathname === category.href
        return (
          <Link
            key={category.id}
            href={category.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary py-4",
              isActive
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            )}
          >
            <category.icon className="mr-2 h-4 w-4" />
            {category.name}
          </Link>
        )
      })}
    </nav>
  )
} 