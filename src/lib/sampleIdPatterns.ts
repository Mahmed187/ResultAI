 
export interface SampleIdPattern {
  name: string;
  pattern: RegExp;
  description: string;
  priority: number; // Lower number = higher priority
}

export const SAMPLE_ID_PATTERNS: SampleIdPattern[] = [
  // NHS specific patterns (highest priority)
  {
    name: 'NHS_SAMPLE_ID',
    pattern: /Sample\s*ID\s*:?\s*(NHS[-\s]*\d{6,10})/i,
    description: 'NHS Sample ID with explicit label',
    priority: 1
  },
  {
    name: 'NHS_SAMPLE',
    pattern: /Sample\s*:?\s*(NHS[-\s]*\d{6,10})/i,
    description: 'NHS Sample with short label',
    priority: 2
  },
  {
    name: 'NHS_ID',
    pattern: /ID\s*:?\s*(NHS[-\s]*\d{6,10})/i,
    description: 'NHS ID with generic label',
    priority: 3
  },
  
  // Lab-specific patterns
  {
    name: 'LAB_ID',
    pattern: /Lab\s*ID\s*:?\s*([A-Z0-9]{6,15})/i,
    description: 'Laboratory ID',
    priority: 4
  },
  {
    name: 'SPECIMEN_ID',
    pattern: /Specimen\s*ID\s*:?\s*([A-Z0-9]{6,15})/i,
    description: 'Specimen ID',
    priority: 5
  },
  {
    name: 'TEST_ID',
    pattern: /Test\s*ID\s*:?\s*([A-Z0-9]{6,15})/i,
    description: 'Test ID',
    priority: 6
  },
  
  // Generic alphanumeric patterns (medium priority)
  {
    name: 'GENERIC_SAMPLE_ID',
    pattern: /Sample\s*ID\s*:?\s*([A-Z0-9]{6,15})/i,
    description: 'Generic alphanumeric Sample ID',
    priority: 7
  },
  {
    name: 'REFERENCE_ID',
    pattern: /Reference\s*:?\s*([A-Z0-9]{6,15})/i,
    description: 'Reference ID',
    priority: 8
  },
  {
    name: 'BARCODE',
    pattern: /Barcode\s*:?\s*([A-Z0-9]{8,15})/i,
    description: 'Barcode ID',
    priority: 9
  },
  
  // Numeric-only patterns (lower priority)
  {
    name: 'NUMERIC_SAMPLE_ID',
    pattern: /Sample\s*ID\s*:?\s*(\d{8,15})/i,
    description: 'Numeric-only Sample ID',
    priority: 10
  },
  
  // Fallback patterns (lowest priority)
  {
    name: 'STANDALONE_NHS',
    pattern: /\b(NHS[-\s]*\d{6,10})\b/i,
    description: 'Standalone NHS number',
    priority: 20
  },
  {
    name: 'STANDALONE_ALPHANUMERIC',
    pattern: /\b([A-Z]{2,4}[-\s]*\d{6,10})\b/i,
    description: 'Standalone alphanumeric ID',
    priority: 21
  }
];

export function extractSampleIdWithPatterns(text: string): string | null {
  console.log(`📄 Searching for sample ID in ${text.length} characters of text`);
  
  // Sort patterns by priority (lower number = higher priority)
  const sortedPatterns = SAMPLE_ID_PATTERNS.sort((a, b) => a.priority - b.priority);
  
  for (const patternConfig of sortedPatterns) {
    const match = text.match(patternConfig.pattern);
    if (match && match[1]) {
      const sampleId = match[1].trim().replace(/\s+/g, ''); // Remove spaces
      console.log(`✅ Sample ID found using ${patternConfig.name}: ${sampleId}`);
      console.log(`📋 Pattern description: ${patternConfig.description}`);
      return sampleId;
    }
  }
  
  return null;
}

// Alternative: Extract all possible sample IDs and let user choose
export function extractAllPossibleSampleIds(text: string): Array<{id: string, pattern: string, confidence: number}> {
  const results: Array<{id: string, pattern: string, confidence: number}> = [];
  
  for (const patternConfig of SAMPLE_ID_PATTERNS) {
    const match = text.match(patternConfig.pattern);
    if (match && match[1]) {
      const sampleId = match[1].trim().replace(/\s+/g, '');
      const confidence = Math.max(1, 22 - patternConfig.priority); // Higher priority = higher confidence
      
      results.push({
        id: sampleId,
        pattern: patternConfig.name,
        confidence
      });
    }
  }
  
  // Remove duplicates and sort by confidence
  const unique = results.filter((item, index, arr) => 
    arr.findIndex(other => other.id === item.id) === index
  );
  
  return unique.sort((a, b) => b.confidence - a.confidence);
}