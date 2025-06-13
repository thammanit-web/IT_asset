import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateAssetData } from '@/types/asset';

// GET /api/assets - Get all assets with optional search and filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const groupType = searchParams.get('groupType') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { assetName: { contains: search, mode: 'insensitive' } },
        { assetID: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (groupType) {
      where.groupType = groupType;
    }
    
    if (status) {
      where.status = status;
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.asset.count({ where })
    ]);

    return NextResponse.json({
      assets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

// POST /api/assets - Create new asset
export async function POST(request: NextRequest) {
  try {
    const body: CreateAssetData = await request.json();
    
    // Validate required fields
    if (!body.assetName || !body.assetID || !body.groupType || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: assetName, assetID, groupType, status' },
        { status: 400 }
      );
    }

    // Check if assetID already exists
    const existingAsset = await prisma.asset.findUnique({
      where: { assetID: body.assetID }
    });

    if (existingAsset) {
      return NextResponse.json(
        { error: 'Asset ID already exists' },
        { status: 409 }
      );
    }

    const asset = await prisma.asset.create({
      data: {
        assetName: body.assetName,
        assetID: body.assetID,
        description: body.description || null,
        groupType: body.groupType,
        status: body.status,
        imgUrl: body.imgUrl || null
      }
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}

