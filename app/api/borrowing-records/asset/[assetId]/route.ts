import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/borrowing-records/asset/[assetId] - Get all borrowing records for a specific asset
export async function GET(request: Request, { params }: { params: { assetId: string } }) {
  const assetId = parseInt(params.assetId, 10);

  if (isNaN(assetId)) {
    return NextResponse.json({ error: 'Invalid Asset ID' }, { status: 400 });
  }

  try {
    const records = await prisma.borrowingRecord.findMany({
      where: { assetId: assetId },
      include: {
        borrower: true, // Include borrower details
        asset: true,    // Include asset details
      },
      orderBy: { borrowDate: 'desc' },
    });
    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error(`Error fetching borrowing records for asset ID ${assetId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch records for asset' }, { status: 500 });
  }
}
