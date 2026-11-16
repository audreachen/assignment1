"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import { albums } from "./catalog";

import RunnerPicks from "./RunnerPicks";
import FreshPicks from "./FreshPicks";

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
  const [runMinutes, setRunMinutes] = useState(40);
  const [pattern, setPattern] = useState("A joyful lift");
  const [showMatches, setShowMatches] = useState(false);
  const [vibePrompt, setVibePrompt] = useState("");
  const [vibeResult, setVibeResult] = useState<{ title: string; description: string; energy: number[]; requestId: string } | null>(null);
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
      const { data, error } = await journalSupabase.from("journey_media_ratings")
        .select("id,map_title,map_description,energy,rating,created_at")
        .eq("user_id",user.id).order("created_at",{ascending:false}).limit(30);
      if (error) throw error;
      const { data: legacy } = await journalSupabase.from("vibe_map_votes").select("id,map_title,map_description,energy,rating,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(30);
      const all = [...(data ?? []), ...(legacy ?? [])].sort((a,b)=>b.created_at.localeCompare(a.created_at));
      setSavedVibes(all);
      if (!all.length) setSavedMessage("No rated maps yet. Generate and rate one above!");
    } catch (error) {
      setSavedMessage(error instanceof Error ? error.message : "Couldn't load your ratings.");
    } finally { setSavedLoading(false); }
  }
  async function rateVibe(rating: number) {
    if (!vibeResult || !journalSupabase || voteBusy) return;
    setVoteBusy(true); setVoteStatus("");
    try {
      const { data: { user }, error: authError } = await journalSupabase.auth.getUser();
      if (authError || !user) {
        setVoteStatus("Sign in to My Sticker Book to save your rating.");
        return;
      }

      const { error } = await journalSupabase.from("journey_media_ratings").upsert({
        user_id: user.id, request_id: vibeResult.requestId, map_title: vibeResult.title,
        map_description: vibeResult.description, energy: vibeResult.energy, rating,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id,request_id" });
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
      const { data: sessionData } = journalSupabase ? await journalSupabase.auth.getSession() : { data: { session: null } };
      if (!sessionData.session) throw new Error("Sign in to create and save your AI soundtrack card.");
      const response = await fetch("/api/journey/run-vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {}) },
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

  const patterns = ["A joyful lift", "Room to reflect", "Keep moving", "Surprise me"];
  const ranked = useMemo(() => albums.map(album => {
    const preferredMood = pattern === "A joyful lift" ? "Bright" : pattern === "Room to reflect" ? "Reflective" : "Electric";
    const score = Math.abs(album.minutes-runMinutes) + (pattern === "Surprise me" || album.mood === preferredMood ? 0 : 18);
    return {album, score, difference:album.minutes-runMinutes};
  }).sort((a,b)=>a.score-b.score).slice(0,3), [runMinutes,pattern]);
  return <main className="min-h-screen bg-[#fffdf5] text-[#151515]">
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-6 md:px-10">
      <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e8e8] pb-5">
        <Link href="/journey" className="flex items-center gap-2 text-xl font-black tracking-tight md:text-2xl"><span className="rotate-[-7deg] rounded-xl border-2 border-[#1355c8] bg-white px-3 py-1 text-[#1355c8] shadow-[3px_3px_0_#ffe54f]">album journeys ✳</span></Link>
        <div className="flex items-center gap-5 text-sm font-semibold"><Link href="/journey/crate" className="hover:underline">Record Crate</Link><a href="#how-it-works" className="hover:underline">The idea</a><Link href="/journey/profile" className="rounded-full bg-[#1559c8] px-4 py-2 font-black text-white hover:bg-[#1043a1]">My Sketchbook ↗</Link></div>
      </nav>

      <header className="flex flex-wrap items-center justify-between gap-4 pt-8 pb-3"><div><p className="text-xs font-bold tracking-widest text-[#1559c8]">ALBUMS FOR THE LONG WAY AROUND</p><h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">One run. One great album<span className="text-[#d6a926]">. ✳</span></h1></div><a href="#match" className="rotate-[4deg] rounded-[45%] border-4 border-white bg-[#e34450] px-6 py-4 text-center text-sm font-black text-white shadow-[2px_4px_0_#e9d3ba]">🍓 Make my<br/>AI soundtrack ↗</a></header>
      <FreshPicks />
      <section id="how-it-works" className="mb-12 grid gap-6 rounded-2xl bg-[#1455c7] p-7 text-white md:grid-cols-[1fr_1.4fr] md:p-10"><div><p className="text-xs font-bold uppercase tracking-widest text-[#ffe447]">More than a playlist</p><h2 className="mt-3 text-3xl font-black">Give your next run a beginning, middle, and finish.</h2></div><div className="flex flex-col justify-center gap-3 text-sm leading-relaxed text-white/90"><p>① <strong className="text-white">Discover</strong> a complete album that fits your time and musical taste.</p><p>② <strong className="text-white">Listen</strong> from first track to last. Let the music give you a lift when you’re ready.</p><p>③ <strong className="text-white">Reflect</strong> on what worked. Save the run and find records worth returning to.</p><p className="pt-2 text-xs text-white/70">A small, curated starting point for self-paced runs. Your experience matters more than a perfect tempo match.</p></div></section>
      <RunnerPicks />

      <section id="match" className="mb-12 scroll-mt-6 rounded-3xl border-2 border-[#1559c8] bg-[#f5f8ff] p-6 md:p-9">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#1559c8]">YOUR RUN / YOUR RECORD</p><h2 className="mt-2 text-3xl font-black md:text-4xl">Find my run album ✳</h2><p className="mt-2 text-sm text-[#555]">Choose your time and the kind of company you want from the music.</p></div><span className="rotate-[7deg] rounded-full bg-[#ffe447] px-5 py-3 text-sm font-black">🍋 MATCHMAKER</span></div>
        <div className="grid gap-7 md:grid-cols-2"><div><label htmlFor="run-length" className="flex items-center justify-between font-bold"><span>How long is your run?</span><span className="text-2xl text-[#1559c8]">{runMinutes} min</span></label><input id="run-length" type="range" min="20" max="90" step="5" value={runMinutes} onChange={e=>{setRunMinutes(Number(e.target.value));setShowMatches(false);}} className="mt-5 w-full accent-[#1559c8]"/><div className="mt-1 flex justify-between text-xs text-[#666]"><span>20 min</span><span>90 min</span></div></div>
        <div><p className="mb-3 font-bold">What would you like from the music?</p><div className="flex flex-wrap gap-2">{patterns.map(v=><button key={v} type="button" aria-pressed={pattern===v} onClick={()=>{setPattern(v);setShowMatches(false);}} className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${pattern===v?"border-[#1559c8] bg-[#1559c8] text-white":"border-[#d3ddf1] bg-white hover:border-[#1559c8]"}`}>{v}</button>)}</div><p className="mt-3 text-xs text-[#666]">These are editorial listening preferences, not pace or heart-rate targets.</p></div></div>
        <div className="mt-7 rounded-2xl border border-[#c9d8f3] bg-white p-5">
          <p className="text-xs font-black uppercase tracking-widest text-[#1559c8]">✳ MAKE A SOUNDTRACK FOR YOUR RUN</p>
          <label htmlFor="vibe-prompt" className="mt-2 block text-lg font-black">Describe your ideal run</label>
          <p className="mt-1 text-sm text-[#555]">Describe the feeling you want. AI creates an imagined visual soundtrack you can rate, then explore the curated albums below.</p>
          <textarea id="vibe-prompt" maxLength={500} rows={3} value={vibePrompt} onChange={e=>setVibePrompt(e.target.value)} placeholder="I want my run to feel..." className="mt-3 w-full rounded-xl border border-[#c9d8f3] p-3 text-sm" />
          <button type="button" disabled={vibeLoading || !vibePrompt.trim()} onClick={generateVibe} className="mt-3 rounded-full bg-[#1559c8] px-6 py-3 text-sm font-black text-white disabled:opacity-50">{vibeLoading ? "Generating your map…" : "✳ Create my AI soundtrack card"}</button>
          {vibeError && <p role="alert" className="mt-3 text-sm text-red-700">{vibeError} {vibeError.startsWith("Sign in") && <Link href="/journey/profile" className="font-bold underline">Sign in ↗</Link>}</p>}
          {vibeResult && <div className="mt-5 rounded-xl bg-[#fff9e8] p-4" aria-live="polite">
            <h3 className="text-xl font-black">{vibeResult.title}</h3>
            <p className="mt-1 text-sm text-[#555]">{vibeResult.description}</p>
            <div className="my-5 overflow-hidden rounded-2xl bg-[#1559c8] p-6 text-white"><p className="text-xs font-black uppercase tracking-[0.3em]">YOUR RUN / YOUR SOUNDTRACK</p><EnergyMap values={vibeResult.energy} accent="#ffe447"/><p className="text-right font-serif text-xl italic">one run, one record ✳</p></div>
            <div className="flex justify-between text-xs text-[#666]"><span>0 min</span><span>{Math.round(runMinutes/4)} min</span><span>{Math.round(runMinutes/2)} min</span><span>{Math.round(runMinutes*3/4)} min</span><span>{runMinutes} min</span></div>
            <p className="mt-2 text-xs text-[#666]">AI-generated visual soundtrack · an imagined feeling, not album analysis or a pace prescription</p>
            <div className="mt-5 border-t border-[#e9d9b9] pt-4">
              <h4 className="font-black">Does this AI soundtrack card capture the run you imagined?</h4>
              <div className="mt-2 flex flex-wrap gap-2">{[1,2,3,4,5].map(n=><button key={n} type="button" disabled={voteBusy} aria-label={`Rate ${n} out of 5`} aria-pressed={myRating===n} onClick={()=>void rateVibe(n)} className={`rounded-full border px-3 py-2 text-sm font-bold disabled:opacity-50 ${myRating===n?"border-[#1559c8] bg-[#1559c8] text-white":"border-[#c9b99d] bg-white"}`}>{n} ★</button>)}</div>
              {voteStatus && <p role="status" className="mt-2 text-sm">{voteStatus} {voteStatus.startsWith("Sign in")&&<Link href="/journey/profile" className="font-bold text-[#1559c8] underline">Sign in ↗</Link>}</p>}
              <p className="mt-1 text-xs text-[#666]">Ratings are saved privately to your account in Supabase.</p>
            </div>
            <div className="mt-5 border-t border-[#e9d9b9] pt-4">
              <h4 className="text-lg font-black">Explore a complete album for this run ↓</h4>
              <p className="mt-1 text-xs text-[#666]">Your duration-and-mood shortlist. The AI artwork expresses your intention; it does not analyze these albums.</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">{ranked.map(({album,difference},i)=><div key={album.title} className="rounded-xl border border-[#e9d9b9] bg-white p-3">
                <p className="text-xs font-black text-[#1559c8]">MATCH 0{i+1}</p>
                <p className="mt-1 font-black">{album.title}</p><p className="text-sm text-[#555]">{album.artist}</p>
                <p className="mt-1 text-xs">{album.minutes} min · {Math.abs(difference)} min duration difference</p>
                <p className="my-4 text-sm text-[#555]">{album.mood} · {album.arc}. {album.mood === "Bright" ? "For a run where you want a lift." : album.mood === "Reflective" ? "For a run with space to settle into the music." : "For a run where you want a more electric atmosphere."}</p>

                {album.title==="Jubilee"?<Link href="/journey/jubilee" className="text-sm font-bold text-[#1559c8] underline">Explore album ↗</Link>:<button type="button" onClick={()=>window.location.assign("/journey/album/"+album.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""))} className="text-sm font-bold text-[#1559c8] underline">Explore album ↗</button>}
              </div>)}</div>
            </div>
          </div>}
        </div>
        <button type="button" onClick={()=>setShowMatches(true)} className="mt-7 rounded-full bg-[#ed3449] px-7 py-4 text-base font-black text-white shadow-[3px_4px_0_#ffc5ce] transition hover:-translate-y-0.5">Find my matches ↗</button>
        {showMatches&&<div aria-live="polite" className="mt-8 border-t border-[#d7e0f1] pt-6"><h3 className="text-xl font-black">Your top three album matches ↓</h3><p className="mt-1 text-sm text-[#555]">A shortlist based on duration and editorial mood. Explore the record before deciding; listening preferences are personal.</p><div className="mt-4 grid gap-3 md:grid-cols-3">{ranked.map(({album,difference},i)=><div key={album.title} className="rounded-xl border border-[#e2e7f1] bg-white p-4"><p className="text-xs font-black uppercase tracking-widest text-[#1559c8]">MATCH 0{i+1}</p><p className="mt-2 text-lg font-black">{album.title}</p><p className="text-sm text-[#555]">{album.artist}</p><p className="mt-2 text-xs font-semibold">{album.minutes} min · {difference===0?"Exact duration":difference>0?`${difference} min longer`:`${Math.abs(difference)} min shorter`}</p><p className="my-4 text-sm text-[#555]">{album.mood} · {album.arc}. {album.mood === "Bright" ? "For a run where you want a lift." : album.mood === "Reflective" ? "For a run with space to settle into the music." : "For a run where you want a more electric atmosphere."}</p>{album.title==="Jubilee"?<Link href="/journey/jubilee" className="text-sm font-black text-[#1559c8] underline">Explore & listen ↗</Link>:<button type="button" onClick={()=>window.location.assign("/journey/album/"+album.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""))} className="text-sm font-black text-[#1559c8] underline">Explore album ↗</button>}</div>)}</div></div>}
      </section>

      <section id="saved-vibes" className="mb-12 rounded-3xl border-2 border-[#e7c7d1] bg-[#fff6f8] p-6 md:p-9">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-[#b04465]">YOUR SAVED LISTENING IDEAS</p><h2 className="mt-2 text-2xl font-black">My rated vibe maps ♡</h2><p className="mt-1 text-sm text-[#555]">Revisit the AI maps you&apos;ve rated. Saved privately to your account.</p></div>
        <button type="button" disabled={savedLoading} onClick={()=>void loadSavedVibes()} className="rounded-full bg-[#b04465] px-5 py-3 text-sm font-black text-white disabled:opacity-50">{savedLoading?"Loading…":"Load my saved maps ↗"}</button></div>
        {savedMessage && <p role="status" className="mt-4 text-sm">{savedMessage} {savedMessage.startsWith("Sign in")&&<Link href="/journey/profile" className="font-bold text-[#1559c8] underline">Sign in ↗</Link>}</p>}
        {savedVibes.length>0 && <div className="mt-5 grid gap-4 md:grid-cols-2">{savedVibes.map(v=><div key={v.id} className="rounded-2xl border border-[#edd7dc] bg-white p-4"><p className="font-black">{v.map_title}</p><p className="mt-1 text-sm text-[#555]">{v.map_description}</p><EnergyMap values={v.energy} accent="#b04465"/><p className="text-sm font-black text-[#b04465]">{v.rating} / 5 ★</p></div>)}</div>}
      </section>



    </div>

  </main>;
}
