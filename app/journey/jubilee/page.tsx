import Link from "next/link";
import RunnerPicks from "../RunnerPicks";


const tracks = [
  "Paprika", "Be Sweet", "Kokomo, IN", "Slide Tackle", "Posing in Bondage",
  "Sit", "Savage Good Boy", "In Hell", "Tactics", "Posing for Cars",
];
const spotifyAlbumId = "1uD1kdwTWH1DZQZqGKz6rY";

export default function JubileePage() {
  return <main className="min-h-screen bg-white text-[#161616]">
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-10">
      <nav className="flex items-center justify-between border-b border-[#e8e8e8] pb-5">
        <Link href="/journey" className="font-black text-[#1559c8]">← album journeys ✳</Link>
        <span className="text-xs font-bold uppercase tracking-widest">Inside the sleeve / 001</span>
      </nav>
      <section className="grid items-center gap-10 py-12 md:grid-cols-2">
        <div className="relative mx-auto flex aspect-square w-full max-w-sm rotate-[-3deg] items-center justify-center overflow-hidden rounded-[45%_55%_48%_52%] border-[10px] border-white bg-[#e9a72c] shadow-[0_0_0_2px_#ddd,8px_9px_0_#f2f2f2]">
          <img src="https://coverartarchive.org/release/7aa0673a-53b0-4cb8-9a94-9834b3c43b22/front" alt="Jubilee album cover by Japanese Breakfast" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-8 rounded-full border-4 border-white/30"/>
          <span className="absolute bottom-3 right-3 rounded-full bg-[#ffe447] px-3 py-2 text-xs font-black text-black">AJ ✳ 001</span>
        </div>
        <div><p className="text-sm font-bold text-[#1559c8]">✳ THE FEATURED JOURNEY</p><h2 className="mt-3 text-5xl font-black tracking-tight md:text-6xl">Jubilee</h2><p className="mt-2 text-xl text-[#555]">Japanese Breakfast · 2021</p><p className="mt-5 max-w-md leading-relaxed text-[#555]">Ten tracks, one complete listening experience. Follow the twists and turns of the record, from its opening flourish to its final track.</p><div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-[#ffe447] px-4 py-2 text-sm font-bold">10 tracks</span><span className="rounded-full bg-[#e6f0ff] px-4 py-2 text-sm font-bold">About 37 min</span><span className="rounded-full bg-[#e8f8ef] px-4 py-2 text-sm font-bold">Full-album listen</span></div><Link href="/journey/profile?collect=Jubilee&artist=Japanese%20Breakfast" className="mt-5 inline-block rounded-full bg-[#fff0b4] px-5 py-3 text-sm font-black text-[#53351f]">✿ Add album-cover sticker to my journal</Link></div>
      </section>
      <section className="rounded-2xl border border-[#e5e5e5] p-6 md:p-9"><h2 className="text-2xl font-black">Ten tracks. Hear what carries you.</h2><p className="mt-2 text-sm text-[#555]">A personal running pick from Audrea. Follow the sequence, notice the changes between tracks, and listen for the builds within songs. You choose when to push.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">{tracks.map((track,i)=><div key={track} className="flex items-center gap-3 rounded-lg bg-[#f7f8fc] px-4 py-3"><span className="font-mono text-xs text-[#1559c8]">{String(i+1).padStart(2,"0")}</span><span className="text-sm font-semibold">{track}</span></div>)}</div>
      <Link href="/journey/profile#run-journal" className="mt-5 inline-block rounded-full bg-[#1559c8] px-5 py-3 text-sm font-bold text-white">Remember this run ↗</Link></section>
      <RunnerPicks albumTitle="Jubilee" />
      <section className="mt-9 rounded-2xl bg-[#f5f8ff] p-6 md:p-9"><h2 className="text-2xl font-black">Listen to the album ♪</h2><p className="mt-2 mb-5 text-sm text-[#555]">Spotify's official embedded player. Playback and sign-in options depend on Spotify.</p><iframe title="Jubilee by Japanese Breakfast on Spotify" src={`https://open.spotify.com/embed/album/${spotifyAlbumId}?utm_source=generator`} width="100%" height="352" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="rounded-xl" /><a href={`https://open.spotify.com/album/${spotifyAlbumId}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-bold text-[#1559c8] underline">Open in Spotify ↗</a></section>

    </div>
  </main>;
}
