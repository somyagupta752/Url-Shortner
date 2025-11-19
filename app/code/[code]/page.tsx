'use client';
import { Url } from '@prisma/client';
import { useParams } from 'next/navigation';
import React, { use, useEffect, useState } from 'react'
const page = () => {
  const [info, setInfo] = useState<Url|null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const code = params.code;
        const response = await fetch(`/api/links/${code}`);
        const data = await response.json();
        setInfo(data);
      } catch (error) {
        console.error('Error fetching URL info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [params.code]);

  const handleCopy = async () => {
    if (!info) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const short = origin ? `${origin}/${info.code}` : info.code;
    try {
      await navigator.clipboard.writeText(short);
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent border-cyan-400 animate-spin" />
          <div className="text-cyan-300">Loading URL information...</div>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="text-red-400">No data found for this code.</div>
      </div>
    );
  }

  return (
  <div className="min-h-screen relative overflow-hidden bg-linear-to-b from-[#001219] via-[#001e2b] to-[#041025] text-slate-100">
    {/* Decorative sharp gradient shapes */}
    <div
      aria-hidden
      className="absolute -top-32 -left-40 w-[600px] h-[600px] transform-gpu rotate-12 opacity-30"
      style={{
        background: 'linear-gradient(135deg,#7c3aed 0%,#06b6d4 100%)',
        clipPath: 'polygon(0 0, 100% 10%, 85% 100%, 0% 85%)',
      }}
    />

    <div
      aria-hidden
      className="absolute -bottom-40 -right-36 w-[500px] h-[500px] transform-gpu -rotate-12 opacity-25"
      style={{
        background: 'linear-gradient(180deg,#ef4444 0%,#f97316 100%)',
        clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 0 100%)',
      }}
    />

    <main className="relative z-10 max-w-4xl mx-auto p-8 md:p-12">
      <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-cyan-200 via-indigo-200 to-pink-200">URL Details</h1>
        <div className="text-sm text-slate-400">Code: <span className="ml-2 px-2 py-1 rounded bg-white/5 text-cyan-200 font-medium">{info.code}</span></div>
      </div>

      <section className="p-6 rounded-2xl bg-white/5 ring-1 ring-white/6 shadow-xl backdrop-blur-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-100 mb-2">Original URL</h2>
                        <a href={info.url} target="_blank" rel="noreferrer" className="block wrap-break-word text-cyan-200 underline">{info.url}</a>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-linear-to-br from-[#06283d]/40 to-[#03122a]/20">
                <div className="text-sm text-slate-300">Clicks</div>
                <div className="text-2xl font-bold text-white">{info.clicks}</div>
              </div>
                            <div className="p-3 rounded-lg bg-linear-to-br from-[#1f2937]/30 to-[#061013]/10">
                <div className="text-sm text-slate-300">Created</div>
                <div className="text-base text-slate-100">{new Date(info.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </div>

                    <aside className="w-full md:w-56 shrink-0">
                        <div className="p-4 rounded-xl bg-linear-to-tr from-[#0f172a]/60 to-[#04263a]/30 ring-1 ring-white/8">
              <div className="text-xs text-slate-400 mb-2">Short link</div>
              <div className="font-mono text-sm break-all text-white bg-white/3 p-2 rounded">{typeof window !== 'undefined' ? `${window.location.origin}/${info.code}` : info.code}</div>
              <button onClick={handleCopy} className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-semibold">Copy</button>
            </div>
          </aside>
        </div>

        {info.lastClicked && (
          <div className="mt-6 text-sm text-slate-300">Last clicked: <span className="text-slate-100 ml-2">{new Date(info.lastClicked).toLocaleString()}</span></div>
        )}
      </section>
    </main>
  </div>
  )
}

export default page
