import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/borrowing-records - Get all borrowing records
// Includes associated asset and borrower details
export async function GET() {
  try {
    const borrowingRecords = await prisma.borrowingRecord.findMany({
      include: {
        asset: true,    // Include the full asset object
        borrower: true, // Include the full borrower object
      },
      orderBy: { borrowDate: 'desc' }, // Order by borrow date, newest first
    });
    return NextResponse.json(borrowingRecords, { status: 200 });
  } catch (error) {
    console.error('Error fetching borrowing records:', error);
    return NextResponse.json({ error: 'Failed to fetch borrowing records' }, { status: 500 });
  }
}

// POST /api/borrowing-records - Create a new borrowing record (borrow an item)
export async function POST(request: Request) {
  try {
    const { assetId, borrowerId, expectedReturnDate, notes } = await request.json();

    if (!assetId || !borrowerId) {
      return NextResponse.json({ error: 'Missing required fields: assetId and borrowerId' }, { status: 400 });
    }

    // Check if asset exists and is available
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    if (asset.status === 'ยืม') {
      return NextResponse.json({ error: `Asset "${asset.assetName}" (ID: ${asset.assetID}) is already borrowed.` }, { status: 409 });
    }

    // Check if borrower exists
    const borrower = await prisma.borrower.findUnique({ where: { id: borrowerId } });
    if (!borrower) {
      return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
    }

    // Use Prisma transaction to ensure atomicity:
    // 1. Create borrowing record
    // 2. Update asset status
    const newRecord = await prisma.$transaction(async (tx) => {
      const record = await tx.borrowingRecord.create({
        data: {
          assetId,
          borrowerId,
          borrowDate: new Date(), // Set current date/time as borrow date
          returnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
          status: 'ยืม',
          notes,
        },
        include: { asset: true, borrower: true }, // Include related data in the response
      });

      await tx.asset.update({
        where: { id: assetId },
        data: { status: 'ยืม' },
      });

      return record;
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    console.error('Error creating borrowing record:', error);
    return NextResponse.json({ error: 'Failed to create borrowing record' }, { status: 500 });
  }
}