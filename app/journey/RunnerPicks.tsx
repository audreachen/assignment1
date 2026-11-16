"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { albums, albumHref } from "./catalog";

const db = process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_URL && process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_KEY
  ? createClient(process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_URL, process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_KEY) : null;
type Recommendation = { id: string; user_id: string; album_title: string; byline: string; comment: string; created_at: string };

export default function RunnerPicks({ albumTitle }: { albumTitle?: string }) {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [title, setTitle] = useState(albumTitle || albums[0].title);
  const [byline, setByline] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("All albums");

  const load = useCallback(async () => {
    if (!db) { setMessage("Runner recommendations are temporarily unavailable."); setLoading(false); return; }
    try {
      let query = db.from("album_runner_recommendations").select("id,user_id,album_title,byline,comment,created_at").eq("is_public", true).order("created_at", { ascending: false }).limit(60);
      if (albumTitle) query = query.eq("album_title", albumTitle);
      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch { setMessage("Could not load runner recommendations. Try refreshing below."); }
    finally { setLoading(false); }
  }, [albumTitle]);

  useEffect(() => {
    void load();
    if (!db) return;
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => setUserId(session?.user.id || null));
    void db.auth.getUser().then(({ data: { user } }) => setUserId(user?.id || null));
    return () => subscription.unsubscribe();
  }, [load]);

  async function publish() {
    if (!db || busy) return;
    setBusy(true); setMessage("");
    try {
      const { data: { user } } = await db.auth.getUser();
      if (!user) { setMessage("Sign in to recommend an album."); return; }
      const { error } = await db.from("album_runner_recommendations").upsert({
        user_id: user.id, album_title: title, byline: byline.trim(), comment: comment.trim(), is_public: true, updated_at: new Date().toISOString()
      }, { onConflict: "user_id,album_title" });
      if (error) throw error;
      await load(); setComment(""); setMessage("Your recommendation is now on the runners’ shelf.");
    } catch { setMessage("Could not publish your recommendation. Please try again."); }
    finally { setBusy(false); }
  }

  async function withdraw(item: Recommendation) {
    if (!db || busy) return;
    setBusy(true);
    const { error } = await db.from("album_runner_recommendations").update({ is_public: false }).eq("id", item.id).eq("user_id", userId);
    if (error) setMessage("Could not withdraw this recommendation. Please try again.");
    else { await load(); setMessage("Recommendation withdrawn. You can publish it again using the form."); }
    setBusy(false);
  }

  const shown = items.filter(item => filter === "All albums" || item.album_title === filter);
  return <section id="runner-recommendations" className="mb-12 scroll-mt-6">
    <p className="text-xs font-black tracking-widest text-[#1559c8]">PICKED BY RUNNERS</p>
    <h2 className="mt-2 text-3xl font-black">{albumTitle ? "How does this album run?" : "The runners’ recommendation shelf."}</h2>
    <p className="mt-2 max-w-2xl text-sm text-[#555]">Real listening notes from the people who ran with the record. Recommend a whole album and tell the next runner what made it work.</p>
    <div className="mt-5 flex flex-wrap gap-3">
      {!albumTitle && <label className="text-sm font-bold">Browse album comments<select value={filter} onChange={e => setFilter(e.target.value)} className="ml-2 rounded-full border border-[#c9d8f3] bg-white p-3"><option>All albums</option>{albums.map(a => <option key={a.title}>{a.title}</option>)}</select></label>}
      <button type="button" onClick={() => void load()} className="text-sm font-bold text-[#1559c8] underline">Refresh recommendations</button>
    </div>
    {loading ? <p role="status" className="mt-5 text-sm">Opening the runners’ shelf…</p> : shown.length ? <div className="mt-5 grid gap-4 md:grid-cols-3">{shown.map((item, i) => {
      const album = albums.find(a => a.title === item.album_title);
      return <article key={item.id} className={`rounded-3xl border-2 p-6 ${i % 2 === 0 ? "border-[#c9d8f3] bg-[#f5f8ff]" : "border-[#eee] bg-[#fffaf0]"}`}>
        <p className="text-xs font-black uppercase text-[#1559c8]">Recommended by {item.byline}</p>
        <h3 className="mt-4 text-2xl font-black leading-tight">{item.album_title}</h3><p className="mt-2 text-sm text-[#555]">{album?.artist}</p>
        <p className="mt-5 whitespace-pre-wrap break-words font-serif text-lg italic">{item.comment}</p>
        <Link href={albumHref(item.album_title)} className="mt-5 inline-block font-bold text-[#1559c8] underline">Explore the album ↗</Link>
        {item.user_id === userId && <div className="mt-4 flex gap-4"><button disabled={busy} className="text-sm font-bold text-[#1559c8] underline" onClick={() => { setTitle(item.album_title); setByline(item.byline); setComment(item.comment); setMessage("Your recommendation is in the form below. Publish to update it."); }}>Edit</button><button disabled={busy} onClick={() => void withdraw(item)} className="text-sm text-[#a4405b] underline">Withdraw</button></div>}
      </article>;
    })}</div> : <p className="mt-5 rounded-2xl border-2 border-dashed border-[#c9d8f3] bg-[#fffaf0] p-6 font-serif text-lg italic">{albumTitle || filter !== "All albums" ? "No running notes for this album yet. Be the first to recommend it." : "A fresh shelf, ready for its first recommendation. Which album carried you through a run?"}</p>}
    <div className="mt-6 rounded-3xl border border-[#e8d7a1] bg-[#fff9e8] p-6">
      <h3 className="text-xl font-black">Leave a note for the next runner ✎</h3>
      <p className="mt-2 text-sm text-[#555]">Your chosen name and comment will be visible to everyone. Private running records stay in your sketchbook. One editable recommendation per album.</p>
      {userId ? <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={e => { e.preventDefault(); void publish(); }}>
        <label className="text-sm font-bold">Album<select value={title} onChange={e => setTitle(e.target.value)} disabled={!!albumTitle} className="mt-1 block w-full rounded-xl border bg-white p-3">{albums.map(a => <option key={a.title}>{a.title}</option>)}</select></label>
        <label className="text-sm font-bold">Public name<input required maxLength={40} value={byline} onChange={e => setByline(e.target.value)} placeholder="Your runner nickname" className="mt-1 block w-full rounded-xl border bg-white p-3" /></label>
        <label className="text-sm font-bold md:col-span-2">Why is it worth a whole run?<textarea required minLength={10} maxLength={1000} rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="A song that gave you a lift, a transition you loved, or the kind of run it suited…" className="mt-1 block w-full rounded-xl border bg-white p-3" /></label>
        <button disabled={busy || comment.trim().length < 10 || !byline.trim()} className="w-fit rounded-full bg-[#1559c8] px-6 py-3 text-sm font-black text-white disabled:opacity-50">{busy ? "Saving…" : "Publish recommendation ↗"}</button>
      </form> : <Link href="/journey/profile" className="mt-4 inline-block rounded-full bg-[#1559c8] px-6 py-3 text-sm font-black text-white">Sign in to recommend an album ↗</Link>}
    </div>
    {message && <p role="status" className="mt-3 text-sm text-[#1559c8]">{message}</p>}
  </section>;
}
