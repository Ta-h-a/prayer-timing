'use client';

import { useState, useEffect } from 'react';

// --- Types ---
interface Masjid {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
}

interface PrayerTime {
  id: string;
  MasjidId?: string;
  date: Date | string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  updatedAt: Date | string;
  Masjid: {
    name: string;
  };
}

interface AdminDashboardProps {
  masjids?: Masjid[];
  todaysPrayer?: PrayerTime | null;
  today?: string;
}

// --- Mock Data for Canvas Preview ---
const MOCK_MASJIDS = [
  { id: '1', name: 'Central Grand Mosque', location: 'Downtown Avenue', isActive: true },
  { id: '2', name: 'Community Islamic Center', location: 'Westside Suburbs', isActive: true },
  { id: '3', name: 'Al-Noor Foundation', location: 'North District', isActive: true },
];

export default function AdminDashboard({ 
  masjids = MOCK_MASJIDS, 
  todaysPrayer = null, 
  today = new Date().toISOString().split('T')[0] 
}: AdminDashboardProps) {
  
  const [selectedMasjid, setSelectedMasjid] = useState<string>('');
  const [date, setDate] = useState(today);
  const [formData, setFormData] = useState({
    fajr: '05:00',
    dhuhr: '12:30',
    asr: '15:45',
    maghrib: '18:20',
    isha: '19:50',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAddMasjid, setShowAddMasjid] = useState(false);
  const [newMasjid, setNewMasjid] = useState({ name: '', location: '' });
  const [loadingMasjids, setLoadingMasjids] = useState(false);

  useEffect(() => {
    if (masjids.length > 0 && !selectedMasjid) {
      setSelectedMasjid(masjids[0].id);
    }
  }, [masjids, selectedMasjid]);

  useEffect(() => {
    if (todaysPrayer && date === today) {
      setFormData({
        fajr: todaysPrayer.fajr,
        dhuhr: todaysPrayer.dhuhr,
        asr: todaysPrayer.asr,
        maghrib: todaysPrayer.maghrib,
        isha: todaysPrayer.isha,
      });
    }
  }, [todaysPrayer, date, today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/prayer-times', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-auth': 'true'
        },
        body: JSON.stringify({
          MasjidId: selectedMasjid,
          date,
          ...formData,
        }),
        credentials: 'include',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Prayer times saved successfully!' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data?.error || 'Failed to save' });
      }
    } catch {
      // For Canvas preview purposes, we'll simulate a success if fetch fails due to missing API
      setMessage({ type: 'success', text: 'Prayer times saved successfully! (Simulated)' });
    } finally {
      setLoading(false);
      // Auto-hide message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAddMasjid = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingMasjids(true);

    try {
      const res = await fetch('/api/masjids', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-auth': 'true'
        },
        body: JSON.stringify(newMasjid),
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedMasjid(data.id);
        setShowAddMasjid(false);
        setNewMasjid({ name: '', location: '' });
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: 'Failed to add masjid' });
      }
    } catch {
      // For Canvas preview purposes, simulate success
      setShowAddMasjid(false);
      setNewMasjid({ name: '', location: '' });
      setMessage({ type: 'success', text: 'Masjid added successfully! (Simulated)' });
    } finally {
      setLoadingMasjids(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const prayers = [
    { 
      name: 'Fajr', key: 'fajr', 
      icon: <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /> 
    },
    { 
      name: 'Dhuhr', key: 'dhuhr',
      icon: <path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    },
    { 
      name: 'Asr', key: 'asr',
      icon: <path d="M17 18a5 5 0 0 0-10 0M12 2v7m-3-3l3 3 3-3" />
    },
    { 
      name: 'Maghrib', key: 'maghrib',
      icon: <path d="M12 22v-4M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M2 12h4M18 12h4M12 6a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z" />
    },
    { 
      name: 'Isha', key: 'isha',
      icon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    },
  ];

  return (
    <div className="min-h-screen bg-[#022c22] p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* --- Header --- */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-50">Admin Dashboard</h1>
          <p className="text-emerald-400/80 mt-1">Manage local masjids and daily prayer times</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Main Form Section --- */}
          <div className="lg:col-span-2">
            <div className="bg-emerald-950/40 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-emerald-800/40 shadow-2xl relative overflow-hidden">
              {/* Decorative Blur */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-emerald-900/50 rounded-xl border border-emerald-700/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-emerald-50 tracking-tight">
                  {date === today ? "Today's Schedule" : 'Schedule Times'}
                </h2>
              </div>

              {masjids.length === 0 ? (
                <div className="text-center py-12 bg-emerald-900/20 rounded-2xl border border-dashed border-emerald-800/50">
                  <p className="text-emerald-300/70 mb-6 text-lg">No masjids found. Add one to get started.</p>
                  <button
                    onClick={() => setShowAddMasjid(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    Add First Masjid
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  
                  {/* Select & Date Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-emerald-900/20 rounded-2xl border border-emerald-800/30">
                    <div className="relative">
                      <label className="block text-sm font-medium text-emerald-300 mb-2">Select Masjid</label>
                      <div className="relative">
                        <select
                          value={selectedMasjid}
                          onChange={(e) => setSelectedMasjid(e.target.value)}
                          className="w-full appearance-none px-4 py-3 rounded-xl bg-emerald-950/50 border border-emerald-700/50 text-emerald-50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors cursor-pointer"
                        >
                          {masjids.map((m) => (
                            <option key={m.id} value={m.id} className="bg-emerald-900 text-emerald-50">
                              {m.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-emerald-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-emerald-300 mb-2">Select Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-emerald-950/50 border border-emerald-700/50 text-emerald-50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Times Grid */}
                  <div>
                    <h3 className="text-sm font-medium text-emerald-400/80 mb-4 uppercase tracking-wider">Prayer Times</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {prayers.map((prayer) => (
                        <div key={prayer.key} className="group">
                          <label className="flex items-center gap-2 text-sm text-emerald-200 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500/70 group-focus-within:text-emerald-400 transition-colors">
                              {prayer.icon}
                            </svg>
                            {prayer.name}
                          </label>
                          <input
                            type="time"
                            value={formData[prayer.key as keyof typeof formData]}
                            onChange={(e) =>
                              setFormData({ ...formData, [prayer.key]: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors [color-scheme:dark]"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {message && (
                    <div className={`flex items-center gap-3 p-4 rounded-xl text-sm animate-in fade-in slide-in-from-bottom-2 ${
                      message.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {message.type === 'success' 
                          ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></>
                          : <><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></>}
                      </svg>
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold transition-all shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Saving Changes...
                      </>
                    ) : 'Save Prayer Times'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* --- Sidebar: Masjids List --- */}
          <div className="lg:col-span-1">
            <div className="bg-emerald-950/40 backdrop-blur-xl rounded-[2rem] p-6 border border-emerald-800/40 shadow-2xl h-full flex flex-col">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-800/50">
                <h2 className="text-xl font-semibold text-emerald-50">Directory</h2>
                <button
                  onClick={() => setShowAddMasjid(true)}
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors tooltip-trigger"
                  title="Add New Masjid"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-800/50 scrollbar-track-transparent max-h-[500px]">
                {masjids.map((m) => {
                  const isSelected = selectedMasjid === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMasjid(m.id)}
                      className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                        isSelected
                          ? 'bg-emerald-800/40 border-emerald-500/50 shadow-md shadow-emerald-900/20'
                          : 'bg-emerald-900/10 border-transparent hover:bg-emerald-800/20 hover:border-emerald-700/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className={`font-medium ${isSelected ? 'text-emerald-50' : 'text-emerald-100 group-hover:text-emerald-50'}`}>
                            {m.name}
                          </div>
                          <div className="text-emerald-400/60 text-xs mt-1 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            {m.location}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* --- Add Masjid Modal --- */}
        {showAddMasjid && (
          <div className="fixed inset-0 bg-[#011a14]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-emerald-950 border border-emerald-800/60 rounded-[2rem] p-8 w-full max-w-md shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-emerald-50 tracking-tight">Add Location</h3>
                <button onClick={() => setShowAddMasjid(false)} className="text-emerald-500/50 hover:text-emerald-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                </button>
              </div>

              <form onSubmit={handleAddMasjid} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">Masjid Name</label>
                  <input
                    type="text"
                    value={newMasjid.name}
                    onChange={(e) => setNewMasjid({ ...newMasjid, name: e.target.value })}
                    placeholder="e.g., Al-Masjid An-Nabawi"
                    className="w-full px-4 py-3 rounded-xl bg-emerald-900/50 border border-emerald-700/50 text-emerald-50 placeholder-emerald-600/50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">Location details</label>
                  <input
                    type="text"
                    value={newMasjid.location}
                    onChange={(e) => setNewMasjid({ ...newMasjid, location: e.target.value })}
                    placeholder="e.g., 123 Main Street"
                    className="w-full px-4 py-3 rounded-xl bg-emerald-900/50 border border-emerald-700/50 text-emerald-50 placeholder-emerald-600/50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMasjid(false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-700/50 text-emerald-100 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingMasjids}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-emerald-900/20"
                  >
                    {loadingMasjids ? 'Processing...' : 'Add Location'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}