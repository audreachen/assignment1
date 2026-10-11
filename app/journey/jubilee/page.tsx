import Link from "next/link";

const tracks = [
  "Paprika", "Be Sweet", "Kokomo, IN", "Slide Tackle", "Posing in Bondage",
  "Sit", "Savage Good Boy", "In Hell", "Tactics", "Posing for Cars",
];
const energy = [38, 65, 54, 81, 92, 67, 85, 58, 76, 48];
const spotifyAlbumId = "1uD1kdwTWH1DZQZqGKz6rY";
const coords = energy.map((v,i)=>`${(i/(energy.length-1))*600},${150-v}`).join(" ");

export default function JubileePage() {
  return <main className="min-h-screen bg-white text-[#161616]">
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-10">
      <nav className="flex items-center justify-between border-b border-[#e8e8e8] pb-5">
        <Link href="/journey" className="font-black text-[#1559c8]">← album journeys ✳</Link>
        <span className="text-xs font-bold uppercase tracking-widest">Inside the sleeve / 001</span>
      </nav>
      <section className="grid items-center gap-10 py-12 md:grid-cols-2">
        <div className="relative mx-auto flex aspect-square w-full max-w-sm rotate-[-3deg] items-center justify-center overflow-hidden rounded-[45%_55%_48%_52%] border-[10px] border-white bg-[#e9a72c] shadow-[0_0_0_2px_#ddd,8px_9px_0_#f2f2f2]">
          <div className="absolute inset-8 rounded-full border-4 border-white/70"/>
          <div className="relative text-center"><p className="text-sm font-black uppercase tracking-[0.2em] text-white">Japanese Breakfast</p><h1 className="mt-5 font-serif text-7xl font-black italic text-white">Jubilee</h1><p className="mt-7 text-xs font-bold uppercase tracking-widest text-white">Album journey no. 001</p></div>
        </div>
        <div><p className="text-sm font-bold text-[#1559c8]">✳ THE FEATURED JOURNEY</p><h2 className="mt-3 text-5xl font-black tracking-tight md:text-6xl">Jubilee</h2><p className="mt-2 text-xl text-[#555]">Japanese Breakfast · 2021</p><p className="mt-5 max-w-md leading-relaxed text-[#555]">Ten tracks, one complete listening experience. Follow the twists and turns of the record, from its opening flourish to its final track.</p><div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-[#ffe447] px-4 py-2 text-sm font-bold">10 tracks</span><span className="rounded-full bg-[#e6f0ff] px-4 py-2 text-sm font-bold">About 37 min</span><span className="rounded-full bg-[#e8f8ef] px-4 py-2 text-sm font-bold">Full-album listen</span></div></div>
      </section>
      <section className="rounded-2xl border border-[#e5e5e5] p-6 md:p-9"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-2xl font-black">The energy map ↗</h2><span className="rounded-full bg-[#f1f1f1] px-3 py-1 text-xs font-bold">Illustrative, not audio analysis</span></div><p className="mt-2 text-sm text-[#666]">A speculative shape for the listening journey. Tap a track below to find its place in the sequence.</p>
      <svg viewBox="0 0 600 170" className="mt-5 w-full" role="img" aria-label="Illustrative energy profile across ten tracks"><line x1="0" x2="600" y1="151" y2="151" stroke="#ddd" strokeDasharray="4 5"/><polygon points={`0,151 ${coords} 600,151`} fill="#e8497b" opacity=".12"/><polyline points={coords} stroke="#e8497b" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>{energy.map((v,i)=><circle key={i} cx={(i/(energy.length-1))*600} cy={150-v} r="5" fill="#1559c8"/>)}</svg>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">{tracks.map((track,i)=><div key={track} className="flex items-center gap-3 rounded-lg bg-[#f7f8fc] px-4 py-3"><span className="font-mono text-xs text-[#1559c8]">{String(i+1).padStart(2,"0")}</span><span className="text-sm font-semibold">{track}</span></div>)}</div></section>
      <section className="mt-9 rounded-2xl bg-[#f5f8ff] p-6 md:p-9"><h2 className="text-2xl font-black">Listen to the album ♪</h2><p className="mt-2 mb-5 text-sm text-[#555]">Spotify's official embedded player. Playback and sign-in options depend on Spotify.</p><iframe title="Jubilee by Japanese Breakfast on Spotify" src={`https://open.spotify.com/embed/album/${spotifyAlbumId}?utm_source=generator`} width="100%" height="352" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="rounded-xl" /><a href={`https://open.spotify.com/album/${spotifyAlbumId}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-bold text-[#1559c8] underline">Open in Spotify ↗</a></section>
      <p className="mt-8 text-sm text-[#777]">Next up: real cover art, track-linked notes, and community ratings of AI-generated interpretations. Nothing is saved yet.</p>
    </div>
  </main>;
}
