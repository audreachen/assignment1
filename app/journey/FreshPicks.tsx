"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { albums, albumHref, type Album } from "./catalog";

const db = process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_URL && process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_KEY
  ? createClient(process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_URL, process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_KEY) : null;
const featured = ["Jubilee", "Rumours", "Future Nostalgia", "you seem pretty sad for a girl so in love", "Dirty Deeds Done Dirt Cheap", "Random Access Memories"];
const styles = [
  { bg: "#ffe86a", ink: "#184e35", fruit: "🍋", label: "A LITTLE SUNSHINE", radius: "46% 46% 22% 22% / 20% 20% 15% 15%", tilt: -3 },
  { bg: "#f6b9ce", ink: "#8a2144", fruit: "🍒", label: "PICKED WITH LOVE", radius: "22% 22% 45% 45% / 15% 15% 20% 20%", tilt: 2 },
  { bg: "#c4dc91", ink: "#234f30", fruit: "🍐", label: "GOOD FROM START TO FINISH", radius: "44% 44% 20% 20% / 20% 20% 12% 12%", tilt: -2 },
  { bg: "#bcd5f1", ink: "#174a88", fruit: "🫐", label: "TAKE THE LONG WAY", radius: "20% 20% 44% 44% / 12% 12% 20% 20%", tilt: 3 },
  { bg: "#ffb47e", ink: "#743319", fruit: "🍊", label: "FRESH OUT OF THE CRATE", radius: "42% 42% 22% 22% / 20% 20% 12% 12%", tilt: -2 },
  { bg: "#efbdcc", ink: "#742c48", fruit: "🍓", label: "ONE RUN · ONE RECORD", radius: "22% 22% 44% 44% / 12% 12% 20% 20%", tilt: 2 }
];
type RecordEntry = { album_title: string; status: string };

export default function FreshPicks() {
  const [notes, setNotes] = useState<Array<{album_title:string;byline:string;comment:string}>>([]);
  const [choice, setChoice] = useState("Fresh picks");
  const [owner, setOwner] = useState<string | null>(null);
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    let version = 0;
    if (db) void db.from("album_runner_recommendations").select("album_title,byline,comment").eq("is_public",true).order("created_at",{ascending:false}).limit(60).then(({data})=>{if(active)setNotes(data || []);});
    async function refresh(userId: string | null) {
      if (!active) return;
      const revision = ++version;
      setOwner(userId); setRecords([]); setLoaded(false);
      try {
        const value: unknown = JSON.parse(localStorage.getItem(`aj-fresh-dismissed-v1:${userId || "guest"}`) || "[]");
        setDismissed(Array.isArray(value) ? value.filter((v): v is string => typeof v === "string").slice(0, 25) : []);
      } catch { setDismissed([]); }
      if (userId && db) {
        const { data, error } = await db.from("journey_run_entries").select("album_title,status").eq("user_id", userId);
        if (active && revision === version && !error) setRecords(data || []);
      }
      if (active && revision === version) setLoaded(true);
    }
    if (!db) { void refresh(null); return () => { active = false; }; }
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => { setTimeout(() => { void refresh(session?.user.id || null); }, 0); });
    void db.auth.getUser().then(({ data: { user } }) => refresh(user?.id || null));
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const favorite = records.find(r => r.status === "Would run with again");
  const favoriteAlbum = albums.find(a => a.title === favorite?.album_title);
  const candidates = albums.filter(a => !dismissed.includes(a.title) &&
    (choice !== "Around 40 minutes" || Math.abs(a.minutes - 40) <= 5) &&
    (choice !== "Give me a lift" || a.mood === "Bright") &&
    (choice !== "Something unfamiliar" || !records.some(r => r.album_title === a.title)));
  const picks = candidates.map(album => {
    const curated = featured.indexOf(album.title);
    const related = favoriteAlbum && album.title !== favoriteAlbum.title && album.mood === favoriteAlbum.mood;
    return { album, score: (related ? -30 : 0) + (curated < 0 ? 20 + albums.indexOf(album) : curated) };
  }).sort((a, b) => a.score - b.score).slice(0, 6);

  function dismiss(title: string) {
    const next = [...dismissed, title]; setDismissed(next);
    try { localStorage.setItem(`aj-fresh-dismissed-v1:${owner || "guest"}`, JSON.stringify(next)); } catch { /* Browsing still works without storage. */ }
    setMessage("Pick tucked away. Another record is ready to explore.");
  }
  function reset() {
    setDismissed([]);
    try { localStorage.removeItem(`aj-fresh-dismissed-v1:${owner || "guest"}`); } catch { /* Optional persistence. */ }
    setMessage("All picks are back in the crate.");
  }
  async function save(album: Album) {
    if (!db || busy) return;
    setBusy(album.title); setMessage("");
    try {
      const { data: { user } } = await db.auth.getUser();
      if (!user) { setMessage("Sign in to save picks to your sketchbook."); return; }
      const { error } = await db.from("journey_run_entries").upsert({ user_id: user.id, album_title: album.title, status: "Want to try" }, { onConflict: "user_id,album_title", ignoreDuplicates: true });
      if (error) throw error;
      setRecords(prev => prev.some(r => r.album_title === album.title) ? prev : [...prev, { album_title: album.title, status: "Want to try" }]);
      setMessage(`${album.title} is in your sketchbook.`);
    } catch { setMessage("Could not save this pick. Please try again."); }
    finally { setBusy(null); }
  }

  return <section id="fresh-picks" className="fresh-market mb-14 scroll-mt-6">
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div><p className="text-xs font-black uppercase tracking-[.22em] text-[#24523b]">THE ALBUM JOURNEYS FRUIT STAND</p><h2 className="mt-2 max-w-3xl font-serif text-4xl font-black italic tracking-tight text-[#164b36] md:text-6xl">Fresh picks for your next run.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-[#5d6656]">Good records, ripe for a full listen. Pick one. Lace up. See where it takes you.</p></div>
      <span className="market-stamp hidden rotate-[9deg] rounded-full border-2 border-[#c34932] px-5 py-4 text-center text-xs font-black uppercase leading-snug text-[#c34932] sm:block">100%<br/>whole albums<br/>✳ no shuffle needed</span>
    </div>
    <div className="mt-6 flex flex-wrap gap-2" aria-label="Fresh pick preferences">{["Fresh picks", "Around 40 minutes", "Give me a lift", "Something unfamiliar"].map(value => <button key={value} aria-pressed={choice === value} onClick={() => setChoice(value)} className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${choice === value ? "border-[#24523b] bg-[#24523b] text-[#fffbea]" : "border-[#bfc8a9] bg-[#fffdf4] text-[#24523b] hover:border-[#24523b]"}`}>{value}</button>)}</div>
    <p className="mt-3 min-h-5 text-xs text-[#606953]">{loaded && favoriteAlbum ? `A few picks share the ${favoriteAlbum.mood.toLowerCase()} mood of ${favoriteAlbum.title}, a running favorite of yours.` : "A curated starting basket. Save running favorites in your sketchbook to help shape future picks."}{choice === "Something unfamiliar" && " Albums already in your journal are left out."}</p>
    <div className="market-gallery mt-5">{picks.map(({ album }, i) => {
      const style = styles[i % styles.length];
      const runnerNote = notes.find(note=>note.album_title === album.title);
      const saved = records.some(r => r.album_title === album.title);
      const related = favoriteAlbum && favoriteAlbum.title !== album.title && favoriteAlbum.mood === album.mood;
      return <article key={album.title} className="market-card" style={{ backgroundColor: style.bg, color: style.ink, borderRadius: style.radius, transform: `rotate(${style.tilt}deg)` }}>
        <div className="market-card-inner">
          <div className="flex items-center justify-between gap-2"><span className="text-2xl" aria-hidden="true">{style.fruit}</span><span className="text-[9px] font-black uppercase tracking-[.16em]">{style.label}</span><button onClick={() => dismiss(album.title)} aria-label={`Dismiss ${album.title}`} className="rounded-full border border-current px-2 py-0.5 text-xs font-bold">×</button></div>
          <Link href={albumHref(album.title)} className="group mt-4 block"><div className="relative mx-auto aspect-square w-40 overflow-hidden rounded-full border-[7px] border-[#fffdf2] bg-[#fffdf2] shadow-[3px_5px_0_#00000020] md:w-44"><img src={`/api/journey/artwork?artist=${encodeURIComponent(album.artist)}&album=${encodeURIComponent(album.title)}`} alt={`${album.title} album cover`} loading={i < 3 ? "eager" : "lazy"} className="relative z-10 h-full w-full object-cover transition-transform group-hover:scale-105" onError={e => { e.currentTarget.style.display = "none"; }} /><span className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center p-4 text-center font-serif font-bold">{album.title}</span></div><h3 className="mt-4 text-center font-serif text-2xl font-black leading-tight">{album.title}</h3><p className="mt-2 text-center text-xs font-bold uppercase tracking-wider">{album.artist}</p></Link>
          <div className="my-4 flex items-center justify-center gap-3"><span className="rounded-full border-2 border-current px-3 py-1 text-xs font-black">{album.minutes} MIN</span><span className="text-xs font-bold">{album.mood} / full-album listen</span></div>
          <p className="min-h-10 text-center text-xs leading-relaxed">{related ? `Because you’d run with ${favoriteAlbum.title} again. Both have a ${album.mood.toLowerCase()} editorial mood.` : choice === "Around 40 minutes" ? `${Math.abs(album.minutes - 40)} minutes ${album.minutes >= 40 ? "over" : "under"} your 40-minute window.` : `A ${album.mood.toLowerCase()} pick from our curated crate. Make it part of your next outing.`}</p>
          {runnerNote && <p className="mt-3 line-clamp-3 rounded-lg bg-white/40 p-2 text-xs italic">“{runnerNote.comment}” — {runnerNote.byline}</p>}
          <div className="mt-4 grid grid-cols-2 gap-2"><Link href={albumHref(album.title)} className="rounded-full bg-[#fffdf2] px-3 py-2.5 text-center text-xs font-black shadow-[0_2px_0_#00000020]">Explore ↗</Link>{owner ? <button disabled={!!busy || saved} onClick={() => void save(album)} className="rounded-full border-2 border-current px-3 py-2 text-xs font-black disabled:opacity-60">{saved ? "Saved ✓" : busy === album.title ? "Saving…" : "Save +"}</button> : <Link href="/journey/profile" className="rounded-full border-2 border-current px-3 py-2 text-center text-xs font-black">Save +</Link>}</div>
          <div className="mt-5 flex items-center justify-between border-t border-current/25 pt-3"><span className="market-barcode h-5 w-20" aria-hidden="true"/><span className="font-mono text-[9px] tracking-widest">AJ / {String(albums.indexOf(album) + 1).padStart(4, "0")}</span></div>
        </div>
      </article>;
    })}</div>
    {picks.length === 0 && <p className="mt-6 rounded-2xl border-2 border-dashed border-[#9cae83] p-8 text-center">This basket is empty. Try another preference or bring back dismissed picks.</p>}
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><a href="#discover" className="font-bold text-[#24523b] underline underline-offset-4">Dig through all {albums.length} records ↗</a>{dismissed.length > 0 && <button onClick={reset} className="text-xs font-bold text-[#5d6656] underline">Bring back dismissed picks</button>}<Link href="/journey/profile#run-journal" className="text-sm font-bold text-[#24523b]">My running records ↗</Link></div>
    {message && <p role="status" className="mt-4 text-sm font-bold text-[#24523b]">{message}</p>}
  </section>;
}
