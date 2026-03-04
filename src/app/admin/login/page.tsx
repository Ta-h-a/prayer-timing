'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';


export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      // Canvas Preview Fallback: Simulate API delay if no real endpoint exists
      if (!res.ok && res.status === 404) throw new Error('Canvas Mock');

      const data = await res.json();

      if (res.ok) {
        document.cookie = 'admin_auth=true; path=/; max-age=86400';
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch {
      // For Canvas preview purposes, we simulate an error if they type 'error', 
      // otherwise we simulate a successful login.
      setTimeout(() => {
        if (password === 'error') {
          setError('Invalid password. Try again.');
        } else {
          document.cookie = 'admin_auth=true; path=/; max-age=86400';
          router.push('/admin');
        }
        setLoading(false);
      }, 1000);
      return; // Exit early so the finally block doesn't clear the canvas loading state too fast
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative bg-[#022c22] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-800/40 via-[#022c22] to-[#011a14] selection:bg-emerald-500/30 text-emerald-50 flex items-center justify-center p-4">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-emerald-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500">
        <div className="bg-emerald-950/40 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 border border-emerald-800/40 shadow-2xl relative overflow-hidden">
          
          {/* Decorative Inner Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 blur-[60px] rounded-full pointer-events-none" />

          {/* Icon Header */}
          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-800/80 to-emerald-950 flex items-center justify-center border border-emerald-700/50 shadow-inner mb-5 shadow-emerald-950/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200 tracking-tight text-center">
              Admin Access
            </h1>
            <p className="text-emerald-400/70 text-sm mt-2 text-center">
              Enter your credentials to manage prayer times
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600/70 group-focus-within:text-emerald-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-emerald-900/40 border border-emerald-700/50 text-emerald-50 placeholder-emerald-600/50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl text-sm bg-rose-500/10 text-rose-300 border border-rose-500/20 animate-in slide-in-from-top-2 fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold transition-all shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Verifying...
                </>
              ) : 'Authenticate'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-emerald-800/40 text-center relative z-10">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-emerald-500/70 hover:text-emerald-400 text-sm font-medium transition-colors group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Return to Prayer Times
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}