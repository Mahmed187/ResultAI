import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface UploadProgress {
  stage: 'idle' | 'validating' | 'extracting' | 'analyzing' | 'saving' | 'complete' | 'error'
  progress: number
  message?: string
}

interface UploadResult {
  success: boolean
  error?: string
  data?: any
}

interface PatientDetails {
  nhsNumber: string | null;
  name: string | null;
  dateOfBirth: string | null;
  gp: string | null;
  sampleId: string | null;
}

interface TestResult {
  testName: string;
  value: string | null;
  unit: string | null;
  referenceRange: string | null;
  status: string | null;
  meaning: string | null;
}

interface ParsedPathologyReport {
  patientDetails: PatientDetails;
  testResults: TestResult[];
}

export function usePdfUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    stage: 'idle',
    progress: 0,
  })
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  const uploadPdf = async (file: File): Promise<UploadResult> => {
    setIsUploading(true)
    setUploadProgress({ 
      stage: 'validating', 
      progress: 5,
      message: 'Validating PDF file...'
    })

    try {
      // Step 1: Extract PDF text and get structured data
      console.log('📄 Starting PDF text extraction...')
      const formData = new FormData()
      formData.append('pdf', file)

      setUploadProgress({ 
        stage: 'extracting', 
        progress: 20,
        message: 'Extracting text from PDF...'
      })

      const pdfTextResponse = await fetch('/api/extract-pdf-text', {
        method: 'POST',
        body: formData,
      })

      if (!pdfTextResponse.ok) {
        const errorData = await pdfTextResponse.json()
        throw new Error(errorData.error || 'Failed to extract PDF text')
      }

      const pdfTextResult = await pdfTextResponse.json()
      console.log('✅ PDF text extraction completed')

      // Validate the extracted data
      if (!pdfTextResult.success || !pdfTextResult.parsedData) {
        throw new Error('Failed to parse PDF content')
      }

      const parsedData: ParsedPathologyReport = pdfTextResult.parsedData
      const { patientDetails, testResults } = parsedData

      // Validate required fields
      if (!patientDetails.sampleId) {
        throw new Error('Sample ID not found in the PDF')
      }

      if (!patientDetails.nhsNumber) {
        throw new Error('NHS Number not found in the PDF')
      }

      if (!patientDetails.name) {
        throw new Error('Patient name not found in the PDF')
      }

      if (!testResults || testResults.length === 0) {
        throw new Error('No test results found in the PDF')
      }

      console.log(`📊 Found ${testResults.length} test results for sample: ${patientDetails.sampleId}`)

      setUploadProgress({ 
        stage: 'analyzing', 
        progress: 50,
        message: 'Processing test results with AI...'
      })

      // Step 2: Send structured data to the optimized analyzer
      console.log('🤖 Starting AI analysis...')
      const analyzerPayload = {
        patientDetails: {
          nhsNumber: patientDetails.nhsNumber,
          name: patientDetails.name,
          dateOfBirth: patientDetails.dateOfBirth || 'Not specified',
          gp: patientDetails.gp || 'Not specified',
          sampleId: patientDetails.sampleId
        },
        plainText: pdfTextResult.plainText || JSON.stringify(parsedData, null, 2),
        sampleId: patientDetails.sampleId,
        testResults: testResults // Include original test results for reference
      }

      setUploadProgress({ 
        stage: 'saving', 
        progress: 75,
        message: 'Analyzing results and generating report...'
      })

      const analyzerResponse = await fetch('/api/result-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyzerPayload),
      })

      if (!analyzerResponse.ok) {
        const errorData = await analyzerResponse.json()
        
        // Handle specific error cases
        if (analyzerResponse.status === 409) {
          throw new Error(`This report has already been processed. ${errorData.error}`)
        }
        
        throw new Error(errorData.error || 'Failed to analyze the report')
      }

      const analyzerResult = await analyzerResponse.json()
      console.log('✅ AI analysis completed successfully')

      setUploadProgress({ 
        stage: 'complete', 
        progress: 100,
        message: 'Analysis completed successfully!'
      })

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patient', patientDetails.nhsNumber] })

      // Navigate to patients page if not already there
      // if (pathname !== '/patients') {
      //   console.log('🔄 Redirecting to patients page...')
      //   router.push('/patients')
      // } else {
      //   router.refresh()
      // }

      return {
        success: true,
        data: {
          ...analyzerResult.data,
          sampleId: patientDetails.sampleId,
          extractedData: parsedData,
          processingTime: analyzerResult.meta?.processingTime,
          originalFileName: file.name,
          fileSize: file.size,
        },
      }

    } catch (error) {
      console.error('❌ Upload error:', error)
      
      let errorMessage = 'An unknown error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
      }

      setUploadProgress({ 
        stage: 'error', 
        progress: 0,
        message: errorMessage
      })

      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsUploading(false)
    }
  }

  const resetProgress = () => {
    setUploadProgress({
      stage: 'idle',
      progress: 0,
    })
  }

  return {
    uploadPdf,
    uploadProgress,
    isUploading,
    resetProgress,
  }
}