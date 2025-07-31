 
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

// TypeScript interfaces
interface PatientDetails {
  nhsNumber: string;
  name: string;
  dateOfBirth: string;
  gp: string;
}

interface TestResult {
  testName: string;
  value: string;
  unit?: string;
  referenceRange: string;
  status: string;
  meaning: string;
}

interface ParsedAnalysis {
  patientDetails: PatientDetails;
  testResults: TestResult[];
  doctorsLetter: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    patient: any;
    letter: any;
    testResults: any[];
    isNewPatient: boolean;
    isNewLetter: boolean;
    newTestResultsCount: number;
  };
  error?: string;
  meta?: {
    model: string;
    processingTime: number;
    timestamp: string;
  };
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ANALYSIS_TIMEOUT = 60000;

// Utility: Parse date from various formats
function parseDate(dateStr: string): Date {
  try {
    const cleaned = dateStr.replace(/\s+/g, '');
    
    if (cleaned.includes('/')) {
      const parts = cleaned.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        const parsed = new Date(`${year}-${month}-${day}`);
        
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    }
    
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    
    throw new Error('Invalid date format');
  } catch (error) {
    console.warn(`Failed to parse date "${dateStr}", using current date`);
    return new Date();
  }
}

// Utility: Map status string to enum value
function mapTestStatus(status: string): 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL' {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'NORMAL': return 'NORMAL';
    case 'HIGH': return 'HIGH';
    case 'LOW': return 'LOW';
    case 'CRITICAL': return 'CRITICAL';
    default: return 'NORMAL';
  }
}

// Database Operations - Modular Functions

/**
 * Handle patient creation/retrieval based on NHS number
 */
async function handlePatient(patientDetails: PatientDetails) {
  const nhsNumber = patientDetails.nhsNumber.trim(); // Clean any whitespace
  console.log(`👤 Checking patient with NHS number: "${nhsNumber}" (length: ${nhsNumber.length})`);
  console.log(`👤 Patient details extracted:`, {
    nhsNumber: nhsNumber,
    name: patientDetails.name,
    dateOfBirth: patientDetails.dateOfBirth,
    gp: patientDetails.gp
  });
  
  // Check if patient exists by NHS number
  const existingPatient = await prisma.patient.findUnique({
    where: { nhsNumber: nhsNumber }
  });

  if (existingPatient) {
    console.log("👤 Patient already exists, using existing record");
    console.log(`👤 Existing patient ID: ${existingPatient.id}, NHS: ${existingPatient.nhsNumber}`);
    return { patient: existingPatient, isNewPatient: false };
  } else {
    console.log("👤 Creating new patient - no existing patient found");
    
    // Let's also check if there are any similar NHS numbers in the database
    const allPatients = await prisma.patient.findMany({
      select: { nhsNumber: true, name: true, id: true }
    });
    console.log(`👤 Current patients in database: ${allPatients.length}`);
    allPatients.forEach(p => {
      console.log(`   - NHS: "${p.nhsNumber}", Name: ${p.name}, ID: ${p.id}`);
    });
    
    const newPatient = await prisma.patient.create({
      data: {
        nhsNumber: nhsNumber,
        name: patientDetails.name,
        dateOfBirth: parseDate(patientDetails.dateOfBirth),
        gpName: patientDetails.gp,
      }
    });
    console.log(`👤 Created new patient with ID: ${newPatient.id}`);
    return { patient: newPatient, isNewPatient: true };
  }
}

/**
 * Handle letter creation/update - one letter per patient
 */
async function handleLetter(patient: any, doctorsLetter: string) {
  console.log(`📄 Handling letter for patient: ${patient.nhsNumber}`);
  
  // Check if letter exists for this patient
  const existingLetter = await prisma.letter.findUnique({
    where: { patientId: patient.id }
  });

  if (existingLetter) {
    console.log("📄 Updating existing letter");
    const updatedLetter = await prisma.letter.update({
      where: { patientId: patient.id },
      data: { content: doctorsLetter }
    });
    return { letter: updatedLetter, isNewLetter: false };
  } else {
    console.log("📄 Creating new letter");
    const newLetter = await prisma.letter.create({
      data: {
        patientId: patient.id,
        content: doctorsLetter,
      }
    });
    return { letter: newLetter, isNewLetter: true };
  }
}

/**
 * Handle test results with duplicate prevention and session tracking
 */
async function handleTestResults(patient: any, testResults: TestResult[]) {
  console.log(`🔬 Handling ${testResults.length} test results for patient: ${patient.nhsNumber}`);
  console.log(`🔬 Test names to process: ${testResults.map(t => t.testName).join(', ')}`);
  
  // Current analysis timestamp (to the millisecond for uniqueness)
  const currentAnalyzedAt = new Date();
  
  // With the new schema constraint @@unique([patientId, testName, analyzedAt]), 
  // we can have multiple tests with same name, just not at the exact same time
  
  // Check if this exact analysis session already exists
  const existingSessionResults = await prisma.testResult.findMany({
    where: {
      patientId: patient.id,
      analyzedAt: currentAnalyzedAt
    }
  });

  if (existingSessionResults.length > 0) {
    console.log("🔬 This exact analysis session already exists, returning existing results");
    return { testResults: existingSessionResults, newTestResultsCount: 0 };
  }

  // Check for very recent results (within 1 second) to handle rapid API calls
  const oneSecondAgo = new Date(currentAnalyzedAt.getTime() - 1000);
  const recentResults = await prisma.testResult.findMany({
    where: {
      patientId: patient.id,
      analyzedAt: {
        gte: oneSecondAgo
      }
    },
    select: {
      testName: true,
      analyzedAt: true,
      value: true,
      unit: true
    }
  });

  // Only filter out results that are EXACTLY the same (same test, value, unit, within 1 second)
  const filteredTestResults = testResults.filter(newTest => {
    const isExactDuplicate = recentResults.some(existing => 
      existing.testName === newTest.testName &&
      existing.value === newTest.value &&
      existing.unit === (newTest.unit || null) &&
      Math.abs(existing.analyzedAt.getTime() - currentAnalyzedAt.getTime()) < 1000
    );
    
    if (isExactDuplicate) {
      console.log(`🔬 Skipping exact duplicate: ${newTest.testName} = ${newTest.value}${newTest.unit || ''}`);
    }
    
    return !isExactDuplicate;
  });

  console.log(`🔬 After duplicate filtering: ${filteredTestResults.length} test results to insert`);

  if (filteredTestResults.length === 0) {
    console.log("🔬 All test results are exact duplicates, returning recent results");
    return { testResults: recentResults, newTestResultsCount: 0 };
  }

  // Prepare test results data for batch insertion
  const testResultsData = filteredTestResults.map(test => ({
    patientId: patient.id,
    testName: test.testName,
    value: test.value,
    unit: test.unit || null,
    referenceRange: test.referenceRange,
    status: mapTestStatus(test.status),
    meaning: test.meaning,
    analyzedAt: currentAnalyzedAt,
  }));

  console.log(`🔬 Inserting test results: ${testResultsData.map(t => `${t.testName}=${t.value}${t.unit || ''}`).join(', ')}`);

  try {
    // Batch insert new test results
    await prisma.testResult.createMany({
      data: testResultsData,
    });

    console.log(`🔬 Successfully inserted ${testResultsData.length} new test results`);
  } catch (error: any) {
    // Handle potential unique constraint violations gracefully
    if (error.code === 'P2002') {
      console.warn("⚠️ Some test results already exist, fetching existing ones");
      
      // If there's a constraint violation, fetch existing results for this session
      const existingResults = await prisma.testResult.findMany({
        where: {
          patientId: patient.id,
          analyzedAt: currentAnalyzedAt
        },
        orderBy: { testName: 'asc' }
      });
      
      return { testResults: existingResults, newTestResultsCount: 0 };
    } else {
      throw error; // Re-throw if it's not a unique constraint error
    }
  }

  // Fetch the newly created test results
  const newTestResults = await prisma.testResult.findMany({
    where: {
      patientId: patient.id,
      analyzedAt: currentAnalyzedAt
    },
    orderBy: { testName: 'asc' }
  });

  console.log(`🔬 Successfully inserted ${newTestResults.length} new test results`);
  console.log(`🔬 Inserted test names: ${newTestResults.map(t => t.testName).join(', ')}`);
  
  return { testResults: newTestResults, newTestResultsCount: newTestResults.length };
}

/**
 * Main database operations orchestrator
 */
async function saveToDatabase(parsed: ParsedAnalysis) {
  console.log("💾 Starting database operations...");
  
  // Step 1: Handle patient (check/create by NHS number)
  const { patient, isNewPatient } = await handlePatient(parsed.patientDetails);
  
  // Step 2: Handle letter (update or create - one per patient)
  const { letter, isNewLetter } = await handleLetter(patient, parsed.doctorsLetter);
  
  // Step 3: Handle test results (with duplicate prevention and session tracking)
  const { testResults, newTestResultsCount } = await handleTestResults(patient, parsed.testResults);
  
  console.log("💾 Database operations completed successfully");
  
  return {
    patient,
    letter,
    testResults,
    isNewPatient,
    isNewLetter,
    newTestResultsCount
  };
}

// Main API handler
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const startTime = Date.now();
  let vectorStore: any = null;
  let assistant: any = null;
  
  try {
    // Validate request
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No PDF file provided'
      }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({
        success: false,
        error: 'Only PDF files are allowed'
      }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({
        success: false,
        error: 'File size must be less than 10MB'
      }, { status: 400 });
    }

    console.log(`📄 Processing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Prepare file for OpenAI
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileForUpload = new File([buffer], file.name, { type: file.type });

    // Create vector store
    vectorStore = await openai.vectorStores.create({ 
      name: `Medical-${Date.now()}` 
    });
    console.log("✅ Vector store created:", vectorStore.id);

    // Upload and process file
    const pollStatus = await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
      files: [fileForUpload],
    });

    if (pollStatus.status !== 'completed') {
      throw new Error(`File ingestion failed with status: ${pollStatus.status}`);
    }

    const fileList = await openai.vectorStores.files.list(vectorStore.id);
    const attachedFile = fileList.data?.[0]?.id;

    if (!attachedFile) {
      throw new Error('No file found after ingestion');
    }

    // Create AI assistant
    assistant = await openai.beta.assistants.create({
      name: 'Medical PDF Analyzer',
      model: 'gpt-4o',
      instructions: `You are a medical assistant that analyzes medical reports and extracts structured data.

CRITICAL: Return ONLY a valid JSON object in this exact format:

{
  "patientDetails": {
    "nhsNumber": "123456789",
    "name": "John Doe", 
    "dateOfBirth": "15/08/1985",
    "gp": "Dr. Smith"
  },
  "testResults": [
    {
      "testName": "Haemoglobin (Hb)",
      "value": "14.2",
      "unit": "g/dL",
      "referenceRange": "13.0 - 17.0 g/dL",
      "status": "Normal",
      "meaning": "Haemoglobin level is within normal range, indicating no risk of anemia"
    }
  ],
  "doctorsLetter": "HTML content here"
}

Instructions:
- Extract patient details and test results as described. nhs number must always be in this format:  123-456-789
- The letter must follow this exact structure:
 - For each test result, generate a 'meaning' field.
- It should explain the clinical significance of the result in 1–2 lines.
- Do not copy the status (like 'Normal' or 'High').
- Instead, explain what it means for the patient's health.
- Keep the explanation medically accurate and readable by non-experts.

Sunnydale Medical Center<br>
123 Health Street, Sunnydale<br>
Sunnydale, AB1 2CD, United Kingdom<br>
Phone: (01234) 567890<br>
Email: contact@sunnydalemedical.com<br><br>
[Date]<br><br>
Re: [Patient's Full Name]<br>
Address: [Address or "Not specified"]<br>
Date of Birth: [Date of birth]<br>
NHS Number: [Patient ID]<br><br>
Dear [Patient Name],<br><br>
Thank you for attending your recent health assessment. Below is a summary of your test results:<br><br>

Test Results Summary:

Use an HTML <table> with the following columns: Test Name, Value with Unit, Reference Range, Status, Meaning.
The table should have borders and proper spacing. Example:

<table style="width: auto; border-collapse: collapse; font-size: 11px;" class="border border-black border-collapse w-full text-xs mt-1">
  <thead>
    <tr>
      <th style="border: 1px solid #000; padding: 6px;" >Test Name</th>
      <th style="border: 1px solid #000; padding: 6px;" >Result</th>
      <th style="border: 1px solid #000; padding: 6px;" >Reference Range</th>
      <th style="border: 1px solid #000; padding: 6px;" >Status</th>
      <th style="border: 1px solid #000; padding: 6px;" >Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #000; padding: 6px;" >Haemoglobin (Hb)</td>
      <td style="border: 1px solid #000; padding: 6px;" >14.2 g/dL</td>
      <td style="border: 1px solid #000; padding: 6px;" >13.0 - 17.0 g/dL</td>
      <td style="border: 1px solid #000; padding: 6px;" >Normal</td>
      <td style="border: 1px solid #000; padding: 6px;" >Within normal limits</td>
    </tr>
  </tbody>
</table><br>
Over Assessment:
[Summary of overall results — 2-3 sentences]<br><br>
Recommendations:<br><br>
<ul className="">
  <li>No immediate follow-up required.</li>
  <li>Maintain a balanced diet and regular exercise regimen to sustain health.</li>
  <li>Routine check-ups as advised by the GP.</li>
</ul>
Should you have any questions or concerns about your results, please don't hesitate to contact us. We're here to support your health and well-being.<br><br>
Yours sincerely,<br><br>
Dr. Alice Johnson<br>
Consultant Physician<br>
Phone: (01234) 567891<br>
Email: alice.johnson@sunnydalemedical.com<br><br>

For the doctorsLetter field, generate a complete HTML medical letter with:
- Professional letterhead (Sunnydale Medical Center)
- Patient details section
- Test results in an HTML table with borders
- Overall assessment (2-3 sentences)
- Recommendations as bullet points
- Professional closing

Requirements:
- Extract all patient information accurately
- For each test, explain the clinical meaning in simple terms
- Use proper medical terminology but keep explanations patient-friendly
- Ensure the letter is professionally formatted HTML
- Include current date in DD/MM/YYYY format`,
      
      tools: [{ type: 'file_search' }],
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStore.id],
        },
      },
    });

    // Create thread and analyze
    const thread = await openai.beta.threads.create();
    
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: 'Analyze this medical report and return structured JSON data as specified.',
      attachments: [{
        file_id: attachedFile,
        tools: [{ type: 'file_search' }],
      }],
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    console.log("🏃 Analysis started:", run.id);

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(run.id, {
      thread_id: thread.id
    });
    const pollStart = Date.now();
    
    while (['queued', 'in_progress'].includes(runStatus.status)) {
      if (Date.now() - pollStart > ANALYSIS_TIMEOUT) {
        throw new Error('Analysis timed out');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(run.id, {
        thread_id: thread.id
      });
    }

    if (runStatus.status !== 'completed') {
      throw new Error(`Analysis failed: ${runStatus.last_error?.message || 'Unknown error'}`);
    }

    // Get results
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find(m => m.role === 'assistant');
    const content = assistantMessage?.content?.[0];
    
    if (content?.type !== 'text') {
      throw new Error('No text response from assistant');
    }

    const resultText = content.text.value;

    // Parse JSON response with improved extraction
    let parsed: ParsedAnalysis;
    try {
      // More robust JSON extraction
      let cleanedText = resultText.trim();
      
      // Remove markdown code blocks
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find the actual JSON object boundaries
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
        throw new Error('No valid JSON object found in response');
      }
      
      // Extract only the JSON part
      const jsonText = cleanedText.substring(jsonStart, jsonEnd + 1);
      
      // Remove any control characters that might interfere with parsing
      const finalText = jsonText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      
      console.log("🔍 Extracted JSON length:", finalText.length);
      
      parsed = JSON.parse(finalText);
    } catch (error) {
      console.error("❌ JSON Parse Error:", error);
      console.error("Raw response (first 1000 chars):", resultText.substring(0, 1000));
      console.error("Raw response (last 1000 chars):", resultText.substring(Math.max(0, resultText.length - 1000)));
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate parsed data
    if (!parsed.patientDetails?.nhsNumber || !parsed.testResults || !parsed.doctorsLetter) {
      throw new Error('Invalid response structure from AI');
    }

    // Debug: Log the parsed test results
    console.log(`✅ Analysis completed successfully - Found ${parsed.testResults.length} test results`);
    console.log(`🔍 Test results found: ${parsed.testResults.map(t => t.testName).join(', ')}`);

    // Database operations using the new modular approach
    const result = await saveToDatabase(parsed);

    // Cleanup OpenAI resources
    try {
      if (assistant) await openai.beta.assistants.delete(assistant.id);
      if (vectorStore) await openai.vectorStores.delete(vectorStore.id);
    } catch (cleanupError) {
      console.warn("⚠️ Cleanup warning:", cleanupError);
    }

    const processingTime = Date.now() - startTime;
    console.log(`🎉 Complete! Processed in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        model: 'gpt-4o',
        processingTime,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('❌ API Error:', error);
    
    // Cleanup on error
    try {
      if (assistant) await openai.beta.assistants.delete(assistant.id);
      if (vectorStore) await openai.vectorStores.delete(vectorStore.id);
    } catch (cleanupError) {
      console.warn("⚠️ Error cleanup warning:", cleanupError);
    }
    
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: false,
      error: error?.message || 'Internal server error',
      meta: {
        model: 'gpt-4o',
        processingTime,
        timestamp: new Date().toISOString(),
      },
    }, { 
      status: error?.message?.includes('PDF file') ? 400 : 500 
    });
  }
}