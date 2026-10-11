import Link from "next/link";

const tracks = [
  { title: "Opening", feeling: "Anticipation", energy: 24 },
  { title: "Finding a rhythm", feeling: "Curiosity", energy: 43 },
  { title: "The ascent", feeling: "Momentum", energy: 76 },
  { title: "The peak", feeling: "Exhilaration", energy: 91 },
  { title: "Coming home", feeling: "Reflection", energy: 39 },
];

export default function JourneyPage() {
  const points = tracks.map((track, index) => `${30 + index * 135},${145 - track.energy}`).join(" ");
  return (
    <main className="min-h-screen bg-[#f3efe6] text-[#262b27]">
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-12">
        <nav className="flex items-center justify-between border-b border-[#c9c5ba] pb-5">
          <Link href="/" className="font-serif text-2xl tracking-tight">Album Journeys</Link>
          <span className="text-xs uppercase tracking-[0.2em] text-[#687067]">Concept preview · 01</span>
        </nav>
        <section className="grid gap-12 py-16 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#70786e]">Listen all the way through</p>
            <h1 className="max-w-lg font-serif text-5xl leading-[1.08] md:text-6xl">Every album takes you somewhere.</h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#596158]">Discover albums that unfold alongside your runs. Follow their energy, notice their emotional turns, and remember the journey.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#journey" className="rounded-full bg-[#2f4c40] px-6 py-3 text-sm font-semibold text-white">Explore a journey ↓</a>
              <Link href="/" className="rounded-full border border-[#899388] px-6 py-3 text-sm font-semibold">Back to JUKECRAFT</Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[400px]">
            <div className="absolute left-[15%] top-[6%] aspect-square w-[88%] rounded-full border-[18px] border-[#191d1b] bg-[repeating-radial-gradient(circle,#202522_0px,#202522_3px,#353a36_4px,#202522_6px)] shadow-xl">
              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#c9a46b]"><div className="h-3 w-3 rounded-full bg-[#252a25]" /></div>
            </div>
            <div className="relative flex aspect-square w-[82%] flex-col justify-between bg-[#b86f56] p-8 text-[#fff5e8] shadow-2xl">
              <span className="text-xs uppercase tracking-[0.2em]">A listening experience</span>
              <div><div className="mb-6 h-24 w-24 rounded-full border border-[#f9e5cc]/70" /><p className="font-serif text-4xl leading-tight">The long way home</p><p className="mt-3 text-xs uppercase tracking-[0.18em]">An album journey</p></div>
            </div>
            <p className="mt-4 text-xs text-[#6d746c]">Illustrative sleeve — not a real album</p>
          </div>
        </section>
        <section id="journey" className="rounded-3xl border border-[#d7d4ca] bg-[#fffdf8] p-6 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs uppercase tracking-[0.2em] text-[#7b8379]">Inside the sleeve</p><h2 className="mt-2 font-serif text-3xl">The shape of a journey</h2></div>
            <span className="rounded-full bg-[#e9eee7] px-4 py-2 text-xs text-[#45614e]">Illustrative energy curve</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#657064]">A first sketch of how music might rise and settle during a run. Eventually, an emotional map could describe the shifts from anticipation to exhilaration to reflection.</p>
          <svg viewBox="0 0 600 180" role="img" aria-label="Illustrative energy rising to a peak before settling at the end" className="mt-8 w-full">
            {[45,85,125].map(y => <line key={y} x1="30" y1={y} x2="570" y2={y} stroke="#d9ded5" strokeDasharray="4 6" />)}
            <polyline points={points} fill="none" stroke="#b86f56" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {tracks.map((track, i) => <circle key={track.title} cx={30 + i * 135} cy={145-track.energy} r="5" fill="#b86f56" />)}
          </svg>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            {tracks.map((track,i) => <div key={track.title} className="border-t border-[#d7d4ca] pt-3"><p className="text-xs text-[#7a8278]">0{i+1}</p><p className="mt-1 text-sm font-semibold">{track.feeling}</p><p className="mt-1 text-xs text-[#7a8278]">{track.title}</p></div>)}
          </div>
          <div className="mt-8 rounded-xl bg-[#f1f3ed] p-5"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#54705b]">Next step</p><p className="mt-2 text-sm leading-relaxed">Connect this interface to real album metadata, then generate interpretations users can validate and rate. No listening data or run logs are being saved in this preview.</p></div>
        </section>
      </div>
    </main>
  );
}
