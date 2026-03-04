import { prisma } from '@/lib/prisma';
import PrayerTimesDisplay from '@/components/PrayerTimesDisplay';

export const revalidate = 60;

async function getMasjids() {
  try {
    return await prisma.masjid.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const masjids = await getMasjids();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen relative bg-[#022c22] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-800/40 via-[#022c22] to-[#011a14] selection:bg-emerald-500/30 text-emerald-50 flex flex-col">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 bg-emerald-400/10 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 py-12 flex-grow flex flex-col relative z-10">
        
        {/* --- Header Section --- */}
        <header className="flex flex-col items-center justify-center mb-16 pt-8 text-center">
          {/* Date Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-200 text-sm font-medium mb-6 shadow-sm backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            <span>{today}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-50 via-teal-100 to-emerald-200 drop-shadow-sm mb-4">
            Prayer Times
          </h1>
          
          <p className="text-emerald-300/80 max-w-md text-base md:text-lg font-light">
            Find accurate prayer schedules for your local masjids
          </p>
        </header>

        {/* --- Content Section --- */}
        <div className="w-full max-w-5xl mx-auto flex-grow">
          {masjids.length > 0 ? (
            <PrayerTimesDisplay masjids={masjids} />
          ) : (
            /* Premium Empty State */
            <div className="flex flex-col items-center justify-center p-10 md:p-16 mt-8 bg-emerald-950/40 border border-emerald-800/40 rounded-[2rem] backdrop-blur-xl shadow-2xl transition-all duration-500">
              <div className="w-20 h-20 mb-6 rounded-full bg-emerald-900/40 flex items-center justify-center border border-emerald-700/50 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300 drop-shadow-md">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold text-emerald-50 mb-3 tracking-wide">
                No Locations Found
              </h3>
              <p className="text-emerald-300/80 text-center max-w-md text-lg leading-relaxed">
                We couldn't find any prayer times right now. Please check back later or contact your administrator to set them up.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* --- Footer Section --- */}
      <footer className="w-full py-8 mt-auto flex justify-center border-t border-emerald-900/50 bg-[#011a14]/50 backdrop-blur-sm z-10">
        <a
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 hover:text-emerald-400 transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>Admin Access</span>
        </a>
      </footer>
    </main>
  );
}