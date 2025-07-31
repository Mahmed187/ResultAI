import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface UploadProgress {
  stage: 'idle' | 'validating' | 'uploading' | 'analyzing' | 'complete' | 'error'
  progress: number
}

interface UploadResult {
  success: boolean
  error?: string
  data?: any
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
    setUploadProgress({ stage: 'validating', progress: 0 })

    try {
      const formData = new FormData()
      formData.append('pdf', file)

      setUploadProgress({ stage: 'uploading', progress: 30 })

      const response = await fetch('/api/report-analizer', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze file')
      }

      setUploadProgress({ stage: 'analyzing', progress: 60 })

      const result = await response.json()

      setUploadProgress({ stage: 'complete', progress: 100 })

      // Invalidate patient data query if applicable
      queryClient.invalidateQueries({ queryKey: ['patients'] })

      if (pathname !== '/patients') {
        router.push('/patients')
      } else {
        router.refresh()
      }

      return {
        success: true,
        data: result.data,
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress({ stage: 'error', progress: 0 })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }
    } finally {
      setIsUploading(false)
    }
  }

  return {
    uploadPdf,
    uploadProgress,
    isUploading,
  }
}
