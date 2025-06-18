import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/borrowers/[id]
export async function GET(request: NextRequest, context: any) {
  const borrowerId = parseInt(context.params.id, 10);

  if (isNaN(borrowerId)) {
    return NextResponse.json({ error: 'Invalid Borrower ID' }, { status: 400 });
  }

  try {
    const borrower = await prisma.borrower.findUnique({
      where: { id: borrowerId },
    });

    if (!borrower) {
      return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
    }

    return NextResponse.json(borrower, { status: 200 });
  } catch (error) {
    console.error(`Error fetching borrower with ID ${borrowerId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch borrower' }, { status: 500 });
  }
}

// PUT /api/borrowers/[id]
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const borrowerId = parseInt(context.params.id, 10);

  if (isNaN(borrowerId)) {
    return NextResponse.json({ error: 'Invalid Borrower ID' }, { status: 400 });
  }

  let data: any;
  try {
    data = await request.json();

    const updatedBorrower = await prisma.borrower.update({
      where: { id: borrowerId },
      data,
    });

    return NextResponse.json(updatedBorrower, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating borrower with ID ${borrowerId}:`, error);

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
    }

    if (error.code === 'P2002' && error.meta?.target === 'contactEmail') {
      return NextResponse.json({
        error: `Borrower with email "${data?.contactEmail ?? ''}" already exists.`,
      }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to update borrower' }, { status: 500 });
  }
}

// DELETE /api/borrowers/[id]
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const borrowerId = parseInt(context.params.id, 10);

  if (isNaN(borrowerId)) {
    return NextResponse.json({ error: 'Invalid Borrower ID' }, { status: 400 });
  }

  try {
    const associatedRecords = await prisma.borrowingRecord.count({
      where: { borrowerId },
    });

    if (associatedRecords > 0) {
      return NextResponse.json({
        error: 'Cannot delete borrower: They have associated borrowing records. Delete records first.',
      }, { status: 409 });
    }

    await prisma.borrower.delete({
      where: { id: borrowerId },
    });

    return NextResponse.json({ message: 'Borrower deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting borrower with ID ${borrowerId}:`, error);

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to delete borrower' }, { status: 500 });
  }
}
