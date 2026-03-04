import { prisma } from '@/lib/prisma';
import AdminDashboard from '@/components/AdminDashboard';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function verifyAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth');
  return authCookie?.value === 'true';
}

async function getMasjids() {
  try {
    return await prisma.masjid.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    return [];
  }
}

async function getTodaysPrayerTime(masjidId?: string) {
  try {
    const conditions = {
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
      Masjid: { isActive: true },
    };

    if (masjidId) {
      return await prisma.prayerTime.findFirst({
        where: {
          ...conditions,
          masjidId: masjidId,
        },
        include: { Masjid: true },
        orderBy: { date: 'desc' },
      });
    }

    return await prisma.prayerTime.findFirst({
      where: conditions,
      include: { Masjid: true },
      orderBy: { date: 'desc' },
    });
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const isAuthenticated = await verifyAuth();
  
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const masjids = await getMasjids();
  const todaysPrayer = await getTodaysPrayerTime();

  const today = new Date().toISOString().split('T')[0];

  return (
    <main className="min-h-screen relative bg-[#022c22] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-800/40 via-[#022c22] to-[#011a14] selection:bg-emerald-500/30 text-emerald-50">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 bg-emerald-400/10 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl relative z-10">
        
        {/* --- Upgraded Header Section --- */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 pb-6 border-b border-emerald-800/50 gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-50 to-emerald-200 tracking-tight mb-2">
              Admin Portal
            </h1>
            <p className="text-emerald-400/80 font-medium">
              Manage locations and update daily prayer schedules
            </p>
          </div>
          
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-100 font-medium transition-all shadow-lg shadow-emerald-950/50 active:scale-95 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 group-hover:-translate-x-1 transition-transform">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Site
          </a>
        </header>

        {/* --- Render the Client Component --- */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <AdminDashboard
            masjids={masjids}
            todaysPrayer={todaysPrayer}
            today={today}
          />
        </div>

      </div>
    </main>
  );
}
