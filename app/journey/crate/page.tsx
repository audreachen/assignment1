"use client";
import Link from "next/link";
import { useState } from "react";
import { albums } from "../catalog";

export default function RecordCrate() {
  const [mood, setMood] = useState("All");
  const [duration, setDuration] = useState("Any length");
  const filtered = albums.filter(a => (mood === "All" || a.mood === mood) && (duration === "Any length" || (duration === "Under 45 min" ? a.minutes < 45 : a.minutes >= 45)));
  return <main className="min-h-screen bg-[#fffdf5] text-[#151515]"><div className="mx-auto max-w-7xl px-5 py-6 md:px-10">
    <nav className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e8e8] pb-5"><Link href="/journey" className="rotate-[-3deg] rounded-xl border-2 border-[#1559c8] bg-white px-3 py-1 text-xl font-black text-[#1559c8] shadow-[3px_3px_0_#ffe54f]">album journeys ✳</Link><div className="flex flex-wrap items-center gap-5 text-sm font-bold"><Link href="/journey">Fresh Picks</Link><Link href="/journey/crate" aria-current="page" className="text-[#1559c8] underline underline-offset-4">Record Crate</Link><Link href="/journey/profile" className="rounded-full bg-[#1559c8] px-4 py-2 text-white">My Sketchbook ↗</Link></div></nav>
    <h1 className="mb-3 font-serif text-4xl font-black italic text-[#24523b] md:text-5xl">Dig through the record crate.</h1><p className="mb-8 max-w-xl text-sm text-[#666]">All the albums, ready for a whole run. Browse by mood and length, then open a record to explore and listen.</p>
      <section id="discover" className="mb-14 scroll-mt-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1559c8]">THE RUNNING RECORD CRATE</p><h2 className="mt-1 text-2xl font-black md:text-3xl">Find your next running favorite ↓</h2></div><p className="text-sm text-[#666]">{filtered.length} albums to explore</p></div>
        <div className="mb-7 flex flex-wrap items-center gap-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider">I&apos;m feeling</span>
          {["All","Bright","Electric","Reflective"].map(v=><button key={v} type="button" onClick={()=>setMood(v)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${mood===v?"border-[#292d28] bg-[#292d28] text-white":"border-[#dedede] bg-white hover:border-[#292d28]"}`}>{v}</button>)}
          <select aria-label="Album duration" value={duration} onChange={e=>setDuration(e.target.value)} className="ml-auto rounded-full border border-[#d9d0c0] bg-white px-4 py-2 text-sm font-semibold"><option>Any length</option><option>Under 45 min</option><option>45+ min</option></select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((album,i)=><button type="button" key={album.title} onClick={()=>window.location.assign(album.title==="Jubilee"?"/journey/jubilee":"/journey/album/"+album.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""))} className="group flex flex-col rounded-2xl bg-white p-3 text-left transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1559c8]">
            <div className="relative flex aspect-[1.18] items-center justify-center">
              <div className={`relative flex h-[88%] w-[91%] rotate-[-3deg] flex-col items-center justify-center overflow-hidden rounded-[48%_52%_46%_54%/54%_43%_57%_46%] border-[7px] border-white bg-gradient-to-br shadow-[0_0_0_2px_#e5e5e5,3px_6px_0_#ececec] transition duration-200 group-hover:rotate-[2deg] ${album.colors}`}>
                <img src={`/api/journey/artwork?artist=${encodeURIComponent(album.artist)}&album=${encodeURIComponent(album.title)}`} alt="" loading="lazy" onError={e=>{e.currentTarget.style.display="none";}} className="absolute inset-0 z-20 h-full w-full object-cover" /><div className="absolute inset-[9%] rounded-[50%] border-2 border-white/60" />
                <div className="absolute inset-[16%] rounded-[50%] border border-white/40" />
                <span className={`relative z-10 max-w-[85%] text-center text-[clamp(0.7rem,1.4vw,1rem)] font-black uppercase tracking-wider text-white drop-shadow-md ${album.title==="Jubilee"?"opacity-0":""}`}>{album.artist}</span>
                <span className={`relative z-10 mt-2 max-w-[78%] break-words text-center font-serif text-[clamp(1.1rem,2.2vw,2rem)] font-black italic leading-[0.95] text-white drop-shadow-lg ${album.title==="Jubilee"?"opacity-0":""}`}>{album.title}</span>
                <span className="relative z-30 mt-4 bg-white px-3 py-1 font-mono text-[10px] tracking-[0.25em] text-black">AJ—{String(i+1).padStart(4,"0")} ||||</span>
              </div>
              <span className="absolute bottom-5 right-0 z-30 rotate-[10deg] rounded-[45%] border-4 border-white bg-[#ffe447] px-3 py-3 text-center text-[11px] font-black uppercase leading-tight text-[#174d8b] shadow-[0_0_0_1px_#ddd]">{album.arc}</span>
            </div>
            <div className="mt-2 px-2">
              <div className="flex items-center justify-between gap-2"><span className="font-bold">{album.title}</span><span className="shrink-0 text-xs text-[#555]">{album.minutes} min</span></div>
              <p className="mt-0.5 text-sm text-[#666]">{album.artist}</p>
              <p className="my-3 text-sm text-[#555]">Hear the whole record, then tell us how it felt on your run.</p>
              <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-[#f2f2f2] px-3 py-1 text-xs">{album.mood} · {album.arc}</span><span className="text-xs font-bold text-[#1559c8]">Explore ↗</span></div>
            </div>
          </button>)}
        </div>
        {filtered.length===0&&<p className="rounded-xl border border-dashed border-[#a79e8f] p-8 text-center">No albums in this corner of the crate yet. Try another filter!</p>}
      </section>
  </div></main>;
}
