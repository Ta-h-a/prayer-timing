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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const headerMasjidId = request.headers.get('x-masjid-id');
  const queryMasjidId = searchParams.get('masjidId');
  const MasjidId = headerMasjidId || queryMasjidId;

  try {
    let whereClause: any = {};

    if (MasjidId) {
      whereClause.masjidId = MasjidId;
      whereClause.Masjid = { isActive: true };
    } else {
      whereClause.Masjid = { isActive: true };
    }

    const prayerTimes = await prisma.prayerTime.findFirst({
      where: whereClause,
      include: {
        Masjid: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (!prayerTimes) {
      const masjids = await prisma.masjid.findFirst({
        where: { isActive: true },
      });

      if (!masjids) {
        return NextResponse.json(
          { error: 'No active masjids found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: 'No prayer times found',
        Masjid: masjids,
        prayerTimes: null,
      });
    }

    return NextResponse.json(prayerTimes);
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prayer times', details: String(error) },
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
    const { date, fajr, dhuhr, asr, maghrib, isha } = body;
    const MasjidId = body.MasjidId || body.masjidId;

    if (!MasjidId || !date || !fajr || !dhuhr || !asr || !maghrib || !isha) {
      return NextResponse.json(
        { error: 'All fields are required', received: body },
        { status: 400 }
      );
    }

    const prayerDate = new Date(date);
    prayerDate.setHours(0, 0, 0, 0);

    const prayerTimes = await prisma.prayerTime.upsert({
      where: {
        masjidId_date: {
          masjidId: MasjidId,
          date: prayerDate,
        },
      },
      update: {
        fajr,
        dhuhr,
        asr,
        maghrib,
        isha,
      },
      create: {
        masjidId: MasjidId,
        date: prayerDate,
        fajr,
        dhuhr,
        asr,
        maghrib,
        isha,
      },
    });

    return NextResponse.json(prayerTimes);
  } catch (error) {
    console.error('Error saving prayer times:', error);
    return NextResponse.json(
      { error: 'Failed to save prayer times' },
      { status: 500 }
    );
  }
}
