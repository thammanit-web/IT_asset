import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/borrowing-records/[id] - Get borrowing record by ID
export async function GET(request: Request, context: any) {
  const id = context.params.id;
  const recordId = parseInt(id, 10);

  if (isNaN(recordId)) {
    return NextResponse.json({ error: 'Invalid Borrowing Record ID' }, { status: 400 });
  }

  try {
    const record = await prisma.borrowingRecord.findUnique({
      where: { id: recordId },
      include: { asset: true, borrower: true }, // Include related data
    });

    if (!record) {
      return NextResponse.json({ error: 'Borrowing record not found' }, { status: 404 });
    }
    return NextResponse.json(record, { status: 200 });
  } catch (error) {
    console.error(`Error fetching borrowing record with ID ${recordId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch borrowing record' }, { status: 500 });
  }
}

// PUT /api/borrowing-records/[id] - Update borrowing record by ID (e.g., mark as returned)
export async function PUT(request: Request, context: any) {
  const id = context.params.id;
  const recordId = parseInt(id, 10);

  if (isNaN(recordId)) {
    return NextResponse.json({ error: 'Invalid Borrowing Record ID' }, { status: 400 });
  }

  try {
    const data = await request.json();
    const { status, returnDate, ...restData } = data; // Destructure status and returnDate

    // Ensure returnDate is a valid Date object if provided
    const parsedReturnDate = returnDate ? new Date(returnDate) : undefined;

    // Use Prisma transaction for atomicity if status is being updated to 'Returned'
    const updatedRecord = await prisma.$transaction(async (tx) => {
      const currentRecord = await tx.borrowingRecord.findUnique({
        where: { id: recordId },
      });

      if (!currentRecord) {
        throw new Error('Record not found for update'); // Will be caught by outer catch block
      }

      const updatedData: any = { ...restData };
      if (status) updatedData.status = status;
      if (parsedReturnDate) updatedData.returnDate = parsedReturnDate;


      // If status is being changed to 'Returned'
      if (status === 'คืนแล้ว' && currentRecord.status !== 'คืนแล้ว') {
        // Update the asset's status to 'Available' (or appropriate status)
        await tx.asset.update({
          where: { id: currentRecord.assetId },
          data: { status: 'ใช้งาน' }, // Assuming 'Available' is the status for returned items
        });
        // Ensure returnDate is set if not already
        if (!updatedData.returnDate) {
            updatedData.returnDate = new Date();
        }
      } else if (status === 'ยืม' && currentRecord.status !== 'ยืม') {
        // If status is changed back to 'Borrowed', set asset status to 'Borrowed'
        await tx.asset.update({
          where: { id: currentRecord.assetId },
          data: { status: 'ยืม' },
        });
        // Clear returnDate if item is borrowed again
        updatedData.returnDate = null;
      }

      const record = await tx.borrowingRecord.update({
        where: { id: recordId },
        data: updatedData,
        include: { asset: true, borrower: true },
      });
      return record;
    });

    return NextResponse.json(updatedRecord, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating borrowing record with ID ${recordId}:`, error);
    if (error.message === 'Record not found for update' || error.code === 'P2025') {
      return NextResponse.json({ error: 'Borrowing record not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update borrowing record' }, { status: 500 });
  }
}

// DELETE /api/borrowing-records/[id] - Delete borrowing record by ID
export async function DELETE(request: Request, context: any) {
  const id = context.params.id;
  const recordId = parseInt(id, 10);

  if (isNaN(recordId)) {
    return NextResponse.json({ error: 'Invalid Borrowing Record ID' }, { status: 400 });
  }

  try {
    // Before deleting the record, get the asset ID to potentially update its status
    const recordToDelete = await prisma.borrowingRecord.findUnique({
      where: { id: recordId },
      select: { assetId: true, status: true },
    });

    if (!recordToDelete) {
      return NextResponse.json({ error: 'Borrowing record not found' }, { status: 404 });
    }

    // If the asset was 'Borrowed' according to this record, revert its status to 'Available'
    // This is a safety measure in case a record is deleted without being properly returned first.
    // However, ideally, a record should only be deleted if it was already "Returned" or if there's a good reason
    // to force a status change (e.g., error correction).
    await prisma.$transaction(async (tx) => {
      await tx.borrowingRecord.delete({
        where: { id: recordId },
      });

      if (recordToDelete.status === 'ยืม') {
        // Check if there are any other 'Borrowed' records for this asset
        const otherBorrowedRecords = await tx.borrowingRecord.count({
          where: {
            assetId: recordToDelete.assetId,
            status: 'ยืม',
            id: { not: recordId }, // Exclude the record being deleted
          },
        });

        // Only set asset status to 'Available' if no other 'Borrowed' records exist
        if (otherBorrowedRecords === 0) {
          await tx.asset.update({
            where: { id: recordToDelete.assetId },
            data: { status: 'ใช้งาน' },
          });
        }
      }
    });

    return NextResponse.json({ message: 'Borrowing record deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting borrowing record with ID ${recordId}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Borrowing record not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete borrowing record' }, { status: 500 });
  }
}