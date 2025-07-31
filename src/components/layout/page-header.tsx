"use client"

import { Input } from "@/components/ui/input"
import { Plus, Search, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { UploadResultsDialog } from "../forms/upload-results-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { PatientForm } from "../forms/patient-form"
import { usePathname } from "next/navigation"

interface PageHeaderProps {
  title: string
  children?: React.ReactNode
  showSearch?: boolean
  onSearch?: (query: string) => void
}

export function PageHeader({ 
  title, 
  children, 
  showSearch = true, 
  onSearch 
}: PageHeaderProps) {
  const pathname = usePathname(); 
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch?.(value)
  }

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded)
  }

  const closeSearch = () => {
    setIsSearchExpanded(false)
    setSearchQuery("")
    onSearch?.("")
  }

  // Focus input when search is expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchExpanded])

  // Handle escape key to close search
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchExpanded) {
        closeSearch()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSearchExpanded])

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node) &&
        isSearchExpanded
      ) {
        closeSearch()
      }
    }

    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchExpanded])

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 px-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground text-2xl font-bold">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="ml-auto flex items-center gap-2">
          {showSearch && (
            <div ref={searchContainerRef} className="relative flex items-center">
              {/* Search Container with sliding animation */}
              <div className={cn(
                "flex items-center transition-all duration-300 ease-in-out overflow-hidden",
                isSearchExpanded ? "w-72" : "w-10"
              )}>
                {/* Search Input */}
                <div className={cn(
                  "relative transition-all duration-300 ease-in-out",
                  isSearchExpanded ? "opacity-100 w-full" : "opacity-0 w-0"
                )}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search patients, reports, appointments..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10 pr-10 bg-background/60 border-border/60 focus:bg-background focus:border-border transition-all duration-300"
                  />
                  <button
                    onClick={closeSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent rounded-sm transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                
                {/* Search Toggle Button */}
                <button
                  onClick={toggleSearch}
                  className={cn(
                    "p-2 hover:bg-accent rounded-md transition-all duration-300 flex-shrink-0",
                    isSearchExpanded ? "opacity-0 scale-0" : "opacity-100 scale-100"
                  )}
                >
                  <Search className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}
          <ThemeToggle />
          <UploadResultsDialog/>
       {pathname === "/patients"   && <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
           <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-5 w-5" />
                Add New Patient
            </Button>
          </DialogTrigger>
       <DialogContent className="sm:max-w-[600px]">
         <DialogHeader>
           <DialogTitle>New Patient</DialogTitle>
         </DialogHeader>
         <PatientForm onSuccess={() => {
            setIsAddDialogOpen(false) 
          }} />
        </DialogContent>
          </Dialog>}
          {children && (
            <div className="flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 