'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Sparkles, Brain, Zap, CheckCircle, Download, Eye, X, AlertTriangle, Loader2, Plus, Send, Clock, MoreHorizontal } from 'lucide-react';
import { usePdfUpload } from '@/hooks/usePdfUpload';
import Link from 'next/link';
 
// TypeScript Interfaces
interface PatientDetails {
  id: any;
  nhsNumber: string;
  name: string;
  dateOfBirth: string;
  gp: string;
}

interface TestResult {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  meaning: string;
  description?: string;
}

interface AnalysisResult {
  patientDetails: PatientDetails;
  testResults: TestResult[];
  doctorsLetter: string;
  letterId?: string;
  sampleId?: string;
  isNewPatient?: boolean;
  isNewLetter?: boolean;
  newTestResultsCount?: number;
  meta?: {
    model: string;
    timestamp: string;
    processingTime?: number;
  };
}

interface UploadedFile {
  id: string;
  file: File;
  uploadStatus: 'pending' | 'uploading' | 'analyzing' | 'completed' | 'error';
  uploadProgress: number;
  error?: string;
  result?: AnalysisResult;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface ProcessingStep {
  fileId: string;
  fileName: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  message: string;
  stage: string;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const AIAnalyzer: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep | null>(null);
  const [completedResults, setCompletedResults] = useState<AnalysisResult[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [processingQueue, setProcessingQueue] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the real PDF upload hook
  const { uploadPdf, uploadProgress, isUploading, resetProgress } = usePdfUpload();

  // File validation
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (file.type !== 'application/pdf') {
      return { isValid: false, error: 'Only PDF files are allowed' };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: 'File size must be less than 10MB' };
    }
    if (file.size === 0) {
      return { isValid: false, error: 'File appears to be empty' };
    }
    return { isValid: true };
  };

  // Handle file upload
  const handleFileUpload = useCallback((uploadedFiles: FileList | File[]) => {
    try {
      const fileArray = Array.from(uploadedFiles);
      const newFiles: UploadedFile[] = [];

      for (const file of fileArray) {
        if (files.length + newFiles.length >= MAX_FILES) {
          setGlobalError(`Maximum ${MAX_FILES} files allowed`);
          break;
        }

        const validation = validateFile(file);
        if (!validation.isValid) {
          setGlobalError(`${file.name}: ${validation.error}`);
          continue;
        }

        const isDuplicate = files.some(existingFile => 
          existingFile.name === file.name && existingFile.size === file.size
        );

        if (isDuplicate) {
          setGlobalError(`File "${file.name}" is already uploaded`);
          continue;
        }

        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file: file,
          uploadStatus: 'pending',
          uploadProgress: 0,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        };
        newFiles.push(uploadedFile);
      }

      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
        setGlobalError(null);
      }
    } catch (err) {
      setGlobalError('Failed to process uploaded files');
      console.error('File upload error:', err);
    }
  }, [files]);

  // Handle plus button click
  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  // Map upload progress stage to detailed user-friendly messages
  const getStageDetails = (stage: string, fileName: string) => {
    switch (stage) {
      case 'validating':
        return {
          title: `📄 Got the file: ${fileName}`,
          message: 'Validating PDF format and checking file integrity...',
          detail: 'Ensuring the file is a valid medical report'
        };
      case 'extracting':
        return {
          title: `🔍 Extracting data from ${fileName}`,
          message: 'Reading PDF content and extracting patient information and test results...',
          detail: 'AI is parsing the medical report structure'
        };
      case 'analyzing':
        return {
          title: `🤖 Using ResultAI to interpret the data`,
          message: 'ResultAI is analysing test results and generating clinical interpretations...',
          detail: 'AI is determining status levels and creating meaningful explanations'
        };
      case 'saving':
        return {
          title: `💾 Processing and saving data to database`,
          message: 'Generating professional medical letter and storing patient information...',
          detail: 'Creating doctor\'s letter and saving test results securely'
        };
      case 'complete':
        return {
          title: `✅ Report successfully analysed!`,
          message: 'Medical report processing completed successfully',
          detail: 'Patient data, test results, and medical letter are ready'
        };
      case 'error':
        return {
          title: `❌ Error processing ${fileName}`,
          message: 'Something went wrong during processing',
          detail: 'Please check the file and try again'
        };
      default:
        return {
          title: `⚡ Processing ${fileName}...`,
          message: 'Working on your medical report...',
          detail: 'Please wait while we analyse your data'
        };
    }
  };

  // Process a single file with the real hook
  const processFile = async (uploadedFile: UploadedFile): Promise<void> => {
    try {
      // Update file status to uploading
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, uploadStatus: 'uploading', uploadProgress: 0 }
          : f
      ));

      // Set current step with detailed information
      const stageDetails = getStageDetails(uploadProgress.stage, uploadedFile.name);
      setCurrentStep({
        fileId: uploadedFile.id,
        fileName: uploadedFile.name,
        status: 'active',
        message: stageDetails.title,
        stage: uploadProgress.stage
      });

      console.log(`🚀 Starting real upload for: ${uploadedFile.name}`);
      
      // Call the real upload function
      const result = await uploadPdf(uploadedFile.file);

      if (result.success && result.data) {
        console.log('✅ Upload successful:', result.data);

        // Transform the result to match our interface
        const analysisResult: AnalysisResult = {
          patientDetails: {
            nhsNumber: result.data.patient?.nhsNumber || 'N/A',
            name: result.data.patient?.name || 'Unknown Patient',
            dateOfBirth: result.data.patient?.dateOfBirth
              ? new Date(result.data.patient.dateOfBirth).toLocaleDateString('en-GB')
              : 'N/A',
            gp: result.data.patient?.gpName || 'N/A',
            id: result.data.patient?.id
          },
          testResults: result.data.testResults?.map((test: any) => ({
            testName: test.testName || 'Unknown Test',
            value: test.value || 'N/A',
            unit: test.unit || '',
            referenceRange: test.referenceRange || 'N/A',
            status: test.status || 'NORMAL',
            meaning: test.meaning || 'No interpretation available'
          })) || [],
          doctorsLetter: result.data.letter?.content || '<p>No letter generated</p>',
          sampleId: result.data.sampleId,
          isNewPatient: result.data.isNewPatient,
          isNewLetter: result.data.isNewLetter,
          newTestResultsCount: result.data.newTestResultsCount,
          meta: {
            model: 'gpt-4o',
            timestamp: new Date().toISOString(),
            processingTime: result.data.processingTime
          }
        };

        // Update file status to completed
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, uploadStatus: 'completed', uploadProgress: 100, result: analysisResult }
            : f
        ));

        // Add to completed results
        setCompletedResults(prev => [...prev, analysisResult]);

        // Show completion message briefly
        setCurrentStep({
          fileId: uploadedFile.id,
          fileName: uploadedFile.name,
          status: 'completed',
          message: `✅ ${uploadedFile.name} successfully analysed!`,
          stage: 'complete'
        });

        // Clear the completion message after 2 seconds
        setTimeout(() => {
          setCurrentStep(null);
        }, 2000);

      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ Upload error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Update file status to error
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, uploadStatus: 'error', error: errorMessage }
          : f
      ));

      setGlobalError(`Failed to process ${uploadedFile.name}: ${errorMessage}`);
    }
  };

  // Start processing all files sequentially
  const startProcessing = async () => {
    if (files.length === 0) {
      setGlobalError('Please upload at least one PDF file');
      return;
    }

    setIsProcessing(true);
    setGlobalError(null);
    setCompletedResults([]);

    // Process files one by one
    for (const file of files) {
      if (file.uploadStatus === 'pending') {
        await processFile(file);
        // Add small delay between files for better UX
        if (files.indexOf(file) < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Final completion message
    if (files.length > 1) {
      setCurrentStep({
        fileId: 'batch',
        fileName: 'All Files',
        status: 'completed',
        message: `🎉 All ${files.length} files processed successfully!`,
        stage: 'complete'
      });
      
      setTimeout(() => {
        setCurrentStep(null);
      }, 3000);
    } else {
      // For single file, the completion message is already shown in processFile
    }

    setIsProcessing(false);
    resetProgress(); // Reset the hook's progress
  };

  // Remove file
  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    setGlobalError(null);
  }, []);

  // Reset everything
  const resetAnalysis = useCallback(() => {
    setFiles([]);
    setCompletedResults([]);
    setCurrentStep(null);
    setGlobalError(null);
    setIsProcessing(false);
    setProcessingQueue([]);
    resetProgress();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [resetProgress]);

  // Update progress when hook progress changes
  React.useEffect(() => {
    if (isUploading && currentStep) {
      const stageDetails = getStageDetails(uploadProgress.stage, currentStep.fileName);
      setCurrentStep(prev => prev ? {
        ...prev,
        message: stageDetails.title,
        stage: uploadProgress.stage
      } : null);

      // Update file progress
      setFiles(prev => prev.map(f => 
        f.id === currentStep.fileId
          ? { 
              ...f, 
              uploadProgress: uploadProgress.progress,
              uploadStatus: uploadProgress.stage === 'complete' ? 'completed' : 
                           uploadProgress.stage === 'error' ? 'error' : 'analyzing'
            }
          : f
      ));
    }
  }, [uploadProgress, isUploading, currentStep]);

  return (
    <div className="relative w-full h-full overflow-y-hidden bg-gray-50">
      {/* Main Content Area */}
      <div className="relative z-10 h-full flex flex-col"> 

        {/* Content Area */}
        <div className="flex-1 overflow-y-scroll px-4 pb-32">
          <div className="w-full h-full mx-auto space-y-4 py-4">
            
            {/* Error Display */}
            {globalError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-red-800 font-semibold mb-1">Error</h4>
                  <p className="text-red-700 text-sm">{globalError}</p>
                </div>
                <button
                  onClick={() => setGlobalError(null)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Processing Status */}
            {currentStep && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : uploadProgress.stage === 'complete' ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : uploadProgress.stage === 'error' ? (
                      <AlertTriangle className="w-6 h-6 text-white bg-red-500 rounded-full" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-bold text-lg mb-2">{currentStep.message}</h3>
                    
                    {(() => {
                      const details = getStageDetails(uploadProgress.stage, currentStep.fileName);
                      return (
                        <div className="space-y-2">
                          <p className="text-gray-700 text-base font-medium">
                            {details.message}
                          </p>
                          <p className="text-gray-600 text-sm italic">
                            {details.detail}
                          </p>
                        </div>
                      );
                    })()}
                    
                    {/* Custom message from hook if available */}
                    {uploadProgress.message && uploadProgress.message !== getStageDetails(uploadProgress.stage, currentStep.fileName).message && (
                      <p className="text-purple-600 text-sm mt-3 font-medium">
                        {uploadProgress.message}
                      </p>
                    )}
                    
                    {/* Stage completion indicators */}
                    <div className="mt-4 space-y-2">
                      <div className={`flex items-center text-sm ${uploadProgress.progress > 5 ? 'text-green-600' : 'text-gray-400'}`}>
                        {uploadProgress.progress > 5 ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <div className="w-4 h-4 mr-2 border-2 border-gray-300 rounded-full"></div>
                        )}
                        {uploadProgress.progress > 5 ? 'PDF validation completed' : 'Validating PDF...'}
                      </div>
                      
                      <div className={`flex items-center text-sm ${uploadProgress.progress > 20 ? 'text-green-600' : uploadProgress.stage === 'extracting' ? 'text-purple-600' : 'text-gray-400'}`}>
                        {uploadProgress.progress > 20 ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : uploadProgress.stage === 'extracting' ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <div className="w-4 h-4 mr-2 border-2 border-gray-300 rounded-full"></div>
                        )}
                        {uploadProgress.progress > 20 ? 'Data extraction completed' : uploadProgress.stage === 'extracting' ? 'Extracting patient data...' : 'Extract patient data'}
                      </div>
                      
                      <div className={`flex items-center text-sm ${uploadProgress.progress > 50 ? 'text-green-600' : uploadProgress.stage === 'analyzing' ? 'text-purple-600' : 'text-gray-400'}`}>
                        {uploadProgress.progress > 50 ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : uploadProgress.stage === 'analyzing' ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <div className="w-4 h-4 mr-2 border-2 border-gray-300 rounded-full"></div>
                        )}
                        {uploadProgress.progress > 50 ? 'ResultAI analysis completed' : uploadProgress.stage === 'analyzing' ? 'ResultAI analysing data...' : 'Analyse with ResultAI'}
                      </div>
                      
                      <div className={`flex items-center text-sm ${uploadProgress.progress > 75 ? 'text-green-600' : uploadProgress.stage === 'saving' ? 'text-purple-600' : 'text-gray-400'}`}>
                        {uploadProgress.progress > 75 ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : uploadProgress.stage === 'saving' ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <div className="w-4 h-4 mr-2 border-2 border-gray-300 rounded-full"></div>
                        )}
                        {uploadProgress.progress > 75 ? 'Data saved to database' : uploadProgress.stage === 'saving' ? 'Analysing the report...' : 'Save to database'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {completedResults.map((result, index) => (
              <div key={index} className="space-y-4">
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="text-green-800 font-semibold">Analysis Complete - Report {index + 1}</h3>
                      {result.sampleId && (
                        <p className="text-green-700 text-sm">Sample ID: {result.sampleId}</p>
                      )}
                      {result.isNewPatient && (
                        <p className="text-green-700 text-sm">✓ New patient created</p>
                      )}
                      {result.newTestResultsCount && (
                        <p className="text-green-700 text-sm">✓ {result.newTestResultsCount} test results processed</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                 <div className='flex justify-between items-center w-full mb-3'>
                   <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-purple-500" />
                    Patient Information
                  </h3>
                  <Link href={`/patient/${result?.patientDetails?.id}`} className='px-4 py-2.5 rounded-lg shadow border border-gray-100 bg-purple-500 text-white font-semibold text-sm'>View Patient</Link>
                 </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <h4 className="text-xs font-medium text-gray-600 mb-1">NHS Number</h4>
                      <p className="text-base font-semibold text-gray-900">{result.patientDetails.nhsNumber}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <h4 className="text-xs font-medium text-gray-600 mb-1">Full Name</h4>
                      <p className="text-base font-semibold text-gray-900">{result.patientDetails.name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <h4 className="text-xs font-medium text-gray-600 mb-1">Date of Birth</h4>
                      <p className="text-base font-semibold text-gray-900">{result.patientDetails.dateOfBirth}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <h4 className="text-xs font-medium text-gray-600 mb-1">GP</h4>
                      <p className="text-base font-semibold text-gray-900">{result.patientDetails.gp}</p>
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-500" />
                    Test Results ({result.testResults.length} tests)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-gray-600 font-semibold">Test Name</th>
                          <th className="text-left py-2 px-3 text-gray-600 font-semibold">Result</th>
                          <th className="text-left py-2 px-3 text-gray-600 font-semibold">Reference Range</th>
                          <th className="text-left py-2 px-3 text-gray-600 font-semibold">Status</th>
                          <th className="text-left py-2 px-3 text-gray-600 font-semibold">Meaning</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.testResults.map((test, testIndex) => (
                          <tr key={testIndex} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-2 px-3 text-gray-900 font-medium">{test.testName}</td>
                            <td className="py-2 px-3 text-gray-900">{test.value} {test.unit}</td>
                            <td className="py-2 px-3 text-gray-600">{test.referenceRange}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                test.status === 'NORMAL' ? 'bg-green-100 text-green-800' : 
                                test.status === 'HIGH' ? 'bg-red-100 text-red-800' :
                                test.status === 'LOW' ? 'bg-yellow-100 text-yellow-800' :
                                test.status === 'CRITICAL' ? 'bg-red-200 text-red-900' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {test.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-gray-600 text-xs">{test.meaning}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Doctor's Letter */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                      Generated Medical Letter
                    </h3>
                    <button className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all duration-300 text-sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 max-h-64 overflow-y-auto text-sm">
                    <div dangerouslySetInnerHTML={{ __html: result.doctorsLetter }} />
                  </div>
                  {/* {result.meta?.processingTime && (
                    <p className="text-xs text-gray-500 mt-2">
                      Processed in {result.meta.processingTime}ms using ResultAI
                    </p>
                  )} */}
                </div>
              </div>
            ))}

            {/* Empty State */}
            {!isProcessing && completedResults.length === 0 && files.length === 0 && (
              <div className="text-center py-12">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Analyze Medical Reports</h3>
                <p className="text-gray-600 mb-4">
                  Upload your PDF medical reports using the panel below
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>✓ Real AI processing with ResultAI</p>
                  <p>✓ Duplicate sample detection</p>
                  <p>✓ Professional medical letters</p>
                  <p>✓ Secure database storage</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
 
      {/* Bottom Upload Panel - Fixed */}
      <div className="fixed bottom-8 left-44 right-4 z-50">
        <div className="bg-white rounded-xl p-4 max-w-4xl mx-auto border border-gray-200 shadow">
          
          {/* Files Display Area */}
          {files.length > 0 && (
            <div className="mb-4 max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border min-w-64">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-medium truncate text-sm">{file.name}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-500 text-xs">
                            {file.size > 1024 * 1024
                              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                              : `${(file.size / 1024).toFixed(2)} KB`} 
                          </p>
                          {(file.uploadStatus === 'uploading' || file.uploadStatus === 'analyzing') && (
                            <div className="flex-1 max-w-20">
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div
                                  className="h-1 bg-purple-500 rounded-full transition-all duration-300"
                                  style={{ width: `${file.uploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            file.uploadStatus === 'pending' ? 'bg-gray-200 text-gray-600' :
                            file.uploadStatus === 'uploading' ? 'bg-blue-100 text-blue-700' :
                            file.uploadStatus === 'analyzing' ? 'bg-purple-100 text-purple-700' :
                            file.uploadStatus === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {file.uploadStatus === 'pending' ? 'Ready' :
                             file.uploadStatus === 'uploading' ? 'Processing' :
                             file.uploadStatus === 'analyzing' ? 'Analysing' :
                             file.uploadStatus === 'completed' ? 'Complete' : 'Error'}
                          </span>
                        </div>
                        {file.error && (
                          <p className="text-red-500 text-xs mt-1">{file.error}</p>
                        )}
                      </div>
                    </div>
                    {!isProcessing && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700 transition-colors ml-2 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePlusClick}
                disabled={isProcessing || files.length >= MAX_FILES}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
              
              <button className="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
                <Clock className="w-5 h-5 text-blue-500" />
              </button>

              {files.length > 0 && (
                <div className="text-gray-600 text-sm">
                  {files.length} file{files.length !== 1 ? 's' : ''} ready
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-gray-600 text-sm font-medium">ResultAI</span>
              
              {!isProcessing && completedResults.length === 0 && (
                <button
                  onClick={startProcessing}
                  disabled={files.length === 0}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-purple-500 hover:bg-purple-600 transition-colors disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
              
              {isProcessing && (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-purple-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}

              {completedResults.length > 0 && !isProcessing && (
                <button
                  onClick={resetAnalysis}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-green-500 hover:bg-green-600 transition-colors"
                  title="Reset and upload new files"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* CSS Styles for Letter */}
      <style jsx global>{`
        .letterhead h2 {
          color: #2563eb;
          margin-bottom: 1rem;
          font-size: 1.125rem;
          font-weight: 600;
        }
        .letterhead p {
          margin-bottom: 0.5rem;
          color: #666;
          font-size: 0.875rem;
          line-height: 1.4;
        }
        .letter-content h3 {
          color: #1e40af;
          margin: 1rem 0 0.5rem 0;
          font-size: 1rem;
          font-weight: 600;
        }
        .letter-content p {
          margin-bottom: 0.75rem;
          line-height: 1.5;
          font-size: 0.875rem;
          color: #374151;
        }
        .results-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.75rem 0;
          font-size: 0.75rem;
        }
        .results-table th,
        .results-table td {
          border: 1px solid #d1d5db;
          padding: 0.5rem;
          text-align: left;
        }
        .results-table th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        .results-table tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .letter-content ul {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        .letter-content li {
          margin: 0.25rem 0;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default AIAnalyzer;