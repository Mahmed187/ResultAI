import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

// TypeScript interfaces
interface PatientDetails {
  nhsNumber: string;
  name: string;
  dateOfBirth: string;
  gp: string;
  sampleId: string;
}

interface TestResult {
  testName: string;
  value: string;
  unit?: string;
  referenceRange: string;
  status: string;
  meaning: string;
}

interface ProcessedAnalysis {
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

// Check if patient exists and has test results with the same sample ID
async function checkPatientAndSample(nhsNumber: string, sampleId: string) {
  console.log(`🔍 Checking patient with NHS: ${nhsNumber} and sample ID: ${sampleId}`);
  
  // First, check if sample ID exists ANYWHERE in the database (global unique constraint)
  const existingSampleResult = await prisma.testResult.findFirst({
    where: { sampleId: sampleId },
    include: {
      patient: {
        select: { nhsNumber: true, name: true }
      }
    }
  });

  if (existingSampleResult) {
    console.log(`⚠️ Sample ${sampleId} already exists in database`);
    console.log(`⚠️ Sample belongs to patient: ${existingSampleResult.patient.name} (NHS: ${existingSampleResult.patient.nhsNumber})`);
    
    return { 
      patientExists: false,
      patient: null, 
      sampleExists: true,
      existingSamplePatient: existingSampleResult.patient,
      sampleCount: 1
    };
  }

  // Sample is new, now check if patient exists
  const existingPatient = await prisma.patient.findUnique({
    where: { nhsNumber: nhsNumber.trim() }
  });

  if (existingPatient) {
    console.log(`👤 Patient found with ID: ${existingPatient.id}`);
    console.log(`✅ Patient exists and sample ${sampleId} is new`);
    
    return { 
      patientExists: true, 
      patient: existingPatient, 
      sampleExists: false,
      existingSamplePatient: null,
      sampleCount: 0
    };
  }

  console.log(`👤 No existing patient found for NHS: ${nhsNumber}`);
  console.log(`✅ Both patient and sample ${sampleId} are new`);
  
  return { 
    patientExists: false, 
    patient: null, 
    sampleExists: false,
    existingSamplePatient: null,
    sampleCount: 0
  };
}

// Process plain text with AI
async function processWithAI(plainText: string, patientDetails: PatientDetails): Promise<ProcessedAnalysis> {
  console.log("🤖 Starting AI analysis of plain text...");

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a medical assistant that processes plain text medical reports and returns structured data.

CRITICAL: Return ONLY a valid JSON object in this exact format:

{
  "patientDetails": {
    "nhsNumber": "123-456-789",
    "name": "John Doe", 
    "dateOfBirth": "15/08/1985",
    "gp": "Dr. Smith",
    "sampleId": "SAMPLE123"
  },
  "testResults": [
    {
      "testName": "Haemoglobin (Hb)",
      "value": "14.2",
      "unit": "g/dL",
      "referenceRange": "13.0 - 17.0 g/dL",
      "status": "NORMAL",
      "meaning": "Haemoglobin level is within normal range, indicating good oxygen-carrying capacity and no signs of anemia."
    }
  ],
  "doctorsLetter": "HTML content here"
}

Instructions:
- Use the provided patient details exactly as given
- NHS number must be in format: 123-456-789
- For each test result, determine the proper status: NORMAL, HIGH, LOW, or CRITICAL
- Generate meaningful clinical explanations for each test result
- Status should be one of: NORMAL, HIGH, LOW, CRITICAL (uppercase)
- Meaning should explain clinical significance in 1-2 lines, patient-friendly language

For the doctorsLetter field, generate complete HTML following this template:

Sunnydale Medical Center<br>
123 Health Street, Sunnydale<br>
Sunnydale, AB1 2CD, United Kingdom<br>
Phone: (01234) 567890<br>
Email: contact@sunnydalemedical.com<br><br>
[Current Date in DD/MM/YYYY format]<br><br>
Re: [Patient's Full Name]<br>
Address: [Address or "Not specified"]<br>
Date of Birth: [Date of birth]<br>
NHS Number: [Patient ID]<br><br>
Dear [Patient Name],<br><br>
Thank you for attending your recent health assessment. Below is a summary of your test results:<br><br>

Test Results Summary:

<table style="width: auto; border-collapse: collapse; font-size: 11px;" class="border border-black border-collapse w-full text-xs mt-1">
  <thead>
    <tr>
      <th style="border: 1px solid #000; padding: 6px;">Test Name</th>
      <th style="border: 1px solid #000; padding: 6px;">Result</th>
      <th style="border: 1px solid #000; padding: 6px;">Reference Range</th>
      <th style="border: 1px solid #000; padding: 6px;">Status</th>
      <th style="border: 1px solid #000; padding: 6px;">Meaning</th>
    </tr>
  </thead>
  <tbody>
    [Generate rows for each test result]
  </tbody>
</table><br>

Overall Assessment:
[2-3 sentence summary of results]<br><br>

Recommendations:<br><br>
<ul>
  <li>[Recommendation]</li> 
</ul>

Should you have any questions or concerns about your results, please don't hesitate to contact us.<br><br>
Yours sincerely,<br><br>
Dr. Alice Johnson<br>
Consultant Physician<br>
Phone: (01234) 567891<br>
Email: alice.johnson@sunnydalemedical.com<br><br>

Requirements:
- Use current date in DD/MM/YYYY format
- Include all test results in the table with proper formatting
- Generate appropriate recommendations based on results
- Keep language professional but patient-friendly
- Ensure all HTML is properly formatted with inline styles`
      },
      {
        role: 'user',
        content: `Process this medical report text and enhance it with proper status and meaning for each test result. Use these patient details:

Patient Details:
- NHS Number: ${patientDetails.nhsNumber}
- Name: ${patientDetails.name}
- Date of Birth: ${patientDetails.dateOfBirth}
- GP: ${patientDetails.gp}
- Sample ID: ${patientDetails.sampleId}

Medical Report Text:
${plainText}

Please analyze each test result, determine the correct status (NORMAL/HIGH/LOW/CRITICAL), and provide meaningful clinical explanations.`
      }
    ],
    temperature: 0.3,
  });

  const responseText = completion.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error('No response from AI');
  }

  console.log("🤖 AI analysis completed, parsing response...");

  // Parse JSON response
  let parsed: ProcessedAnalysis;
  try {
    // Clean the response text
    let cleanedText = responseText.trim();
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
      throw new Error('No valid JSON object found in AI response');
    }
    
    const jsonText = cleanedText.substring(jsonStart, jsonEnd + 1);
    const finalText = jsonText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    parsed = JSON.parse(finalText);
  } catch (error) {
    console.error("❌ JSON Parse Error:", error);
    console.error("Raw AI response:", responseText.substring(0, 1000));
    throw new Error('Failed to parse AI response as JSON');
  }

  // Validate parsed data
  if (!parsed.patientDetails || !parsed.testResults || !parsed.doctorsLetter) {
    throw new Error('Invalid response structure from AI');
  }

  console.log(`✅ AI processing completed - Found ${parsed.testResults.length} test results`);
  return parsed;
}

// Utility functions (same as before)
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

// Database operations (simplified from original)
async function handlePatient(patientDetails: PatientDetails) {
  const nhsNumber = patientDetails.nhsNumber.trim();
  
  const existingPatient = await prisma.patient.findUnique({
    where: { nhsNumber: nhsNumber }
  });

  if (existingPatient) {
    console.log("👤 Using existing patient");
    return { patient: existingPatient, isNewPatient: false };
  } else {
    console.log("👤 Creating new patient");
    const newPatient = await prisma.patient.create({
      data: {
        nhsNumber: nhsNumber,
        name: patientDetails.name,
        dateOfBirth: parseDate(patientDetails.dateOfBirth),
        gpName: patientDetails.gp,
      }
    });
    return { patient: newPatient, isNewPatient: true };
  }
}

async function handleLetter(patient: any, doctorsLetter: string) {
  const existingLetter = await prisma.letter.findUnique({
    where: { patientId: patient.id }
  });

  if (existingLetter) {
    const updatedLetter = await prisma.letter.update({
      where: { patientId: patient.id },
      data: { content: doctorsLetter }
    });
    return { letter: updatedLetter, isNewLetter: false };
  } else {
    const newLetter = await prisma.letter.create({
      data: {
        patientId: patient.id,
        content: doctorsLetter,
      }
    });
    return { letter: newLetter, isNewLetter: true };
  }
}

async function handleTestResults(patient: any, testResults: TestResult[], sampleId: string) {
  console.log(`🔬 Handling ${testResults.length} test results for sample: ${sampleId}`);

  const currentAnalyzedAt = new Date();
  
  const testResultsData = testResults.map(test => ({
    patientId: patient.id,
    sampleId: sampleId,
    testName: test.testName,
    value: test.value,
    unit: test.unit || null,
    referenceRange: test.referenceRange,
    status: mapTestStatus(test.status),
    meaning: test.meaning,
    analyzedAt: currentAnalyzedAt,
  }));

  await prisma.testResult.createMany({
    data: testResultsData,
  });

  const newTestResults = await prisma.testResult.findMany({
    where: { sampleId: sampleId },
    orderBy: { testName: 'asc' }
  });

  console.log(`🔬 Successfully created ${newTestResults.length} test results`);
  return { testResults: newTestResults, newTestResultsCount: newTestResults.length };
}

async function saveToDatabase(parsed: ProcessedAnalysis, sampleId: string) {
  console.log("💾 Starting database operations...");
  
  const { patient, isNewPatient } = await handlePatient(parsed.patientDetails);
  const { letter, isNewLetter } = await handleLetter(patient, parsed.doctorsLetter);
  const { testResults, newTestResultsCount } = await handleTestResults(patient, parsed.testResults, sampleId);
  
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
  
  try {
    // Parse request body
    const body = await request.json();
    const { patientDetails, plainText, sampleId } = body;

    // Validate required fields
    if (!patientDetails || !plainText || !sampleId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: patientDetails, plainText, and sampleId are required'
      }, { status: 400 });
    }

    if (!patientDetails.nhsNumber) {
      return NextResponse.json({
        success: false,
        error: 'NHS number is required in patient details'
      }, { status: 400 });
    }

    console.log(`📄 Processing analysis for NHS: ${patientDetails.nhsNumber}, Sample: ${sampleId}`);

    // Step 1: Check patient existence and sample duplication
    const patientCheck = await checkPatientAndSample(patientDetails.nhsNumber, sampleId);
    
    if (patientCheck.sampleExists) {
      return NextResponse.json({
        success: false,
        error: `Sample ${sampleId} has already been analyzed for patient ${patientDetails.nhsNumber}. Found ${patientCheck.sampleCount} existing test results.`
      }, { status: 409 }); // 409 Conflict
    }

    console.log(`✅ Sample ${sampleId} is new, proceeding with analysis...`);

    // Step 2: Process with AI
    const processed = await processWithAI(plainText, {
      ...patientDetails,
      sampleId
    });

    // Step 3: Save to database
    const result = await saveToDatabase(processed, sampleId);

    const processingTime = Date.now() - startTime;
    console.log(`🎉 Analysis completed in ${processingTime}ms`);

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
    
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: false,
      error: error?.message || 'Internal server error',
      meta: {
        model: 'gpt-4o',
        processingTime,
        timestamp: new Date().toISOString(),
      },
    }, { status: 500 });
  }
}