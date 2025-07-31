import React, { useContext, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface PageHeaderContextType {
  title: string
  setTitle: (title: string) => void
  headerContent: React.ReactNode
  setHeaderContent: (content: React.ReactNode) => void
}

const PageHeaderContext = React.createContext<PageHeaderContextType | undefined>(undefined)

export const usePageHeader = () => {
  const context = useContext(PageHeaderContext)
  if (!context) {
    throw new Error('usePageHeader must be used within a PageHeaderProvider')
  }
  return context
}

// URL to title mapping
const urlToTitleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/home': 'Home',
  '/patients': 'Patients',
  '/results': 'Results',
  '/results/pathology': 'Pathology Results',
  '/results/radiology': 'Radiology Results',
  '/results/laboratory': 'Laboratory Results',
  '/upload': 'Upload Results',
  '/settings': 'Settings',
  '/profile': 'Profile',
}

// Function to generate title from URL
const generateTitleFromUrl = (pathname: string): string => {
  // Check exact matches first
  if (urlToTitleMap[pathname]) {
    return urlToTitleMap[pathname]
  }
  
  // Handle dynamic routes
  if (pathname.startsWith('/patient/')) {
    return 'Patient Details'
  }
  
  if (pathname.startsWith('/results/')) {
    const segment = pathname.split('/')[2]
    if (segment) {
      return `${segment.charAt(0).toUpperCase() + segment.slice(1)} Results`
    }
  }
  
  // Handle nested routes
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1]
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ')
  }
  
  return 'Dashboard'
}

export const useAutoPageTitle = () => {
  const pathname = usePathname()
  const { setTitle } = usePageHeader()
  const currentPathRef = useRef<string>('')
  
  useEffect(() => {
    if (currentPathRef.current !== pathname) {
      currentPathRef.current = pathname
      const title = generateTitleFromUrl(pathname)
      setTitle(title)
    }
  }, [pathname, setTitle])
}

export const useSetPageHeader = (title: string) => {
  const { setTitle } = usePageHeader()
  const currentTitleRef = useRef<string>('')
  
  useEffect(() => {
    if (currentTitleRef.current !== title) {
      currentTitleRef.current = title
      setTitle(title)
    }
    
    // Cleanup when component unmounts
    return () => {
      if (currentTitleRef.current === title) {
        setTitle('Dashboard')
      }
    }
  }, [title, setTitle])
}

export const useSetHeaderContent = (content: React.ReactNode) => {
  const { setHeaderContent } = usePageHeader()
  const contentRef = useRef<React.ReactNode>(null)
  
  useEffect(() => {
    if (contentRef.current !== content) {
      contentRef.current = content
      setHeaderContent(content)
    }
    
    // Cleanup when component unmounts
    return () => {
      if (contentRef.current === content) {
        setHeaderContent(null)
      }
    }
  }, [content, setHeaderContent])
}

export { PageHeaderContext } 