"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Album = { title: string; artist: string; minutes: number; mood: string; arc: string; colors: string; energy: number[]; initials: string };
const albums: Album[] = [
  { title: "Jubilee", artist: "Japanese Breakfast", minutes: 37, mood: "Bright", arc: "A joyful climb", colors: "from-[#efbc52] via-[#e78a4b] to-[#bd5c37]", energy: [38,65,54,81,92,67,85,58,76,48], initials: "J" },
  { title: "Imaginal Disk", artist: "Magdalena Bay", minutes: 53, mood: "Electric", arc: "Twists & turns", colors: "from-[#8baed4] via-[#5770aa] to-[#423c81]", energy: [47,78,60,92,52,74,93,58,84,68], initials: "I" },
  { title: "Titanic Rising", artist: "Weyes Blood", minutes: 42, mood: "Reflective", arc: "Gentle waves", colors: "from-[#629b9a] via-[#41737d] to-[#2b4d65]", energy: [28,42,56,46,65,53,76,55,43,32], initials: "T" },
  { title: "Melodrama", artist: "Lorde", minutes: 41, mood: "Electric", arc: "Big peaks", colors: "from-[#4168a4] via-[#263b7a] to-[#d17c83]", energy: [70,91,67,82,45,87,73,54,92,40], initials: "M" },
  { title: "Punisher", artist: "Phoebe Bridgers", minutes: 41, mood: "Reflective", arc: "Slow burn", colors: "from-[#7d8897] via-[#545c6c] to-[#282f3a]", energy: [23,35,32,50,43,60,51,70,92,38], initials: "P" },
  { title: "What's Your Pleasure?", artist: "Jessie Ware", minutes: 53, mood: "Bright", arc: "Keep moving", colors: "from-[#d78d8e] via-[#b34c69] to-[#6b365b]", energy: [68,78,74,89,82,73,91,85,76,92], initials: "W" },
  { title: "Emotion", artist: "Carly Rae Jepsen", minutes: 45, mood: "Bright", arc: "Pop sparkle", colors: "from-[#e97a9c] via-[#b94c7e] to-[#77366d]", energy: [63,77,83,70,89,76,92,82,86,96], initials: "E" },
  { title: "Currents", artist: "Tame Impala", minutes: 52, mood: "Electric", arc: "Psychedelic waves", colors: "from-[#8e9ed9] via-[#7869b2] to-[#e3a3c8]", energy: [48,72,64,82,55,91,70,83,59,77], initials: "C" },
  { title: "Golden Hour", artist: "Kacey Musgraves", minutes: 45, mood: "Reflective", arc: "Sunlit drift", colors: "from-[#e9c86b] via-[#d8a46d] to-[#b67f93]", energy: [38,48,56,61,53,66,58,71,64,49], initials: "G" },
  { title: "Renaissance", artist: "Beyoncé", minutes: 62, mood: "Electric", arc: "Dance-floor climb", colors: "from-[#aaa9b2] via-[#6c718a] to-[#282c44]", energy: [64,75,86,81,92,78,94,85,98,91], initials: "R" },
  { title: "The Rise and Fall of a Midwest Princess", artist: "Chappell Roan", minutes: 49, mood: "Bright", arc: "Glittering peaks", colors: "from-[#e87a8f] via-[#cf4669] to-[#8d294d]", energy: [57,79,70,93,61,87,95,75,91,83], initials: "T" },
  { title: "Nurture", artist: "Porter Robinson", minutes: 59, mood: "Reflective", arc: "Hopeful lift", colors: "from-[#a7cfb2] via-[#8db8b9] to-[#608ca9]", energy: [25,38,49,55,66,62,78,85,91,72], initials: "N" },
  { title: "BRAT", artist: "Charli xcx", minutes: 42, mood: "Electric", arc: "Club rush", colors: "from-[#b3da53] via-[#83b43c] to-[#4c792a]", energy: [84,92,80,97,87,93,74,98,88,96], initials: "B" },
  { title: "Sling", artist: "Clairo", minutes: 44, mood: "Reflective", arc: "Quiet unfolding", colors: "from-[#b9a58f] via-[#8e887e] to-[#6a776e]", energy: [23,33,42,37,49,53,45,60,55,39], initials: "S" },
];

const journalSupabase = process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_URL && process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_KEY
  ? createClient(process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_URL, process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_KEY) : null;

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
  const [runMinutes, setRunMinutes] = useState(40);
  const [pattern, setPattern] = useState("Build");
  const [showMatches, setShowMatches] = useState(false);
  const [vibePrompt, setVibePrompt] = useState("");
  const [vibeResult, setVibeResult] = useState<{ title: string; description: string; energy: number[] } | null>(null);
  const [vibeLoading, setVibeLoading] = useState(false);
  const [vibeError, setVibeError] = useState("");
  const [voteStatus, setVoteStatus] = useState("");
  const [voteBusy, setVoteBusy] = useState(false);
  const [myRating, setMyRating] = useState<number | null>(null);
  type SavedVibe = { id: string; map_title: string; map_description: string; energy: number[]; rating: number; created_at: string };
  const [savedVibes, setSavedVibes] = useState<SavedVibe[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  async function loadSavedVibes() {
    if (!journalSupabase) { setSavedMessage("Supabase isn't configured."); return; }
    setSavedLoading(true); setSavedMessage("");
    try {
      const { data: { user } } = await journalSupabase.auth.getUser();
      if (!user) { setSavedVibes([]); setSavedMessage("Sign in to My Sticker Book to view saved ratings."); return; }
      const { data, error } = await journalSupabase.from("vibe_map_votes")
        .select("id,map_title,map_description,energy,rating,created_at")
        .eq("user_id",user.id).order("created_at",{ascending:false}).limit(30);
      if (error) throw error;
      setSavedVibes(data ?? []);
      if (!data?.length) setSavedMessage("No rated maps yet. Generate and rate one above!");
    } catch (error) {
      setSavedMessage(error instanceof Error ? error.message : "Couldn't load your ratings.");
    } finally { setSavedLoading(false); }
  }
  const vibeMatches = useMemo(() => {
    if (!vibeResult) return [];
    return albums.map(album => {
      const curveDifference = album.energy.reduce((sum, point, i) => sum + Math.abs(point - vibeResult.energy[i]), 0) / 10;
      const durationDifference = Math.abs(album.minutes - runMinutes);
      const score = curveDifference * 0.8 + durationDifference * 0.9;
      return { album, score, curveDifference, durationDifference };
    }).sort((a, b) => a.score - b.score).slice(0, 3);
  }, [vibeResult, runMinutes]);
  async function rateVibe(rating: number) {
    if (!vibeResult || !journalSupabase || voteBusy) return;
    setVoteBusy(true); setVoteStatus("");
    try {
      const { data: { user }, error: authError } = await journalSupabase.auth.getUser();
      if (authError || !user) {
        setVoteStatus("Sign in to My Sticker Book to save your rating.");
        return;
      }
      const fingerprint = JSON.stringify([vibeResult.title, vibeResult.description, vibeResult.energy]);
      const { error } = await journalSupabase.from("vibe_map_votes").upsert({
        user_id: user.id, map_fingerprint: fingerprint, map_title: vibeResult.title,
        map_description: vibeResult.description, energy: vibeResult.energy, rating,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id,map_fingerprint" });
      if (error) throw error;
      setMyRating(rating); setVoteStatus("Your rating was saved to your account ✓");
      void loadSavedVibes();
    } catch (error) {
      setVoteStatus(error instanceof Error ? error.message : "Could not save rating.");
    } finally { setVoteBusy(false); }
  }
  async function generateVibe() {
    if (!vibePrompt.trim() || vibeLoading) return;
    setVibeLoading(true);
    setVibeError("");
    setVibeResult(null); setMyRating(null); setVoteStatus("");
    try {
      const response = await fetch("/api/journey/run-vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: vibePrompt, minutes: runMinutes })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Generation failed.");
      setVibeResult(result);
    } catch (error) {
      setVibeError(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setVibeLoading(false);
    }
  }

  const patterns = ["Steady", "Build", "High energy", "Varied"];
  const ranked = useMemo(() => albums.map(album => {
    const avg = album.energy.reduce((a,b)=>a+b,0)/album.energy.length;
    const first = album.energy.slice(0,3).reduce((a,b)=>a+b,0)/3;
    const last = album.energy.slice(-3).reduce((a,b)=>a+b,0)/3;
    const variation = Math.max(...album.energy)-Math.min(...album.energy);
    const preference = pattern==="Steady" ? variation : pattern==="Build" ? 100-(last-first) : pattern==="High energy" ? 100-avg : 100-variation;
    const score = Math.abs(album.minutes-runMinutes)*2 + preference*0.3;
    return {album, score, difference:album.minutes-runMinutes};
  }).sort((a,b)=>a.score-b.score).slice(0,3), [runMinutes,pattern]);
  const filtered = useMemo(() => albums.filter(a => (mood === "All" || a.mood === mood) && (duration === "Any length" || (duration === "Under 45 min" ? a.minutes < 45 : a.minutes >= 45))), [mood, duration]);
  return <main className="min-h-screen bg-white text-[#151515]">
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-6 md:px-10">
      <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e8e8] pb-5">
        <Link href="/journey" className="flex items-center gap-2 text-xl font-black tracking-tight md:text-2xl"><span className="rotate-[-7deg] rounded-xl border-2 border-[#1355c8] bg-white px-3 py-1 text-[#1355c8] shadow-[3px_3px_0_#ffe54f]">album journeys ✳</span></Link>
        <div className="flex items-center gap-5 text-sm font-semibold"><a href="#discover" className="hover:underline">Discover</a><a href="#how-it-works" className="hover:underline">The idea</a><Link href="/journey/profile" className="rounded-full bg-[#1559c8] px-4 py-2 font-black text-white hover:bg-[#1043a1]">Sign in / My Sticker Book ↗</Link></div>
      </nav>

      <section className="grid gap-8 py-10 md:grid-cols-[1.5fr_0.5fr] md:items-center">
        <div><p className="mb-3 text-sm font-bold tracking-wide text-[#1559c8]">♪ albums for the long way around</p><h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">What are we<br/>listening to<span className="text-[#f4d629]">? ✳</span></h1><p className="mt-5 max-w-xl text-base text-[#555]">Albums for the road, the trail, or wherever your feet take you.</p></div>
        <a href="#match" className="group relative mx-auto flex h-48 w-48 rotate-[9deg] flex-col items-center justify-center rounded-[42%_55%_45%_55%] border-[8px] border-white bg-[#ed3449] p-4 text-center text-white shadow-[0_0_0_2px_#e4e4e4,5px_7px_0_#e7e7e7] transition hover:rotate-0"><span className="absolute -top-5 text-4xl">🍓</span><span className="text-2xl font-black italic leading-tight">find my next<br/>run album ↗</span><span className="mt-2 text-xs font-bold">TIME · MOOD · ENERGY</span></a>
      </section>
      <section id="match" className="mb-12 scroll-mt-6 rounded-3xl border-2 border-[#1559c8] bg-[#f5f8ff] p-6 md:p-9">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#1559c8]">YOUR RUN / YOUR RECORD</p><h2 className="mt-2 text-3xl font-black md:text-4xl">Find my run album ✳</h2><p className="mt-2 text-sm text-[#555]">Match your running time with a musical energy pattern.</p></div><span className="rotate-[7deg] rounded-full bg-[#ffe447] px-5 py-3 text-sm font-black">🍋 MATCHMAKER</span></div>
        <div className="grid gap-7 md:grid-cols-2"><div><label htmlFor="run-length" className="flex items-center justify-between font-bold"><span>How long is your run?</span><span className="text-2xl text-[#1559c8]">{runMinutes} min</span></label><input id="run-length" type="range" min="20" max="90" step="5" value={runMinutes} onChange={e=>{setRunMinutes(Number(e.target.value));setShowMatches(false);}} className="mt-5 w-full accent-[#1559c8]"/><div className="mt-1 flex justify-between text-xs text-[#666]"><span>20 min</span><span>90 min</span></div></div>
        <div><p className="mb-3 font-bold">What energy pattern sounds right?</p><div className="flex flex-wrap gap-2">{patterns.map(v=><button key={v} type="button" aria-pressed={pattern===v} onClick={()=>{setPattern(v);setShowMatches(false);}} className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${pattern===v?"border-[#1559c8] bg-[#1559c8] text-white":"border-[#d3ddf1] bg-white hover:border-[#1559c8]"}`}>{v}</button>)}</div><p className="mt-3 text-xs text-[#666]">Energy curves are sample data for now—not measured BPM or audio features.</p></div></div>
        <div className="mt-7 rounded-2xl border border-[#c9d8f3] bg-white p-5">
          <p className="text-xs font-black uppercase tracking-widest text-[#1559c8]">✳ AI RUN VIBE STUDIO</p>
          <label htmlFor="vibe-prompt" className="mt-2 block text-lg font-black">Describe your ideal run</label>
          <p className="mt-1 text-sm text-[#555]">Try “start dreamy, build to a huge peak, and finish peacefully.”</p>
          <textarea id="vibe-prompt" maxLength={500} rows={3} value={vibePrompt} onChange={e=>setVibePrompt(e.target.value)} placeholder="I want my run to feel..." className="mt-3 w-full rounded-xl border border-[#c9d8f3] p-3 text-sm" />
          <button type="button" disabled={vibeLoading || !vibePrompt.trim()} onClick={generateVibe} className="mt-3 rounded-full bg-[#1559c8] px-6 py-3 text-sm font-black text-white disabled:opacity-50">{vibeLoading ? "Generating your map…" : "✳ Generate AI vibe map"}</button>
          {vibeError && <p role="alert" className="mt-3 text-sm text-red-700">{vibeError}</p>}
          {vibeResult && <div className="mt-5 rounded-xl bg-[#fff9e8] p-4" aria-live="polite">
            <h3 className="text-xl font-black">{vibeResult.title}</h3>
            <p className="mt-1 text-sm text-[#555]">{vibeResult.description}</p>
            <EnergyMap values={vibeResult.energy} accent="#ed3449"/>
            <div className="flex justify-between text-xs text-[#666]"><span>0 min</span><span>{Math.round(runMinutes/4)} min</span><span>{Math.round(runMinutes/2)} min</span><span>{Math.round(runMinutes*3/4)} min</span><span>{runMinutes} min</span></div>
            <p className="mt-2 text-xs text-[#666]">AI-generated illustrative energy · not actual audio analysis</p>
            <div className="mt-5 border-t border-[#e9d9b9] pt-4">
              <h4 className="font-black">How useful was this AI-generated vibe map?</h4>
              <div className="mt-2 flex flex-wrap gap-2">{[1,2,3,4,5].map(n=><button key={n} type="button" disabled={voteBusy} aria-label={`Rate ${n} out of 5`} aria-pressed={myRating===n} onClick={()=>void rateVibe(n)} className={`rounded-full border px-3 py-2 text-sm font-bold disabled:opacity-50 ${myRating===n?"border-[#1559c8] bg-[#1559c8] text-white":"border-[#c9b99d] bg-white"}`}>{n} ★</button>)}</div>
              {voteStatus && <p role="status" className="mt-2 text-sm">{voteStatus} {voteStatus.startsWith("Sign in")&&<Link href="/journey/profile" className="font-bold text-[#1559c8] underline">Sign in ↗</Link>}</p>}
              <p className="mt-1 text-xs text-[#666]">Ratings are saved privately to your account in Supabase.</p>
            </div>
            <div className="mt-5 border-t border-[#e9d9b9] pt-4">
              <h4 className="text-lg font-black">Albums that fit your AI vibe ↓</h4>
              <p className="mt-1 text-xs text-[#666]">Ranked by similarity to illustrative album energy curves and run duration—not measured audio features.</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">{vibeMatches.map(({album,curveDifference,durationDifference},i)=><div key={album.title} className="rounded-xl border border-[#e9d9b9] bg-white p-3">
                <p className="text-xs font-black text-[#1559c8]">MATCH 0{i+1}</p>
                <p className="mt-1 font-black">{album.title}</p><p className="text-sm text-[#555]">{album.artist}</p>
                <p className="mt-1 text-xs">{album.minutes} min · {durationDifference} min duration difference</p>
                <EnergyMap values={album.energy} accent="#1559c8"/>
                <p className="text-xs text-[#666]">Average curve difference: {curveDifference.toFixed(0)}/100</p>
                {album.title==="Jubilee"?<Link href="/journey/jubilee" className="text-sm font-bold text-[#1559c8] underline">Explore album ↗</Link>:<button type="button" onClick={()=>window.location.assign("/journey/album/"+album.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""))} className="text-sm font-bold text-[#1559c8] underline">Explore album ↗</button>}
              </div>)}</div>
            </div>
          </div>}
        </div>
        <button type="button" onClick={()=>setShowMatches(true)} className="mt-7 rounded-full bg-[#ed3449] px-7 py-4 text-base font-black text-white shadow-[3px_4px_0_#ffc5ce] transition hover:-translate-y-0.5">Find my matches ↗</button>
        {showMatches&&<div aria-live="polite" className="mt-8 border-t border-[#d7e0f1] pt-6"><h3 className="text-xl font-black">Your top three album matches ↓</h3><p className="mt-1 text-sm text-[#555]">Ranked by run-length proximity and your chosen illustrative energy pattern.</p><div className="mt-4 grid gap-3 md:grid-cols-3">{ranked.map(({album,difference},i)=><div key={album.title} className="rounded-xl border border-[#e2e7f1] bg-white p-4"><p className="text-xs font-black uppercase tracking-widest text-[#1559c8]">MATCH 0{i+1}</p><p className="mt-2 text-lg font-black">{album.title}</p><p className="text-sm text-[#555]">{album.artist}</p><p className="mt-2 text-xs font-semibold">{album.minutes} min · {difference===0?"Exact duration":difference>0?`${difference} min longer`:`${Math.abs(difference)} min shorter`}</p><EnergyMap values={album.energy} accent="#1559c8"/>{album.title==="Jubilee"?<Link href="/journey/jubilee" className="text-sm font-black text-[#1559c8] underline">Explore & listen ↗</Link>:<button type="button" onClick={()=>window.location.assign("/journey/album/"+album.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""))} className="text-sm font-black text-[#1559c8] underline">Explore album ↗</button>}</div>)}</div></div>}
      </section>
      <section id="saved-vibes" className="mb-12 rounded-3xl border-2 border-[#e7c7d1] bg-[#fff6f8] p-6 md:p-9">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-[#b04465]">YOUR SAVED LISTENING IDEAS</p><h2 className="mt-2 text-2xl font-black">My rated vibe maps ♡</h2><p className="mt-1 text-sm text-[#555]">Revisit the AI maps you've rated. Saved privately to your account.</p></div>
        <button type="button" disabled={savedLoading} onClick={()=>void loadSavedVibes()} className="rounded-full bg-[#b04465] px-5 py-3 text-sm font-black text-white disabled:opacity-50">{savedLoading?"Loading…":"Load my saved maps ↗"}</button></div>
        {savedMessage && <p role="status" className="mt-4 text-sm">{savedMessage} {savedMessage.startsWith("Sign in")&&<Link href="/journey/profile" className="font-bold text-[#1559c8] underline">Sign in ↗</Link>}</p>}
        {savedVibes.length>0 && <div className="mt-5 grid gap-4 md:grid-cols-2">{savedVibes.map(v=><div key={v.id} className="rounded-2xl border border-[#edd7dc] bg-white p-4"><p className="font-black">{v.map_title}</p><p className="mt-1 text-sm text-[#555]">{v.map_description}</p><EnergyMap values={v.energy} accent="#b04465"/><p className="text-sm font-black text-[#b04465]">{v.rating} / 5 ★</p></div>)}</div>}
      </section>
      <section id="discover" className="scroll-mt-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1559c8]">STICKER SHEET / 001</p><h2 className="mt-1 text-2xl font-black md:text-3xl">Pick a sticker ↓</h2></div><p className="text-sm text-[#666]">{filtered.length} albums to explore</p></div>
        <div className="mb-7 flex flex-wrap items-center gap-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider">I'm feeling</span>
          {["All","Bright","Electric","Reflective"].map(v=><button key={v} type="button" onClick={()=>setMood(v)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${mood===v?"border-[#292d28] bg-[#292d28] text-white":"border-[#dedede] bg-white hover:border-[#292d28]"}`}>{v}</button>)}
          <select aria-label="Album duration" value={duration} onChange={e=>setDuration(e.target.value)} className="ml-auto rounded-full border border-[#d9d0c0] bg-white px-4 py-2 text-sm font-semibold"><option>Any length</option><option>Under 45 min</option><option>45+ min</option></select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((album,i)=><button type="button" key={album.title} onClick={()=>window.location.assign(album.title==="Jubilee"?"/journey/jubilee":"/journey/album/"+album.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""))} className="group flex flex-col rounded-2xl bg-white p-3 text-left transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1559c8]">
            <div className="relative flex aspect-[1.18] items-center justify-center">
              <div className={`relative flex h-[88%] w-[91%] rotate-[-3deg] flex-col items-center justify-center overflow-hidden rounded-[48%_52%_46%_54%/54%_43%_57%_46%] border-[7px] border-white bg-gradient-to-br shadow-[0_0_0_2px_#e5e5e5,3px_6px_0_#ececec] transition duration-200 group-hover:rotate-[2deg] ${album.colors}`}>
                {album.title==="Jubilee" && <img src="https://coverartarchive.org/release/7aa0673a-53b0-4cb8-9a94-9834b3c43b22/front" alt="" className="absolute inset-0 h-full w-full object-cover" />}<div className="absolute inset-[9%] rounded-[50%] border-2 border-white/60" />
                <div className="absolute inset-[16%] rounded-[50%] border border-white/40" />
                <span className={`relative z-10 max-w-[85%] text-center text-[clamp(0.9rem,2vw,1.4rem)] font-black uppercase tracking-wider text-white drop-shadow-md ${album.title==="Jubilee"?"opacity-0":""}`}>{album.artist}</span>
                <span className={`relative z-10 mt-2 max-w-[85%] text-center font-serif text-[clamp(1.8rem,3.3vw,3rem)] font-black italic leading-[0.95] text-white drop-shadow-lg ${album.title==="Jubilee"?"opacity-0":""}`}>{album.title}</span>
                <span className="relative z-10 mt-4 bg-white px-3 py-1 font-mono text-[10px] tracking-[0.25em] text-black">AJ—{String(i+1).padStart(4,"0")} ||||</span>
              </div>
              <span className="absolute bottom-5 right-0 rotate-[10deg] rounded-[45%] border-4 border-white bg-[#ffe447] px-3 py-3 text-center text-[11px] font-black uppercase leading-tight text-[#174d8b] shadow-[0_0_0_1px_#ddd]">{album.arc}</span>
            </div>
            <div className="mt-2 px-2">
              <div className="flex items-center justify-between gap-2"><span className="font-bold">{album.title}</span><span className="shrink-0 text-xs text-[#555]">{album.minutes} min</span></div>
              <p className="mt-0.5 text-sm text-[#666]">{album.artist}</p>
              <EnergyMap values={album.energy} accent={album.mood==="Electric"?"#1674e8":album.mood==="Bright"?"#ed5a95":"#32b783"}/>
              <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-[#f2f2f2] px-3 py-1 text-xs">{album.mood} · {album.arc}</span><span className="text-xs font-bold text-[#1559c8]">Explore ↗</span></div>
            </div>
          </button>)}
        </div>
        {filtered.length===0&&<p className="rounded-xl border border-dashed border-[#a79e8f] p-8 text-center">No albums in this corner of the crate yet. Try another filter!</p>}
      </section>

      <section id="how-it-works" className="mt-16 grid gap-6 rounded-2xl bg-[#1455c7] p-7 text-white md:grid-cols-[1fr_1.4fr] md:p-10"><div><p className="text-xs font-bold uppercase tracking-widest text-[#ffe447]">More than a playlist</p><h2 className="mt-3 text-3xl font-black">An album is a journey, not a shuffle.</h2></div><div className="flex flex-col justify-center gap-3 text-sm leading-relaxed text-white/90"><p>① <strong className="text-white">Discover</strong> a record that fits your time and mood.</p><p>② <strong className="text-white">Listen</strong> from first track to last, on a run or wherever you are.</p><p>③ <strong className="text-white">Reflect</strong> on the emotional arc and eventually save your own listening diary.</p><p className="pt-2 text-xs text-white/70">Prototype: album art is represented by original placeholder designs; maps are illustrative, not measured audio data.</p></div></section>
    </div>

    {selected&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e221f]/75 p-4" onClick={()=>setSelected(null)}><div role="dialog" aria-modal="true" aria-label={selected.title+" journey"} onClick={e=>e.stopPropagation()} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border-2 border-[#292d28] bg-white p-6 shadow-xl md:p-9"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#1559c8]">Inside the sleeve</p><h2 className="mt-2 text-3xl font-black">{selected.title}</h2><p className="text-[#666]">{selected.artist} · {selected.minutes} min</p></div><button onClick={()=>setSelected(null)} aria-label="Close album journey" className="rounded-full border border-[#292d28] px-3 py-1 font-bold">✕</button></div><div className="mt-7 rounded-xl bg-[#f3f7ff] p-5"><p className="text-xs font-bold uppercase tracking-widest">The energy map / illustrative</p><EnergyMap values={selected.energy}/><div className="flex justify-between text-xs text-[#716b61]"><span>First track</span><span>Last track</span></div></div><p className="mt-6 text-sm leading-relaxed text-[#555]">A {selected.arc.toLowerCase()} through {selected.mood.toLowerCase()} sounds. This is an early visual sketch of the album journey. Track-by-track interpretation and your own run log are coming next.</p><button onClick={()=>setSelected(null)} className="mt-6 rounded-full bg-[#292d28] px-5 py-3 text-sm font-bold text-white">Back to the crate ↗</button></div></div>}
  </main>;
}
