import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/borrowers - Get all borrowers
export async function GET() {
  try {
    const borrowers = await prisma.borrower.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(borrowers, { status: 200 });
  } catch (error) {
    console.error('Error fetching borrowers:', error);
    return NextResponse.json({ error: 'Failed to fetch borrowers' }, { status: 500 });
  }
}

// POST /api/borrowers - Create a new borrower
export async function POST(request: Request) {
  try {
    const borrowers: {
      fullName: string;
      department: string;
      contactEmail?: string;
      contactPhone?: string;
    }[] = await request.json();

    const invalid = borrowers.filter(b => !b.fullName || !b.department);
    if (invalid.length > 0) {
      return NextResponse.json({ error: 'Missing required fields in some entries' }, { status: 400 });
    }

    const created = await prisma.$transaction(
      borrowers.map(b => prisma.borrower.create({ data: b }))
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('Error bulk-creating borrowers:', error);
    return NextResponse.json({ error: 'Failed to create borrowers' }, { status: 500 });
  }
}
