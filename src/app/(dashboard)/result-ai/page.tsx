'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Sparkles, Brain, Zap, CheckCircle, Download, Eye, X, AlertTriangle, Loader2, Plus, Send, Clock, MoreHorizontal } from 'lucide-react';

// TypeScript Interfaces
interface PatientDetails {
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
  status: 'Normal' | 'High' | 'Low' | 'Critical';
  meaning: string;
  description?: string;
}

interface AnalysisResult {
  patientDetails: PatientDetails;
  testResults: TestResult[];
  doctorsLetter: string;
  letterId?: string;
  meta?: {
    model: string;
    timestamp: string;
  };
}

interface UploadedFile {
  id: string;
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'analyzing' | 'completed' | 'error';
  uploadProgress: number;
  error?: string;
  result?: AnalysisResult;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface ProcessingStep {
  type: 'upload' | 'analyze';
  fileId: string;
  fileName: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  message: string;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const AIAnalyzer: React.FC = () => {
 const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep | null>(null);
  const [completedResults, setCompletedResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [thinkingMessage, setThinkingMessage] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  const mockResults: AnalysisResult[] = [
    {
      patientDetails: {
        nhsNumber: "123 456 7890",
        name: "John Doe",
        dateOfBirth: "15/08/1985",
        gp: "Dr. Smith, NHS Health Centre"
      },
      testResults: [
        {
          testName: "Haemoglobin (Hb)",
          value: "14.2",
          unit: "g/dL",
          referenceRange: "13.0 - 17.0 g/dL",
          status: "Normal",
          meaning: "Haemoglobin level is within the normal range, indicating no risk of anemia."
        },
        {
          testName: "White Blood Cells (WBC)",
          value: "6.8",
          unit: "×10⁹/L",
          referenceRange: "4.0 - 11.0 ×10⁹/L",
          status: "Normal",
          meaning: "White blood cell count is normal, suggesting a healthy immune system."
        },
        {
          testName: "Platelets",
          value: "250",
          unit: "×10⁹/L",
          referenceRange: "150 - 400 ×10⁹/L",
          status: "Normal",
          meaning: "Platelet level is normal, indicating proper blood clotting function."
        },
        {
          testName: "Creatinine",
          value: "90",
          unit: "μmol/L",
          referenceRange: "60 - 110 μmol/L",
          status: "Normal",
          meaning: "Creatinine level is normal, indicating good kidney function."
        }
      ],
      doctorsLetter: `
        <div class="letterhead">
          <h2>Sunnydale Medical Center</h2>
          <p>123 Health Street, Sunnydale<br>Sunnydale, AB1 2CD, United Kingdom<br>
          Phone: (01234) 567890<br>Email: contact@sunnydalemedical.com</p>
        </div>
        <div class="letter-content">
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Re:</strong> John Doe<br><strong>NHS Number:</strong> 123 456 7890<br><strong>Date of Birth:</strong> 15/08/1985</p>
          <p>Dear John Doe,</p>
          <p>Thank you for attending your recent health assessment. Below is a summary of your test results:</p>
          
          <h3>Test Results Summary:</h3>
          <table class="results-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Result</th>
                <th>Reference Range</th>
                <th>Status</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Haemoglobin (Hb)</td>
                <td>14.2 g/dL</td>
                <td>13.0 - 17.0 g/dL</td>
                <td>Normal</td>
                <td>Haemoglobin level is within the normal range, indicating no risk of anemia.</td>
              </tr>
              <tr>
                <td>White Blood Cells (WBC)</td>
                <td>6.8 ×10⁹/L</td>
                <td>4.0 - 11.0 ×10⁹/L</td>
                <td>Normal</td>
                <td>White blood cell count is normal, suggesting a healthy immune system.</td>
              </tr>
              <tr>
                <td>Platelets</td>
                <td>250 ×10⁹/L</td>
                <td>150 - 400 ×10⁹/L</td>
                <td>Normal</td>
                <td>Platelet level is normal, indicating proper blood clotting function.</td>
              </tr>
              <tr>
                <td>Creatinine</td>
                <td>90 μmol/L</td>
                <td>60 - 110 μmol/L</td>
                <td>Normal</td>
                <td>Creatinine level is normal, indicating good kidney function.</td>
              </tr>
            </tbody>
          </table>
          
          <h3>Overall Assessment:</h3>
          <p>All test results are within normal limits indicating good general health. Routine monitoring is recommended to maintain this status.</p>
          
          <h3>Recommendations:</h3>
          <ul>
            <li>No immediate follow-up required.</li>
            <li>Maintain a balanced diet and regular exercise regimen to sustain health.</li>
            <li>Routine check-ups as advised by the GP.</li>
          </ul>
          
          <p>Should you have any questions or concerns about your results, please don't hesitate to contact us.</p>
          
          <p>Yours sincerely,<br><br>
          Dr. Alice Johnson<br>
          Consultant Physician<br>
          Phone: (01234) 567891<br>
          Email: alice.johnson@sunnydalemedical.com</p>
        </div>
      `
    }
  ];

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
          setError(`Maximum ${MAX_FILES} files allowed`);
          break;
        }

        const validation = validateFile(file);
        if (!validation.isValid) {
          setError(`${file.name}: ${validation.error}`);
          continue;
        }

        const isDuplicate = files.some(existingFile => 
          existingFile.name === file.name && existingFile.size === file.size
        );

        if (isDuplicate) {
          setError(`File "${file.name}" is already uploaded`);
          continue;
        }

        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        setError(null);
      }
    } catch (err) {
      setError('Failed to process uploaded files');
      console.error('File upload error:', err);
    }
  }, [files]);

  // Handle plus button click
  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  // Simulate file upload to GPT (instant)
  const simulateUpload = async (file: UploadedFile): Promise<void> => {
    setFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { ...f, uploadStatus: 'uploaded', uploadProgress: 100 }
        : f
    ));
  };

  // Simulate analysis with thinking messages
  const simulateAnalysis = async (file: UploadedFile): Promise<AnalysisResult> => {
    const thinkingMessages = [
      'Reading medical report...',
      'Extracting patient information...',
      'Analyzing test results...',
      'Interpreting clinical data...',
      'Generating medical insights...',
      'Creating patient letter...'
    ];

    return new Promise((resolve) => {
      let messageIndex = 0;
      
      const messageInterval = setInterval(() => {
        if (messageIndex < thinkingMessages.length) {
          setThinkingMessage(thinkingMessages[messageIndex]);
          messageIndex++;
        }
      }, 300);

      setTimeout(() => {
        clearInterval(messageInterval);
        setThinkingMessage('');
        const result = {
          ...mockResults[0],
          patientDetails: {
            ...mockResults[0].patientDetails,
            name: `Patient from ${file.name ? file.name.replace('.pdf', '') : 'Unknown File'}`
          }
        };
        resolve(result);
      }, 2000); // 2 seconds total
    });
  };

  // Start processing all files (instant)
  const startProcessing = async () => {
    if (files.length === 0) {
      setError('Please upload at least one PDF file');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setCompletedResults([]);

    try {
      // Step 1: Upload all files to GPT (instant)
      for (const file of files) {
        setCurrentStep({
          type: 'upload',
          fileId: file.id,
          fileName: file.name,
          status: 'active',
          message: `Uploading ${file.name} to AI server...`
        });

        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, uploadStatus: 'uploading' }
            : f
        ));

        await simulateUpload(file);
      }

      // Step 2: Analyze each file (instant)
      for (const file of files) {
        setCurrentStep({
          type: 'analyze',
          fileId: file.id,
          fileName: file.name,
          status: 'active',
          message: `Analyzing ${file.name}...`
        });

        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, uploadStatus: 'analyzing' }
            : f
        ));

        const result = await simulateAnalysis(file);

        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, uploadStatus: 'completed', result }
            : f
        ));

        setCompletedResults(prev => [...prev, result]);
      }

      setCurrentStep(null);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Processing failed');
      setCurrentStep(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove file
  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    setError(null);
  }, []);

  // Reset everything
  const resetAnalysis = useCallback(() => {
    setFiles([]);
    setCompletedResults([]);
    setCurrentStep(null);
    setError(null);
    setIsProcessing(false);
    setThinkingMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);
  return (
    <div className="relative w-full h-full overflow-y-hidden">
      {/* Main Content Area */}
      <div className="relative z-10 h-full flex flex-col"> 

        {/* Content Area */}
        <div className="flex-1 overflow-y-scroll px-4 pb-32">
          <div className="w-full h-full mx-auto space-y-4 py-4">
            
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-red-800 font-semibold mb-1">Error</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
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
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-semibold mb-1">{currentStep.message}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {currentStep.type === 'upload' ? 'Securely uploading to AI servers' : 'AI is processing your medical data'}
                    </p>
                    
                    {thinkingMessage && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm italic">{thinkingMessage}</span>
                      </div>
                    )}
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
                    <h3 className="text-green-800 font-semibold">Analysis Complete - Report {index + 1}</h3>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-purple-500" />
                    Patient Information
                  </h3>
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
                    Test Results
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
                                test.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                  <p>✓ Secure direct upload to AI servers</p>
                  <p>✓ Real-time processing updates</p>
                  <p>✓ Patient-friendly medical letters</p>
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
              <div className="flex flex-wrap  gap-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border">
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
                          {file.uploadStatus === 'uploading' && (
                            <div className="flex-1 max-w-20">
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div
                                  className="h-1 bg-blue-500 rounded-full transition-all duration-300"
                                  style={{ width: `${file.uploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            file.uploadStatus === 'pending' ? 'bg-gray-200 text-gray-600' :
                            file.uploadStatus === 'uploading' ? 'bg-blue-100 text-blue-700' :
                            file.uploadStatus === 'uploaded' ? 'bg-green-100 text-green-700' :
                            file.uploadStatus === 'analyzing' ? 'bg-purple-100 text-purple-700' :
                            file.uploadStatus === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {file.uploadStatus === 'pending' ? 'Ready' :
                             file.uploadStatus === 'uploading' ? 'Uploading' :
                             file.uploadStatus === 'uploaded' ? 'Uploaded' :
                             file.uploadStatus === 'analyzing' ? 'Analyzing' :
                             file.uploadStatus === 'completed' ? 'Complete' : 'Error'}
                          </span>
                        </div>
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
              
              { !isProcessing && (
                <button
                  onClick={startProcessing}
                  disabled={files?.length === 0}
                  className={"w-10 h-10 rounded-full flex items-center justify-center text-white bg-purple-500 hover:bg-purple-600 transition-colors disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"}
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