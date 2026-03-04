import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-auth');
  const cookieAuth = request.cookies.get('admin_auth');
  
  if (authHeader === 'true' || cookieAuth?.value === 'true') {
    return true;
  }
  return false;
}

export async function GET() {
  try {
    const masjids = await prisma.masjid.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(masjids);
  } catch (error) {
    console.error('Error fetching masjids:', error);
    return NextResponse.json(
      { error: 'Failed to fetch masjids' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifyAdminAuth(request);
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { name, location } = body;

    if (!name || !location) {
      return NextResponse.json(
        { error: 'Name and location are required' },
        { status: 400 }
      );
    }

    const masjid = await prisma.masjid.create({
      data: {
        name,
        location,
      },
    });

    return NextResponse.json(masjid);
  } catch (error) {
    console.error('Error creating masjid:', error);
    return NextResponse.json(
      { error: 'Failed to create masjid' },
      { status: 500 }
    );
  }
}
