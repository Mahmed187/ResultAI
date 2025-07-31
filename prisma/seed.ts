import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a sample patient
  const patient = await prisma.patient.upsert({
    where: { id: '123 456 7890' },
    update: {},
    //@ts-ignore
    create: {
      id: '123 456 7890',
      name: 'John Smith',
      dateOfBirth: new Date('1985-03-15'),
      gpName: 'Dr. Sarah Johnson',
    },
  })

  // Create a sample report
  //@ts-ignore
  const report = await prisma.report.create({
    data: {
      sampleId: 'SAMPLE-001',
      sampleCollected: new Date('2024-01-15'),
      sampleReceived: new Date('2024-01-16'),
      reportGenerated: new Date('2024-01-17'),
      patientId: patient.id,
      comments: 'All results within normal range. Patient advised to continue current medication.',
      testResults: {
        create: [
          {
            testName: 'Haemoglobin',
            resultValue: '14.2 g/dL',
            referenceRange: '13.0-17.0 g/dL',
          },
          {
            testName: 'White Blood Cell Count',
            resultValue: '7.5 x10^9/L',
            referenceRange: '4.0-11.0 x10^9/L',
          },
          {
            testName: 'Platelet Count',
            resultValue: '250 x10^9/L',
            referenceRange: '150-400 x10^9/L',
          },
          {
            testName: 'Sodium',
            resultValue: '140 mmol/L',
            referenceRange: '135-145 mmol/L',
          },
          {
            testName: 'Potassium',
            resultValue: '4.2 mmol/L',
            referenceRange: '3.5-5.0 mmol/L',
          },
        ],
      },
    },
  })

  // Create a sample letter
  const letter = await prisma.letter.create({
    data: {
      patientId: patient.id,
      //@ts-ignore
      fileUrl: 'sample-letter.pdf',
      status: 'completed',
      letter: `Dear Dr. Johnson,

I am writing to inform you of the results of the recent blood tests for your patient, Mr. John Smith (NHS: 123 456 7890).

Test Results Summary:
- Haemoglobin: 14.2 g/dL (Normal range: 13.0-17.0 g/dL)
- White Blood Cell Count: 7.5 x10^9/L (Normal range: 4.0-11.0 x10^9/L)
- Platelet Count: 250 x10^9/L (Normal range: 150-400 x10^9/L)
- Sodium: 140 mmol/L (Normal range: 135-145 mmol/L)
- Potassium: 4.2 mmol/L (Normal range: 3.5-5.0 mmol/L)

All test results are within normal reference ranges. The patient's blood count and electrolyte levels are satisfactory.

Recommendations:
1. Continue current medication as prescribed
2. Schedule follow-up appointment in 3 months
3. Monitor blood pressure regularly

If you have any questions or require additional testing, please do not hesitate to contact me.

Yours sincerely,
Dr. Michael Chen
Consultant Pathologist
St. Mary's Hospital`,
      analysis: {
        model: 'gpt-4',
        timestamp: new Date().toISOString(),
        summary: 'All test results within normal range'
      },
      testResults: [
        {
          testName: 'Haemoglobin',
          resultValue: '14.2 g/dL',
          referenceRange: '13.0-17.0 g/dL',
          status: 'normal'
        },
        {
          testName: 'White Blood Cell Count',
          resultValue: '7.5 x10^9/L',
          referenceRange: '4.0-11.0 x10^9/L',
          status: 'normal'
        }
      ],
      patientDetails: {
        name: 'John Smith',
        nhsNumber: '123 456 7890',
        dateOfBirth: '1985-03-15'
      }
    },
  })

  console.log('Seed data created successfully!')
  console.log('Patient:', patient)
  console.log('Report:', report)
  console.log('Letter:', letter)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 