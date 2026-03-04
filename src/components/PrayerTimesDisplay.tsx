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

  // Initial load - set selected mosque
  useEffect(() => {
    if (masjids.length === 0) return;
    
    const cookieMasjid = getMasjidFromCookie();
    const validCookieMasjid = cookieMasjid && masjids.some(m => m.id === cookieMasjid);
    const initialMasjid = validCookieMasjid ? cookieMasjid : masjids[0]?.id;
    
    if (initialMasjid) {
      setSelectedMasjidId(initialMasjid);
    }
  }, [masjids]);

  // Fetch prayer times when mosque changes
  useEffect(() => {
    if (!selectedMasjidId || masjids.length === 0) return;

    setLoading(true);
    setMasjidCookie(selectedMasjidId);

    fetchPrayerTimes(selectedMasjidId).then((data) => {
      setPrayerTimes(data);
      setLoading(false);
    });
  }, [selectedMasjidId, masjids.length]);

  // Countdown timer
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

  return (
    <div className="space-y-8">
      {masjids.length > 1 && (
        <div className="flex justify-center">
          <select
            value={selectedMasjidId}
            onChange={handleMasjidChange}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {masjids.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-800">
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedMasjid && (
        <p className="text-emerald-200 text-lg text-center">{selectedMasjid.name}</p>
      )}

      {loading ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center">
          <p className="text-white">Loading...</p>
        </div>
      ) : prayerTimes && nextPrayer ? (
        <>
          <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 text-center border border-white/10">
            <p className="text-emerald-200 text-sm uppercase tracking-wider mb-2">
              Next Prayer
            </p>
            <div className="text-5xl md:text-6xl font-bold text-white mb-2">
              {nextPrayer.name}
            </div>
            <div className="text-emerald-300 text-2xl">
              {to12HourFormat(prayerTimes[nextPrayer.key as keyof PrayerTime] as string)}
            </div>
            <div className="mt-4 flex justify-center items-center gap-2 text-emerald-100/70">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {prayers.map((prayer) => {
              const isCurrent = currentPrayer?.key === prayer.key;
              const isNext = nextPrayer?.key === prayer.key;
              const time = prayerTimes[prayer.key as keyof PrayerTime] as string;

              return (
                <div
                  key={prayer.key}
                  className={`
                    relative overflow-hidden rounded-2xl p-6 transition-all duration-300
                    ${
                      isCurrent
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30 scale-105'
                        : isNext
                        ? 'bg-white/30 backdrop-blur-lg border-2 border-emerald-400/50'
                        : 'bg-white/10 backdrop-blur-lg border border-white/5 hover:bg-white/20'
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
                    <div className="text-2xl font-bold text-white mb-1">{prayer.name}</div>
                    <div className="text-3xl font-bold text-white">{time ? to12HourFormat(time) : '--:--'}</div>
                    <div className="text-white/60 text-sm mt-1">{prayer.arabic}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-emerald-400/60 text-sm">
              Last updated: {updatedDate}
            </p>
          </div>
        </>
      ) : (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center">
          <p className="text-white text-xl">No prayer times available.</p>
          <p className="text-emerald-200/70 mt-2">
            Please contact the administrator to set up prayer times.
          </p>
        </div>
      )}
    </div>
  );
}
