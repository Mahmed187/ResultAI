"use client"

import { Button } from "@/components/ui/button" 
import { useState } from "react"
import { Eye } from "lucide-react"
import { useRouter } from "next/navigation" 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table" 
import { useQuery } from "@tanstack/react-query"

interface Patient {
  nhsNumber:any
  id: string
  name: string
  dateOfBirth: string
  gpName: string
}

// ✅ Fetcher function
const fetchPatients = async (): Promise<Patient[]> => {
  const res = await fetch("/api/patients")
  if (!res.ok) throw new Error("Failed to fetch patients")
  return res.json()
}



export default function PatientsPage() { 
  const [searchQuery, setSearchQuery] = useState("") 
  const router = useRouter()

   // ✅ Use React Query
  const {
    data: patients = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: fetchPatients,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  })

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error instanceof Error ? error.message : String(error)}</div>

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Patient Records</h1>
        <p className="text-muted-foreground text-sm">
          Manage patient records and information.
          {searchQuery && <span className="ml-2 text-primary">Searching for: "{searchQuery}"</span>}
        </p>
      </div>
 
      <div className="bg-card rounded-lg shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">NHS Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[120px]">Date of Birth</TableHead>
                <TableHead>GP</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No patients found matching your search.' : 'No patients found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{patient.nhsNumber}</TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{new Date(patient.dateOfBirth).toLocaleDateString()}</TableCell>
                    <TableCell>{patient.gpName}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          console.log('Eye icon clicked for patient:', patient.id)
                          const url = `/patient/${encodeURIComponent(patient.id)}`
                          console.log('Navigating to:', url)
                          router.push(url)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
} 