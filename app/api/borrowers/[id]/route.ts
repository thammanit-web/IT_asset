import { NextResponse,NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
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
    return NextResponse.json({ error: 'Failed to fetch borrower' }, { status: 500 });
  }
}


// PUT /api/borrowers/[id] - Update borrower by ID
export async function PUT(  req: NextRequest,
  context: { params: { id: string } }
) {
  const borrowerId = parseInt(context.params.id, 10);

  if (isNaN(borrowerId)) {
    return NextResponse.json({ error: 'Invalid Borrower ID' }, { status: 400 });
  }

  let data: any;
  try {
    data = await req.json();
    const updatedBorrower = await prisma.borrower.update({
      where: { id: borrowerId },
      data: data,
    });
    return NextResponse.json(updatedBorrower, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating borrower with ID ${borrowerId}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
    }
    if (error.code === 'P2002' && error.meta?.target === 'contactEmail') {
        return NextResponse.json({ error: `Borrower with email "${data?.contactEmail ?? ''}" already exists.` }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update borrower' }, { status: 500 });
  }
}

// DELETE /api/borrowers/[id] - Delete borrower by ID
export async function DELETE(  req: NextRequest,
  context: { params: { id: string } }
) {
  const borrowerId = parseInt(context.params.id, 10);
  if (isNaN(borrowerId)) {
    return NextResponse.json({ error: 'Invalid Borrower ID' }, { status: 400 });
  }

  try {
    // Before deleting, check if there are any borrowing records associated with this borrower
    const associatedRecords = await prisma.borrowingRecord.count({
      where: { borrowerId: borrowerId },
    });

    if (associatedRecords > 0) {
      return NextResponse.json(
        { error: 'Cannot delete borrower: They have associated borrowing records. Delete records first.' },
        { status: 409 } // Conflict
      );
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
