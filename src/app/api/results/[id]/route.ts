import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await prisma.letter.findUnique({
      where: { id },
      include: { patient: true }
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error fetching result:', error)
    return NextResponse.json(
      { error: 'Failed to fetch result' },
      { status: 500 }
    )
  }
}

// export async function PATCH(
//   request: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const body = await request.json()
//     const { analysis, letter, testResults, status, metadata } = body

//     const result = await prisma.letter.update({
//       where: { id },
//       data: {
//         analysis,
//         letter,
//         testResults,
//         status,
//         metadata
//       }
//     })

//     return NextResponse.json({ data: result })
//   } catch (error) {
//     console.error('Error updating result:', error)
//     return NextResponse.json(
//       { error: 'Failed to update result' },
//       { status: 500 }
//     )
//   }
// } 