import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const prismaClient = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(patients)
  } catch (error: any) {
    console.error('Error fetching patients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nhsNumber, firstName, lastName, dateOfBirth, gpName } = body

    // Validate required fields
    if (!nhsNumber || !firstName || !lastName || !dateOfBirth || !gpName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }

    // Create patient in database
    const patient = await prismaClient.patient.create({
      //@ts-ignore
      data: {
        id: nhsNumber,
        name: `${firstName} ${lastName}`,
        dateOfBirth: new Date(dateOfBirth),
        gpName
      }
    })

    return NextResponse.json({
      success: true,
      data: patient,
      message: 'Patient created successfully'
    })

  } catch (error: any) {
    console.error('Error creating patient:', error)

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'A patient with this NHS number already exists',
          code: 'DUPLICATE_ERROR'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create patient',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
} 