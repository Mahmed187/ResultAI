import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: patientId } = await params;

    // Query with correct relationship names from your schema
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        letter: true,        // One-to-one relationship (singular)
        testResults: {       // One-to-many relationship (direct)
          orderBy: {
            analyzedAt: 'desc'  // Most recent tests first
          }
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Transform the data to match your frontend expectations
    const response = {
      id: patient.id,
      nhsNumber: patient.nhsNumber,
      name: patient.name,
      dateOfBirth: patient.dateOfBirth,
      gpName: patient.gpName,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      
      // Single letter (one-to-one)
      letter: patient.letter,
      
      // Test results grouped by analysis date for better UX
      testResults: patient.testResults,
      
      // Optional: Group test results by date if you want
      testResultsByDate: patient.testResults.reduce((acc, test) => {
        const date = test.analyzedAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(test);
        return acc;
      }, {} as Record<string, typeof patient.testResults>)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch patient',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}