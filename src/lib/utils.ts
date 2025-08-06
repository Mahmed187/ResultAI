import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

export function parsePathologyReport(extractedText: string): ParsedPathologyReport {
  // Clean and normalize the text
  const text = extractedText.replace(/\s+/g, ' ').trim();
  
  // Initialize the result object
  const result: ParsedPathologyReport = {
    patientDetails: {
      nhsNumber: null,
      name: null,
      dateOfBirth: null,
      gp: null,
      sampleId: null
    },
    testResults: []
  };

  // Parse Patient Details
  result.patientDetails = parsePatientDetails(text);
  
  // Parse Test Results
  result.testResults = parseTestResults(text);

  return result;
}

function parsePatientDetails(text: string): PatientDetails {
  const patientDetails: PatientDetails = {
    nhsNumber: null,
    name: null,
    dateOfBirth: null,
    gp: null,
    sampleId: null
  };

  // Extract NHS Number
  const nhsMatch = text.match(/NHS\s*Number[:\s]+([\d\s]+)/i);
  if (nhsMatch) {
    patientDetails.nhsNumber = nhsMatch[1].replace(/\s/g, '').trim();
  }

  // Extract Name
  const nameMatch = text.match(/Name[:\s]+([A-Za-z\s]+?)(?:\s+NHS|\s+Date|\s+GP|\s+Sample|$)/i);
  if (nameMatch) {
    patientDetails.name = nameMatch[1].trim();
  }

  // Extract Date of Birth
  const dobMatch = text.match(/Date\s*of\s*Birth[:\s]+([\d\/\-\.]+)/i);
  if (dobMatch) {
    patientDetails.dateOfBirth = dobMatch[1].trim();
  }

  // Extract GP
  const gpMatch = text.match(/GP[:\s]+([A-Za-z\s,\.]+?)(?:\s+Sample|\s+Test|\s+Report|$)/i);
  if (gpMatch) {
    patientDetails.gp = gpMatch[1].trim();
  }

  // Extract Sample ID
  const sampleIdMatch = text.match(/Sample\s*ID[:\s]+([\w\-]+)/i);
  if (sampleIdMatch) {
    patientDetails.sampleId = sampleIdMatch[1].trim();
  }

  return patientDetails;
}

function parseTestResults(text: string): TestResult[] {
  const testResults: TestResult[] = [];
  
  // Find the test results section - look for the table after "Test Results"
  const testSectionMatch = text.match(/Test\s*Results\s*Test\s*Result\s*Reference\s*Range\s*(.*?)(?:Comments|All\s*results|$)/i);
  
  if (!testSectionMatch) {
    return testResults;
  }
  
  const testSection = testSectionMatch[1].trim();
  
  // Define expected test patterns with their units
  const testPatterns = [
    {
      name: 'Haemoglobin \\(Hb\\)',
      pattern: /Haemoglobin\s*\(Hb\)\s+([\d\.]+)\s+g\/dL\s+([\d\.]+\s*-\s*[\d\.]+)\s+g\/dL/i,
      unit: 'g/dL'
    },
    {
      name: 'White Blood Cells \\(WBC\\)',
      pattern: /White\s*Blood\s*Cells\s*\(WBC\)\s+([\d\.]+)\s+x10\^9\/L\s+([\d\.]+\s*-\s*[\d\.]+)\s+x10\^9\/L/i,
      unit: 'x10^9/L'
    },
    {
      name: 'Platelets',
      pattern: /Platelets\s+([\d\.]+)\s+x10\^9\/L\s+([\d\.]+\s*-\s*[\d\.]+)\s+x10\^9\/L/i,
      unit: 'x10^9/L'
    },
    {
      name: 'Creatinine',
      pattern: /Creatinine\s+([\d\.]+)\s+µmol\/L\s+([\d\.]+\s*-\s*[\d\.]+)\s+µmol\/L/i,
      unit: 'µmol/L'
    },
    {
      name: 'ALT \\(Liver Enzyme\\)',
      pattern: /ALT\s*\(Liver\s*Enzyme\)\s+([\d\.]+)\s+U\/L\s+([\d\.]+\s*-\s*[\d\.]+)\s+U\/L/i,
      unit: 'U/L'
    },
    {
      name: 'CRP \\(Inflammation\\)',
      pattern: /CRP\s*\(Inflammation\)\s+([\d\.]+)\s+mg\/L\s+(<[\d\.]+)\s+mg\/L/i,
      unit: 'mg/L'
    }
  ];

  // Parse each test using specific patterns
  for (const testPattern of testPatterns) {
    const match = testSection.match(testPattern.pattern);
    if (match) {
      const testName = testPattern.name.replace(/\\|\(/g, '').replace(/\)/g, '');
      const value = match[1];
      const referenceRange = match[2];
      const unit = testPattern.unit;

      // Clean up test name
      const cleanTestName = testName === 'Haemoglobin Hb' ? 'Haemoglobin (Hb)' :
                           testName === 'White Blood Cells WBC' ? 'White Blood Cells (WBC)' :
                           testName === 'ALT Liver Enzyme' ? 'ALT (Liver Enzyme)' :
                           testName === 'CRP Inflammation' ? 'CRP (Inflammation)' :
                           testName;

      const status = determineStatus(value, referenceRange);

      testResults.push({
        testName: cleanTestName,
        value: value,
        unit: unit,
        referenceRange: referenceRange + ' ' + unit,
        status: status,
        meaning: null
      });
    }
  }

  // Fallback: Try to parse any remaining tests with a more general pattern
  if (testResults.length === 0) {
    const generalPattern = /([A-Za-z\s\(\)]+?)\s+([\d\.]+)\s+([A-Za-z\/\^0-9μ°%]+)\s+([\d\.<>\s\-]+)\s+([A-Za-z\/\^0-9μ°%]+)/g;
    
    let match;
    while ((match = generalPattern.exec(testSection)) !== null) {
      const testName = match[1].trim();
      const value = match[2].trim();
      const unit = match[3].trim();
      const range = match[4].trim();
      const rangeUnit = match[5].trim();

      // Skip invalid matches
      if (testName.length < 3 || testName.toLowerCase().includes('test') || testName.toLowerCase().includes('result')) {
        continue;
      }

      const referenceRange = range + ' ' + rangeUnit;
      const status = determineStatus(value, range);

      testResults.push({
        testName: testName,
        value: value,
        unit: unit,
        referenceRange: referenceRange,
        status: status,
        meaning: null
      });
    }
  }

  return testResults;
}

function determineStatus(value: string | null, referenceRange: string | null): string | null {
  if (!value || !referenceRange) return null;

  try {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;

    // Handle threshold values like "<10"
    if (referenceRange.includes('<')) {
      const thresholdMatch = referenceRange.match(/<([\d\.]+)/);
      if (thresholdMatch) {
        const threshold = parseFloat(thresholdMatch[1]);
        return numValue < threshold ? 'Normal' : 'High';
      }
    }

    // Handle threshold values like ">5"
    if (referenceRange.includes('>')) {
      const thresholdMatch = referenceRange.match(/>([\d\.]+)/);
      if (thresholdMatch) {
        const threshold = parseFloat(thresholdMatch[1]);
        return numValue > threshold ? 'Normal' : 'Low';
      }
    }

    // Handle range values like "13.0 - 17.0"
    const rangeMatch = referenceRange.match(/([\d\.]+)\s*-\s*([\d\.]+)/);
    if (rangeMatch) {
      const minValue = parseFloat(rangeMatch[1]);
      const maxValue = parseFloat(rangeMatch[2]);
      
      if (!isNaN(minValue) && !isNaN(maxValue)) {
        if (numValue < minValue) return 'Low';
        if (numValue > maxValue) return 'High';
        return 'Normal';
      }
    }
  } catch (error) {
    return null;
  }

  return null;
}
