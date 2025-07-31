"use client"

import { Button } from "@/components/ui/button"
import { EnhancedHeader } from "@/components/layout/enhanced-header"
import { useState } from "react"
import { FileUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const pathologyTests = [
  {
    id: 1,
    test: "Complete Blood Count",
    date: "2024-03-15",
    status: "normal",
    value: "Within Range",
    details: {
      hemoglobin: "14.2 g/dL",
      whiteBloodCells: "7.5 x10^9/L",
      platelets: "250 x10^9/L"
    }
  },
  {
    id: 2,
    test: "Lipid Panel",
    date: "2024-03-15",
    status: "normal",
    value: "Within Range",
    details: {
      totalCholesterol: "180 mg/dL",
      hdl: "55 mg/dL",
      ldl: "100 mg/dL",
      triglycerides: "120 mg/dL"
    }
  },
  {
    id: 3,
    test: "Glucose",
    date: "2024-03-15",
    status: "normal",
    value: "Within Range",
    details: {
      fastingGlucose: "95 mg/dL",
      hba1c: "5.4%"
    }
  }
]

export default function PathologyPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log("Searching pathology results for:", query)
    // Implement search logic here
  }

  const filteredTests = pathologyTests.filter(test => 
    searchQuery === "" || 
    test.test.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-screen">
      <EnhancedHeader 
        title="Pathology Results" 
        onSearch={handleSearch}
      >
        <Button variant="outline">
          <FileUp className="mr-2 h-5 w-5" />
          Upload Results
        </Button>
      </EnhancedHeader>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Pathology Results</h1>
          <p className="text-muted-foreground">
            View and manage pathology test results.
            {searchQuery && <span className="ml-2 text-primary">Searching for: "{searchQuery}"</span>}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {filteredTests.map((test) => (
            <div key={test.id} className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{test.test}</h3>
                <Badge variant="outline">{test.status}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date: {test.date}</p>
                  <p className="text-sm text-muted-foreground mt-2">Overall Status: {test.value}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Test Details</h4>
                  <div className="space-y-2">
                    {Object.entries(test.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
} 