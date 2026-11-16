import Link from "next/link";
import { notFound } from "next/navigation";
import { albums as catalog } from "../../catalog";
import RunnerPicks from "../../RunnerPicks";

const albums = catalog.map(a=>({...a, slug:a.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}));

const spotifyAlbumIds: Record<string,string> = {
  "imaginal-disk": "4HTy9WFTYooRjE9giTmzAF",
  "titanic-rising": "53VKICyqCf91sVkTdFrzKX",
  "melodrama": "4JeJPyNnsB3tqnHR7RL5v5",
  "punisher": "6Pp6qGEywDdofgFC1oFbSH",
  "what-s-your-pleasure": "1CTm3ARqDETSm7GfvNYNJp",
  "emotion": "6Zpf7RlSRIavYGwvsuj94C",
  "currents": "79dL7FLiJFOO0EoehUHQBv",
  "golden-hour": "0bGwtulR9pGiuo7vES9dqp",
  "renaissance": "6FJxoadUE4JNVwWHghBwnb",
  "the-rise-and-fall-of-a-midwest-princess": "0XKconI47eiBP6qPYHsx9f",
  "nurture": "3QITXlmmt93E176jzVqKUb",
  "brat": "2lIZef4lzdvZkiiCzvPKj7",
  "sling": "3GrXqCA3AMa03zCgWkWYqN"
};

export function generateStaticParams() {
  return albums.map(album => ({ slug: album.slug }));
}

export default async function AlbumDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = albums.find(item => item.slug === slug);
  if (!album) notFound();
  return <main className="min-h-screen bg-white text-[#161616]">
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-10">
      <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e8e8] pb-5">
        <Link href="/journey/crate" className="font-black text-[#1559c8]">← Back to album journeys ✳</Link>
        <Link href="/journey/profile" className="rounded-full bg-[#1559c8] px-4 py-2 text-sm font-black text-white">My Sticker Book ↗</Link>
      </nav>
      <section className="grid items-center gap-9 py-12 md:grid-cols-2">
        <div className="relative mx-auto flex aspect-square w-full max-w-sm rotate-[-3deg] flex-col items-center justify-center overflow-hidden rounded-[46%_54%_49%_51%] border-[10px] border-white bg-gradient-to-br from-[#f0a9b7] via-[#a0a6d9] to-[#5278a5] p-8 text-center text-white shadow-[0_0_0_2px_#ddd,8px_9px_0_#f2f2f2]">
          <div className="absolute inset-8 rounded-full border-2 border-white/50"/>
          <img src={`/api/journey/artwork?artist=${encodeURIComponent(album.artist)}&album=${encodeURIComponent(album.title)}`} alt={`${album.title} album cover`} className="absolute inset-0 z-20 h-full w-full object-cover" />
          <p className="relative z-10 text-sm font-bold uppercase tracking-widest">{album.artist}</p>
          <h1 className="relative z-10 mt-4 font-serif text-4xl font-black italic md:text-5xl">{album.title}</h1>
          <span className="absolute bottom-5 right-6 rotate-[8deg] rounded-full bg-[#ffe447] px-4 py-2 text-xs font-black text-black">AJ ✳</span>
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-[#1559c8]">Inside the sleeve ✳</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{album.title}</h2>
          <p className="mt-3 text-xl text-[#555]">{album.artist}</p>
          <p className="mt-5 leading-relaxed text-[#555]">Our editorial mood tag is {album.mood.toLowerCase()}: {album.arc.toLowerCase()}. Try this complete record on a self-paced run and decide which moments work for you.</p>
          <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-[#ffe447] px-4 py-2 text-sm font-bold">{album.minutes} min</span><span className="rounded-full bg-[#e6f0ff] px-4 py-2 text-sm font-bold">{album.mood}</span><span className="rounded-full bg-[#e8f8ef] px-4 py-2 text-sm font-bold">{album.arc}</span></div>
          <Link href={`/journey/profile?collect=${encodeURIComponent(album.title)}&artist=${encodeURIComponent(album.artist)}`} className="mt-5 inline-block rounded-full bg-[#fff0b4] px-5 py-3 text-sm font-black text-[#53351f]">✿ Add album-cover sticker to my journal</Link>
        </div>
      </section>
      <section className="rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-6 md:p-9">
        <p className="text-xs font-black tracking-widest text-[#1559c8]">LISTENING WITH A RUNNER’S EAR</p>
        <h2 className="mt-3 text-2xl font-black">Give the whole record a run.</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">{[
          ["Find your rhythm", "Start at track one and give the opening songs room to set the atmosphere."],
          ["Notice the contrast", "Which quieter stretches help you settle in? Which builds give you a lift when you feel ready?"],
          ["Remember your moment", "After the run, note a song or transition you would return for. Your experience becomes your guide to the next listen."]
        ].map(([title,text])=><div key={title}><h3 className="font-black">{title}</h3><p className="mt-2 text-sm leading-relaxed text-[#555]">{text}</p></div>)}</div>
        <Link href="/journey/profile#run-journal" className="mt-6 inline-block rounded-full bg-[#1559c8] px-5 py-3 text-sm font-bold text-white">Save a running record ↗</Link>
      </section>
      {album.tracks && <section className="my-8 rounded-2xl border border-[#e5e5e5] p-6"><h2 className="text-2xl font-black">From the first track to the last</h2><p className="mt-2 text-sm text-[#555]">Track sequence from Spotify. Listen for your own standout moments.</p><ol className="mt-4 grid list-inside list-decimal gap-2 sm:grid-cols-2">{album.tracks.map(track=><li key={track} className="rounded-lg bg-[#f5f8ff] p-3 text-sm">{track}</li>)}</ol></section>}
      <RunnerPicks albumTitle={album.title} />
      <section className="mt-9 rounded-2xl bg-[#f5f8ff] p-6 md:p-9">
        <h2 className="text-2xl font-black">Listen to the full album ♪</h2>
        <p className="mt-2 text-sm text-[#555]">Find the official album on Spotify. Playback availability depends on your Spotify account and region.</p>
        <iframe title={`${album.title} by ${album.artist} on Spotify`} src={`https://open.spotify.com/embed/album/${(album.spotifyId || spotifyAlbumIds[album.slug])}?utm_source=generator`} width="100%" height="352" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="mt-5 rounded-xl" />
        <a href={`https://open.spotify.com/album/${(album.spotifyId || spotifyAlbumIds[album.slug])}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-full bg-[#1559c8] px-6 py-3 text-sm font-black text-white">Open album in Spotify ↗</a>
        <Link href="/journey#match" className="ml-4 mt-5 inline-block text-sm font-black text-[#1559c8] underline">Try the AI run matchmaker ↗</Link>
      </section>
    </div>
  </main>;
}
