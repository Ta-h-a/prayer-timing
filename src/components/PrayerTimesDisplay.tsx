'use client';

import { useState, useEffect } from 'react';

// --- Interfaces ---
interface Masjid {
  id: string;
  name: string;
  location: string;
}

interface PrayerTime {
  id: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  updatedAt: Date | string;
  Masjid: {
    name: string;
    location: string;
  };
  [key: string]: any;
}

interface PrayerTimesDisplayProps {
  masjids?: Masjid[];
}

// --- Icons & Data ---
const prayers = [
  { 
    name: 'Fajr', key: 'fajr', arabic: 'فجر',
    icon: <path d="M12 2v8 M4.93 10.93l1.41 1.41 M2 18h20 M19.07 10.93l-1.41 1.41 M22 22H2 M8 6l4-4 4 4 M16 18a4 4 0 0 0-8 0" /> 
  },
  { 
    name: 'Dhuhr', key: 'dhuhr', arabic: 'ظهر',
    icon: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41" /></>
  },
  { 
    name: 'Asr', key: 'asr', arabic: 'عصر',
    icon: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41" /></>
  },
  { 
    name: 'Maghrib', key: 'maghrib', arabic: 'مغرب',
    icon: <path d="M12 10v4 M4.93 10.93l1.41 1.41 M2 18h20 M19.07 10.93l-1.41 1.41 M22 22H2 M16 5l-4 4-4-4 M16 18a4 4 0 0 0-8 0" />
  },
  { 
    name: 'Isha', key: 'isha', arabic: 'عشاء',
    icon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  },
];

const MOCK_MASJIDS = [
  { id: '1', name: 'Central Grand Mosque', location: 'Downtown' },
  { id: '2', name: 'Community Islamic Center', location: 'Suburbs' }
];

// --- Helper Functions ---
function to12HourFormat(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

function getCurrentAndNextPrayer(prayerTimes: PrayerTime) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayerMinutes: { [key: string]: number } = {};
  prayers.forEach((p) => {
    const [hours, minutes] = (prayerTimes as any)[p.key].split(':').map(Number);
    prayerMinutes[p.key] = hours * 60 + minutes;
  });

  let currentPrayer = null;
  let nextPrayer = null;

  const prayerOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  for (let i = 0; i < prayerOrder.length; i++) {
    const prayer = prayerOrder[i];
    if (currentTime < prayerMinutes[prayer]) {
      nextPrayer = prayers.find((p) => p.key === prayer);
      if (i > 0) {
        currentPrayer = prayers.find((p) => p.key === prayerOrder[i - 1]);
      }
      break;
    }
  }

  if (!nextPrayer && currentTime >= prayerMinutes['isha']) {
    currentPrayer = prayers.find((p) => p.key === 'isha');
  }

  return { currentPrayer, nextPrayer };
}

function getTimeRemaining(targetTime: string) {
  const now = new Date();
  const [hours, minutes] = targetTime.split(':').map(Number);
  
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const diff = target.getTime() - now.getTime();
  const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secondsRemaining = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours: hoursRemaining, minutes: minutesRemaining, seconds: secondsRemaining };
}

function formatUpdatedAt(dateInput: string | Date) {
  const date = new Date(dateInput);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

async function fetchPrayerTimes(masjidId: string): Promise<PrayerTime | null> {
  try {
    const res = await fetch('/api/prayer-times', {
      headers: { 'x-masjid-id': masjidId },
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch (error) {
    // Return dummy data for Canvas preview so the UI can be visualized
    const now = new Date();
    const futureHour = (now.getHours() + 2) % 24;
    return {
      id: 'mock-1',
      fajr: '05:30',
      dhuhr: '12:45',
      asr: '15:45',
      maghrib: `${String(futureHour).padStart(2, '0')}:${String(now.getMinutes() + 15).padStart(2, '0')}`, // Dynamic to always show a countdown
      isha: '20:00',
      updatedAt: new Date().toISOString(),
      Masjid: { name: 'Mock Mosque', location: 'Mock City' }
    };
  }
}

async function setMasjidCookie(masjidId: string) {
  document.cookie = `selected_masjid=${masjidId}; path=/; max-age=31536000; SameSite=Lax`;
}

function getMasjidFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'selected_masjid') return value;
  }
  return null;
}


// --- Main Component ---
export default function PrayerTimesDisplay({ masjids = MOCK_MASJIDS }: PrayerTimesDisplayProps) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [selectedMasjidId, setSelectedMasjidId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (masjids.length === 0) return;
    
    const cookieMasjid = getMasjidFromCookie();
    const initialMasjid = cookieMasjid && masjids.find(m => m.id === cookieMasjid) 
      ? cookieMasjid 
      : masjids[0]?.id;
    
    if (initialMasjid && initialMasjid !== selectedMasjidId) {
      setSelectedMasjidId(initialMasjid);
    } else if (!selectedMasjidId && initialMasjid) {
      setSelectedMasjidId(initialMasjid);
    }
  }, [masjids, selectedMasjidId]);

  useEffect(() => {
    if (!selectedMasjidId || selectedMasjidId === '') return;

    setLoading(true);
    setMasjidCookie(selectedMasjidId);

    fetchPrayerTimes(selectedMasjidId).then((data) => {
      setPrayerTimes(data);
      setLoading(false);
    });
  }, [selectedMasjidId]);

  useEffect(() => {
    if (!prayerTimes || !prayerTimes.id) return;

    const { nextPrayer } = getCurrentAndNextPrayer(prayerTimes);
    if (!nextPrayer) return;

    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(prayerTimes[nextPrayer.key]));
    }, 1000);

    setTimeLeft(getTimeRemaining(prayerTimes[nextPrayer.key]));

    return () => clearInterval(timer);
  }, [prayerTimes]);

  const handleMasjidChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMasjidId(e.target.value);
  };

  const selectedMasjid = masjids.find(m => m.id === selectedMasjidId);
  const { currentPrayer, nextPrayer } = prayerTimes && prayerTimes.id 
    ? getCurrentAndNextPrayer(prayerTimes) 
    : { currentPrayer: null, nextPrayer: null };

  const updatedDate = prayerTimes?.updatedAt ? formatUpdatedAt(prayerTimes.updatedAt) : '';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* --- Masjid Selector --- */}
      {masjids.length > 1 && (
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="relative group">
            <select
              value={selectedMasjidId}
              onChange={handleMasjidChange}
              className="appearance-none pl-6 pr-12 py-3 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-50 text-lg sm:text-xl font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-md transition-all cursor-pointer hover:bg-emerald-900/60 shadow-lg shadow-emerald-950/50"
            >
              {masjids.map((m) => (
                <option key={m.id} value={m.id} className="bg-emerald-900 text-base">
                  {m.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          {selectedMasjid && (
            <div className="flex items-center gap-1.5 text-emerald-400/70 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {selectedMasjid.location}
            </div>
          )}
        </div>
      )}

      {loading ? (
        // --- Beautiful Skeleton Loader ---
        <div className="space-y-6">
          <div className="h-[280px] w-full bg-emerald-900/20 animate-pulse rounded-[2.5rem] border border-emerald-800/30"></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[140px] bg-emerald-900/20 animate-pulse rounded-2xl border border-emerald-800/30"></div>
            ))}
          </div>
        </div>
      ) : prayerTimes && nextPrayer ? (
        <>
          {/* --- Next Prayer Hero Card --- */}
          <div className="relative overflow-hidden bg-gradient-to-b from-emerald-900/40 to-emerald-950/40 border border-emerald-700/50 rounded-[2.5rem] p-8 md:p-12 text-center backdrop-blur-xl shadow-2xl shadow-emerald-950/50 group">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-full bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Up Next
              </div>
              
              <h2 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-white drop-shadow-sm mb-2 tracking-tight">
                {nextPrayer.name}
              </h2>
              
              <div className="text-2xl md:text-3xl font-medium text-emerald-300/90 mb-8">
                {to12HourFormat(prayerTimes[nextPrayer.key])}
              </div>
              
              {/* Countdown Segmented Display */}
              <div className="flex items-center justify-center gap-3 sm:gap-6 text-emerald-50">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-emerald-950/80 border border-emerald-700/50 rounded-2xl shadow-inner backdrop-blur-md">
                    <span className="text-3xl sm:text-4xl font-mono font-bold tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-emerald-400/80 font-medium uppercase tracking-widest mt-2">Hours</span>
                </div>
                <div className="text-2xl sm:text-4xl font-light text-emerald-600/50 pb-6">:</div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-emerald-950/80 border border-emerald-700/50 rounded-2xl shadow-inner backdrop-blur-md">
                    <span className="text-3xl sm:text-4xl font-mono font-bold tabular-nums">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-emerald-400/80 font-medium uppercase tracking-widest mt-2">Mins</span>
                </div>
                <div className="text-2xl sm:text-4xl font-light text-emerald-600/50 pb-6">:</div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-emerald-950/80 border border-emerald-700/50 rounded-2xl shadow-inner backdrop-blur-md">
                    <span className="text-3xl sm:text-4xl font-mono font-bold tabular-nums text-emerald-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-emerald-400/80 font-medium uppercase tracking-widest mt-2">Secs</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- Prayer Times Grid --- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {prayers.map((prayer) => {
              const isCurrent = currentPrayer?.key === prayer.key;
              const isNext = nextPrayer?.key === prayer.key;

              return (
                <div
                  key={prayer.key}
                  className={`
                    relative overflow-hidden rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all duration-500
                    ${
                      isCurrent
                        ? 'bg-gradient-to-br from-amber-900/60 to-orange-950/60 border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/30 scale-[1.02]'
                        : isNext
                        ? 'bg-emerald-900/40 border border-emerald-400/60 shadow-[0_0_20px_rgba(52,211,153,0.15)] ring-1 ring-emerald-400/30'
                        : 'bg-emerald-950/30 border border-emerald-800/30 hover:bg-emerald-900/30 hover:border-emerald-700/50'
                    }
                    backdrop-blur-md
                  `}
                >
                  {/* Status Badge */}
                  {isCurrent && (
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-orange-500/20 text-[10px] font-bold text-orange-400 uppercase tracking-wider border border-orange-500/30">
                      Now
                    </span>
                  )}
                  {isNext && (
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider border border-emerald-500/30">
                      Next
                    </span>
                  )}

                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" 
                    viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" 
                    className={`mb-3 mt-4 ${isCurrent ? 'text-orange-400' : isNext ? 'text-emerald-400' : 'text-emerald-600/70'}`}
                  >
                    {prayer.icon}
                  </svg>
                  
                  <div className={`text-lg font-bold mb-0.5 tracking-wide ${isCurrent ? 'text-orange-50' : 'text-emerald-50'}`}>
                    {prayer.name}
                  </div>
                  <div className={`text-xl font-medium tabular-nums ${isCurrent ? 'text-orange-200' : isNext ? 'text-emerald-200' : 'text-emerald-100/80'}`}>
                    {to12HourFormat(prayerTimes[prayer.key])}
                  </div>
                  <div className={`text-sm mt-1 font-arabic ${isCurrent ? 'text-orange-400/70' : 'text-emerald-500/60'}`}>
                    {prayer.arabic}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-900/50">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500/50"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
               <p className="text-emerald-500/60 text-xs font-medium">
                Last synced: {updatedDate}
              </p>
            </div>
          </div>
        </>
      ) : (
        // --- Empty State ---
        <div className="flex flex-col items-center justify-center p-12 bg-emerald-950/40 border border-emerald-800/40 rounded-[2rem] backdrop-blur-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-800 mb-4">
            <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          <p className="text-emerald-50 text-xl font-medium mb-2">No Schedule Available</p>
          <p className="text-emerald-400/70 text-center max-w-sm">
            Prayer times have not been configured for this location yet. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
}