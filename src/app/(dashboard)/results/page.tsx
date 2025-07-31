"use client"

import { Button } from "@/components/ui/button"
import { EnhancedHeader } from "@/components/layout/enhanced-header"
import { useState } from "react"
import { UploadResultsDialog } from "@/components/forms/upload-results-dialog"

export default function ResultsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log("Searching lab results for:", query)
    // Implement search logic here
  }

  return (
    <div className="flex flex-col min-h-screen">
      <EnhancedHeader 
        title="Lab Results" 
        onSearch={handleSearch}
      >
        <UploadResultsDialog />
      </EnhancedHeader>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Lab Results</h1>
          <p className="text-muted-foreground">
            View and manage laboratory test results and reports.
            {searchQuery && <span className="ml-2 text-primary">Searching for: "{searchQuery}"</span>}
          </p>
        </div>

        <div className="mt-6 bg-card rounded-lg border p-6">
          <p className="text-muted-foreground">Select a category from the navigation menu above to view specific test results.</p>
        </div>
      </main>
    </div>
  )
} 