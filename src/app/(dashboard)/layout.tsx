'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ThemeProvider } from '@/context/theme-context'
import { PageHeader } from '@/components/layout/page-header'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { PageHeaderContext, useAutoPageTitle } from '@/hooks/use-page-header'
import { ToastProvider } from '@/components/layout/toast-provider'
import { Brain } from 'lucide-react'

// Move QueryClient outside component to prevent recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time in v5)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Component to handle automatic page title
function AutoPageTitleHandler() {
  useAutoPageTitle()
  return null
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [title, setTitle] = useState('Dashboard')
  const [headerContent, setHeaderContent] = useState<React.ReactNode>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log("Global search for:", query)
  }

  // Hide search on patient detail pages
  const showSearch = !pathname.startsWith('/patient/')

  if (!mounted) {
    // Prevent hydration mismatch and show loading state
    return (
       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
           <div className="text-center space-y-6">
             {/* Simple Loading Spinner */}
             <div className="relative mx-auto w-16 h-16">
               <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <Brain className="w-8 h-8 text-purple-600" />
               </div>
             </div>
             
             {/* Title */}
             <div className="space-y-2">
               <h1 className="text-3xl font-bold text-purple-700">
                 ResultAI
               </h1>
               <p className="text-purple-600">
                 Loading...
               </p>
             </div>
           </div>
         </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
      <ThemeProvider defaultTheme='light' storageKey='resultai-theme'>
        <PageHeaderContext.Provider value={{ title, setTitle, headerContent, setHeaderContent }}>
          <AutoPageTitleHandler />
          <SidebarProvider defaultOpen={true} autoCollapse={true}>
            <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
              {/* Navigation with Sidebar - positioned above main in DOM */}
              <nav className="relative" role="navigation" aria-label="Main navigation">
                <AppSidebar />
              </nav>
              
              {/* Main Content Area */}
              <div className="flex flex-col flex-1 min-w-0">
                <PageHeader 
                  title={title}
                  onSearch={handleSearch}
                  showSearch={showSearch}
                >
                  {headerContent}
                </PageHeader>
                <main className="flex-1 p-0" role="main">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </PageHeaderContext.Provider>
      </ThemeProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
} 