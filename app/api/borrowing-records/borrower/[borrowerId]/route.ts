import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/borrowing-records/borrower/[borrowerId] - Get all borrowing records for a specific borrower
export async function GET(request: Request, { params }: { params: { borrowerId: string } }) {
  const borrowerId = parseInt(params.borrowerId, 10);

  if (isNaN(borrowerId)) {
    return NextResponse.json({ error: 'Invalid Borrower ID' }, { status: 400 });
  }

  try {
    const records = await prisma.borrowingRecord.findMany({
      where: { borrowerId: borrowerId },
      include: {
        asset: true,    // Include asset details
        borrower: true, // Include borrower details
      },
      orderBy: { borrowDate: 'desc' },
    });
    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error(`Error fetching borrowing records for borrower ID ${borrowerId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch records for borrower' }, { status: 500 });
  }
}