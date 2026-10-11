"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Album = { title: string; artist: string; minutes: number; mood: string; arc: string; colors: string; energy: number[]; initials: string };
const albums: Album[] = [
  { title: "Jubilee", artist: "Japanese Breakfast", minutes: 37, mood: "Bright", arc: "A joyful climb", colors: "from-[#efbc52] via-[#e78a4b] to-[#bd5c37]", energy: [38,65,54,81,92,67,85,58,76,48], initials: "J" },
  { title: "Imaginal Disk", artist: "Magdalena Bay", minutes: 53, mood: "Electric", arc: "Twists & turns", colors: "from-[#8baed4] via-[#5770aa] to-[#423c81]", energy: [47,78,60,92,52,74,93,58,84,68], initials: "I" },
  { title: "Titanic Rising", artist: "Weyes Blood", minutes: 42, mood: "Reflective", arc: "Gentle waves", colors: "from-[#629b9a] via-[#41737d] to-[#2b4d65]", energy: [28,42,56,46,65,53,76,55,43,32], initials: "T" },
  { title: "Melodrama", artist: "Lorde", minutes: 41, mood: "Electric", arc: "Big peaks", colors: "from-[#4168a4] via-[#263b7a] to-[#d17c83]", energy: [70,91,67,82,45,87,73,54,92,40], initials: "M" },
  { title: "Punisher", artist: "Phoebe Bridgers", minutes: 41, mood: "Reflective", arc: "Slow burn", colors: "from-[#7d8897] via-[#545c6c] to-[#282f3a]", energy: [23,35,32,50,43,60,51,70,92,38], initials: "P" },
  { title: "What's Your Pleasure?", artist: "Jessie Ware", minutes: 53, mood: "Bright", arc: "Keep moving", colors: "from-[#d78d8e] via-[#b34c69] to-[#6b365b]", energy: [68,78,74,89,82,73,91,85,76,92], initials: "W" },
];

function EnergyMap({ values, accent = "#d8664a" }: { values: number[]; accent?: string }) {
  const coords = values.map((v, i) => `${(i / (values.length - 1)) * 300},${90 - v * 0.75}`).join(" ");
  return <svg viewBox="0 0 300 100" className="w-full" role="img" aria-label="Illustrative album energy profile">
    <line x1="0" y1="91" x2="300" y2="91" stroke="#d8d1c5" strokeDasharray="3 5" />
    <polygon points={`0,91 ${coords} 300,91`} fill={accent} opacity="0.12" />
    <polyline points={coords} fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export default function JourneyPage() {
  const [mood, setMood] = useState("All");
  const [duration, setDuration] = useState("Any length");
  const [selected, setSelected] = useState<Album | null>(null);
  const filtered = useMemo(() => albums.filter(a => (mood === "All" || a.mood === mood) && (duration === "Any length" || (duration === "Under 45 min" ? a.minutes < 45 : a.minutes >= 45))), [mood, duration]);
  return <main className="min-h-screen bg-[#f7f3e9] text-[#292d28]">
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-6 md:px-10">
      <nav className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#292d28] pb-5">
        <Link href="/journey" className="flex items-center gap-2 text-xl font-black tracking-tight md:text-2xl"><span className="text-3xl">◉</span> album journeys<span className="text-[#d8664a]">✳</span></Link>
        <div className="flex items-center gap-5 text-sm font-semibold"><a href="#discover" className="hover:underline">Discover</a><a href="#how-it-works" className="hover:underline">The idea</a><Link href="/" className="text-[#8b8377] hover:underline">JUKECRAFT ↗</Link></div>
      </nav>

      <section className="grid gap-6 py-10 md:grid-cols-[1.4fr_0.6fr] md:items-end">
        <div><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#bd634a]">A different kind of music discovery ↗</p><h1 className="max-w-2xl text-4xl font-black leading-[1.06] tracking-tight md:text-6xl">Find your next<br/><span className="italic text-[#d8664a]">album adventure.</span></h1><p className="mt-5 max-w-xl text-base leading-relaxed text-[#655f56]">Good albums take you places. Pick one for your next run, wander through its highs and lows, and listen all the way through.</p></div>
        <div className="rotate-[-3deg] rounded-2xl border-2 border-[#292d28] bg-[#e8e0cc] p-5 shadow-[5px_5px_0_#292d28]"><p className="text-sm font-bold">✳ A little note</p><p className="mt-2 text-sm leading-relaxed">These squiggly lines? Think Strava elevation maps, but for the feeling of an album.</p><p className="mt-3 text-xs text-[#716b61]">For now, the curves are illustrative — not audio analysis.</p></div>
      </section>

      <section id="discover" className="scroll-mt-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#bd634a]">The record crate / 001</p><h2 className="mt-1 text-2xl font-black md:text-3xl">Pick a path ↓</h2></div><p className="text-sm text-[#716b61]">{filtered.length} albums to explore</p></div>
        <div className="mb-7 flex flex-wrap items-center gap-3 rounded-xl border border-[#d9d0c0] bg-[#fffcf5] p-3">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider">I'm feeling</span>
          {["All","Bright","Electric","Reflective"].map(v=><button key={v} type="button" onClick={()=>setMood(v)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${mood===v?"border-[#292d28] bg-[#292d28] text-white":"border-[#d9d0c0] bg-white hover:border-[#292d28]"}`}>{v}</button>)}
          <select aria-label="Album duration" value={duration} onChange={e=>setDuration(e.target.value)} className="ml-auto rounded-full border border-[#d9d0c0] bg-white px-4 py-2 text-sm font-semibold"><option>Any length</option><option>Under 45 min</option><option>45+ min</option></select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((album,i)=><button type="button" key={album.title} onClick={()=>setSelected(album)} className="group flex flex-col overflow-hidden rounded-2xl border-2 border-[#292d28] bg-[#fffcf5] text-left shadow-[4px_4px_0_#292d28] transition hover:-translate-y-1 hover:shadow-[6px_7px_0_#292d28]">
            <div className={`relative flex aspect-[1.35] items-center justify-center overflow-hidden bg-gradient-to-br ${album.colors}`}>
              <div className="absolute inset-5 rounded-full border-[16px] border-white/20 opacity-70" />
              <div className="absolute inset-12 rounded-full border-[2px] border-white/30" />
              <span className="relative select-none font-serif text-[110px] italic leading-none text-white/90 drop-shadow-lg">{album.initials}</span>
              <span className="absolute left-4 top-4 rounded-full bg-[#fffcf5] px-3 py-1 text-xs font-bold text-[#292d28]">SIDE A / {String(i+1).padStart(2,"0")}</span>
              <span className="absolute bottom-4 right-4 rounded-full bg-[#292d28] px-3 py-1 text-xs font-bold text-white">{album.minutes} min ↗</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b45f49]">{album.mood} · {album.arc}</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight">{album.title}</h3><p className="mt-1 text-sm text-[#716b61]">{album.artist}</p>
              <div className="mt-auto pt-5"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider">Energy map</span><span className="text-xs text-[#81796d]">start → finish</span></div><EnergyMap values={album.energy}/><p className="mt-1 text-right text-sm font-bold text-[#b45f49]">Open journey ↗</p></div>
            </div>
          </button>)}
        </div>
        {filtered.length===0&&<p className="rounded-xl border border-dashed border-[#a79e8f] p-8 text-center">No albums in this corner of the crate yet. Try another filter!</p>}
      </section>

      <section id="how-it-works" className="mt-16 grid gap-6 rounded-2xl bg-[#292d28] p-7 text-[#fff8ea] md:grid-cols-[1fr_1.4fr] md:p-10"><div><p className="text-xs font-bold uppercase tracking-widest text-[#e9a080]">More than a playlist</p><h2 className="mt-3 text-3xl font-black">An album is a journey, not a shuffle.</h2></div><div className="flex flex-col justify-center gap-3 text-sm leading-relaxed text-[#ded9cd]"><p>① <strong className="text-white">Discover</strong> a record that fits your time and mood.</p><p>② <strong className="text-white">Listen</strong> from first track to last, on a run or wherever you are.</p><p>③ <strong className="text-white">Reflect</strong> on the emotional arc and eventually save your own listening diary.</p><p className="pt-2 text-xs text-[#b6b2a6]">Prototype: album art is represented by original placeholder designs; maps are illustrative, not measured audio data.</p></div></section>
    </div>

    {selected&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e221f]/75 p-4" onClick={()=>setSelected(null)}><div role="dialog" aria-modal="true" aria-label={selected.title+" journey"} onClick={e=>e.stopPropagation()} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border-2 border-[#292d28] bg-[#fffcf5] p-6 shadow-xl md:p-9"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#b45f49]">Inside the sleeve</p><h2 className="mt-2 text-3xl font-black">{selected.title}</h2><p className="text-[#716b61]">{selected.artist} · {selected.minutes} min</p></div><button onClick={()=>setSelected(null)} aria-label="Close album journey" className="rounded-full border border-[#292d28] px-3 py-1 font-bold">✕</button></div><div className="mt-7 rounded-xl bg-[#f0e9dc] p-5"><p className="text-xs font-bold uppercase tracking-widest">The energy map / illustrative</p><EnergyMap values={selected.energy}/><div className="flex justify-between text-xs text-[#716b61]"><span>First track</span><span>Last track</span></div></div><p className="mt-6 text-sm leading-relaxed text-[#655f56]">A {selected.arc.toLowerCase()} through {selected.mood.toLowerCase()} sounds. This is an early visual sketch of the album journey. Track-by-track interpretation and your own run log are coming next.</p><button onClick={()=>setSelected(null)} className="mt-6 rounded-full bg-[#292d28] px-5 py-3 text-sm font-bold text-white">Back to the crate ↗</button></div></div>}
  </main>;
}
