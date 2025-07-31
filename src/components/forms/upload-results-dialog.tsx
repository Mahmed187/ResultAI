"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { usePdfUpload } from "@/hooks/usePdfUpload"
import { FileUp } from "lucide-react"
import { toast } from "sonner"

interface UploadResultsDialogProps {
  trigger?: React.ReactNode
  patientId?: string
}

export function UploadResultsDialog({ trigger, patientId }: UploadResultsDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { uploadPdf, uploadProgress, isUploading } = usePdfUpload()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed')
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }

    try {
      const result = await uploadPdf(file)
      if (result.success) {
        toast.success('Results uploaded and analyzed successfully')
        setFile(null)
        setIsOpen(false)
        
        // Optionally refresh the page or update the data
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      } else {
        toast.error(result.error || 'Failed to upload results')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('An error occurred while uploading')
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setFile(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          onClick={() => setIsOpen(true)}
        >
          <FileUp className="mr-2 h-5 w-5" />
          Upload File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Medical Report</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">Select PDF File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress.progress} />
              <p className="text-sm text-muted-foreground">
                {uploadProgress.stage === 'validating' && 'Validating file...'}
                {uploadProgress.stage === 'uploading' && 'Uploading file...'}
                {uploadProgress.stage === 'analyzing' && 'Analyzing results...'}
                {uploadProgress.stage === 'complete' && 'Upload complete!'}
                {uploadProgress.stage === 'error' && 'Upload failed'}
              </p>
            </div>
          )}
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload & Analyze'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 