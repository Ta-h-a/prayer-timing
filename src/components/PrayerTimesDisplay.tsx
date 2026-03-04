'use client';

import { useState, useEffect } from 'react';

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
}

interface PrayerTimesDisplayProps {
  masjids: Masjid[];
}

const prayers = [
  { name: 'Fajr', key: 'fajr', arabic: 'فجر' },
  { name: 'Dhuhr', key: 'dhuhr', arabic: 'ظهر' },
  { name: 'Asr', key: 'asr', arabic: 'عصر' },
  { name: 'Maghrib', key: 'maghrib', arabic: 'مغرب' },
  { name: 'Isha', key: 'isha', arabic: 'عشاء' },
];

function to12HourFormat(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

function getCurrentAndNextPrayer(prayerTimes: PrayerTime) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayerMinutes: Record<string, number> = {};
  
  const timeFields: (keyof PrayerTime)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  for (const p of prayers) {
    const key = p.key as keyof PrayerTime;
    if (timeFields.includes(key)) {
      const time = prayerTimes[key];
      if (typeof time === 'string') {
        const [hours, minutes] = time.split(':').map(Number);
        prayerMinutes[p.key] = hours * 60 + minutes;
      }
    }
  }

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

function getMasjidFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'selected_masjid') return value;
  }
  return null;
}

function setMasjidCookie(masjidId: string) {
  document.cookie = `selected_masjid=${masjidId}; path=/; max-age=31536000; SameSite=Lax`;
}

async function fetchPrayerTimes(masjidId: string): Promise<PrayerTime | null> {
  try {
    const res = await fetch(`/api/prayer-times?masjidId=${encodeURIComponent(masjidId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function PrayerTimesDisplay({ masjids }: PrayerTimesDisplayProps) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [selectedMasjidId, setSelectedMasjidId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (masjids.length === 0) return;
    
    const cookieMasjid = getMasjidFromCookie();
    const validCookieMasjid = cookieMasjid && masjids.some(m => m.id === cookieMasjid);
    const initialMasjid = validCookieMasjid ? cookieMasjid : masjids[0]?.id;
    
    if (initialMasjid) {
      setSelectedMasjidId(initialMasjid);
    }
  }, [masjids]);

  useEffect(() => {
    if (!selectedMasjidId || masjids.length === 0) return;

    setLoading(true);
    setMasjidCookie(selectedMasjidId);

    fetchPrayerTimes(selectedMasjidId).then((data) => {
      setPrayerTimes(data);
      setLoading(false);
    });
  }, [selectedMasjidId, masjids.length]);

  useEffect(() => {
    if (!prayerTimes) return;

    const { nextPrayer } = getCurrentAndNextPrayer(prayerTimes);
    if (!nextPrayer) return;

    const updateTimer = () => {
      const time = prayerTimes[nextPrayer.key as keyof PrayerTime];
      if (typeof time === 'string') {
        setTimeLeft(getTimeRemaining(time));
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [prayerTimes]);

  const handleMasjidChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMasjidId(e.target.value);
  };

  const selectedMasjid = masjids.find(m => m.id === selectedMasjidId);
  const { currentPrayer, nextPrayer } = prayerTimes 
    ? getCurrentAndNextPrayer(prayerTimes) 
    : { currentPrayer: null, nextPrayer: null };

  const updatedDate = prayerTimes?.updatedAt ? formatUpdatedAt(prayerTimes.updatedAt) : '';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <p className="text-emerald-200/70 text-lg font-light">Loading prayer times...</p>
      </div>
    );
  }

  if (!prayerTimes || !nextPrayer) {
    return (
      <div className="flex flex-col items-center justify-center p-10 md:p-16 mt-8 bg-emerald-950/40 border border-emerald-800/40 rounded-[2rem] backdrop-blur-xl">
        <div className="w-16 h-16 mb-4 rounded-full bg-emerald-900/40 flex items-center justify-center border border-emerald-700/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-300">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
          </svg>
        </div>
        <h3 className="text-xl md:text-2xl font-semibold text-emerald-50 mb-2">No Prayer Times</h3>
        <p className="text-emerald-300/70 text-center max-w-sm">
          Prayer times for this location are not available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Masjid Selector */}
      {masjids.length > 1 && (
        <div className="flex justify-center">
          <div className="relative">
            <select
              value={selectedMasjidId}
              onChange={handleMasjidChange}
              className="appearance-none px-6 py-3 pr-12 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-100 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer backdrop-blur-md"
            >
              {masjids.map((m) => (
                <option key={m.id} value={m.id} className="bg-emerald-950">
                  {m.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Next Prayer Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-900/80 via-emerald-800/60 to-teal-900/60 border border-emerald-600/30 backdrop-blur-xl shadow-2xl shadow-emerald-900/30 p-8 md:p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative text-center">
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-700/30 text-emerald-200 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Next Prayer
          </p>
          
          <div className="text-5xl md:text-7xl font-extrabold text-white mb-3 tracking-tight">
            {nextPrayer.name}
          </div>
          
          <div className="text-3xl md:text-4xl font-bold text-emerald-300 mb-8">
            {to12HourFormat(prayerTimes[nextPrayer.key as keyof PrayerTime] as string)}
          </div>
          
          {/* Countdown */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-950/40 border border-emerald-700/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <div className="flex items-center gap-1 text-xl font-mono text-emerald-100">
              <span className="w-12 text-center">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-emerald-500">:</span>
              <span className="w-12 text-center">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-emerald-500">:</span>
              <span className="w-12 text-center">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        {prayers.map((prayer) => {
          const isCurrent = currentPrayer?.key === prayer.key;
          const isNext = nextPrayer?.key === prayer.key;
          const time = prayerTimes[prayer.key as keyof PrayerTime] as string;

          return (
            <div
              key={prayer.key}
              className={`
                relative overflow-hidden rounded-2xl p-4 md:p-6 transition-all duration-300
                ${isCurrent 
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30 scale-105 z-10' 
                  : isNext 
                  ? 'bg-emerald-800/50 border-2 border-emerald-400/40' 
                  : 'bg-emerald-900/30 border border-emerald-800/30 hover:bg-emerald-800/40'
                }
              `}
            >
              {isCurrent && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/20 text-xs font-medium text-white">
                    Now
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-xs md:text-sm font-medium text-emerald-200/80 mb-1">{prayer.name}</div>
                <div className={`text-xl md:text-2xl font-bold ${isCurrent ? 'text-white' : 'text-emerald-50'}`}>
                  {time ? to12HourFormat(time) : '--:--'}
                </div>
                <div className="text-xs text-emerald-300/50 mt-1">{prayer.arabic}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Last Updated */}
      <div className="text-center">
        <p className="text-emerald-500/60 text-sm">
          Last updated: {updatedDate}
        </p>
      </div>
    </div>
  );
}
