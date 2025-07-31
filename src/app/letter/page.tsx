'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Download, Printer } from 'lucide-react'

interface AnalysisData {
  patientDetails: {
    nhsNumber: string
    name: string
    dateOfBirth: string
    gp: string
  }
  testResults: Array<{
    testName: string
    value: string
    unit: string
    referenceRange: string
    status: string
    meaning: string
    description: string
  }>
  doctorsLetter: string
}

export default function LetterPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalysisData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/results/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch results')
        const result = await response.json()
        setData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load letter')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (!data) return

    const element = document.createElement('a')
    const file = new Blob([data.doctorsLetter], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `medical-letter-${data.patientDetails.nhsNumber}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p>No letter data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-end gap-4 mb-6 print:hidden">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button onClick={handleDownload} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardContent className="pt-6">
          <div className="whitespace-pre-wrap font-serif">
            {data.doctorsLetter}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 print:hidden">
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.testResults.map((test, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <h3 className="font-semibold">{test.testName}</h3>
                <p className="text-sm text-gray-600">
                  Result: {test.value} {test.unit}
                </p>
                <p className="text-sm text-gray-600">
                  Reference Range: {test.referenceRange}
                </p>
                <p className="text-sm text-gray-600">Status: {test.status}</p>
                <p className="text-sm text-gray-600">Meaning: {test.meaning}</p>
                <p className="text-sm text-gray-600">
                  Description: {test.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 