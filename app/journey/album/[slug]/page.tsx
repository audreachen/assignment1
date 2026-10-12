import Link from "next/link";
import { notFound } from "next/navigation";

const albums = [
  {
    "title": "Jubilee",
    "artist": "Japanese Breakfast",
    "minutes": 37,
    "mood": "Bright",
    "arc": "A joyful climb",
    "energy": [
      38,
      65,
      54,
      81,
      92,
      67,
      85,
      58,
      76,
      48
    ],
    "slug": "jubilee"
  },
  {
    "title": "Imaginal Disk",
    "artist": "Magdalena Bay",
    "minutes": 53,
    "mood": "Electric",
    "arc": "Twists & turns",
    "energy": [
      47,
      78,
      60,
      92,
      52,
      74,
      93,
      58,
      84,
      68
    ],
    "slug": "imaginal-disk"
  },
  {
    "title": "Titanic Rising",
    "artist": "Weyes Blood",
    "minutes": 42,
    "mood": "Reflective",
    "arc": "Gentle waves",
    "energy": [
      28,
      42,
      56,
      46,
      65,
      53,
      76,
      55,
      43,
      32
    ],
    "slug": "titanic-rising"
  },
  {
    "title": "Melodrama",
    "artist": "Lorde",
    "minutes": 41,
    "mood": "Electric",
    "arc": "Big peaks",
    "energy": [
      70,
      91,
      67,
      82,
      45,
      87,
      73,
      54,
      92,
      40
    ],
    "slug": "melodrama"
  },
  {
    "title": "Punisher",
    "artist": "Phoebe Bridgers",
    "minutes": 41,
    "mood": "Reflective",
    "arc": "Slow burn",
    "energy": [
      23,
      35,
      32,
      50,
      43,
      60,
      51,
      70,
      92,
      38
    ],
    "slug": "punisher"
  },
  {
    "title": "What's Your Pleasure?",
    "artist": "Jessie Ware",
    "minutes": 53,
    "mood": "Bright",
    "arc": "Keep moving",
    "energy": [
      68,
      78,
      74,
      89,
      82,
      73,
      91,
      85,
      76,
      92
    ],
    "slug": "what-s-your-pleasure"
  },
  {
    "title": "Emotion",
    "artist": "Carly Rae Jepsen",
    "minutes": 45,
    "mood": "Bright",
    "arc": "Pop sparkle",
    "energy": [
      63,
      77,
      83,
      70,
      89,
      76,
      92,
      82,
      86,
      96
    ],
    "slug": "emotion"
  },
  {
    "title": "Currents",
    "artist": "Tame Impala",
    "minutes": 52,
    "mood": "Electric",
    "arc": "Psychedelic waves",
    "energy": [
      48,
      72,
      64,
      82,
      55,
      91,
      70,
      83,
      59,
      77
    ],
    "slug": "currents"
  },
  {
    "title": "Golden Hour",
    "artist": "Kacey Musgraves",
    "minutes": 45,
    "mood": "Reflective",
    "arc": "Sunlit drift",
    "energy": [
      38,
      48,
      56,
      61,
      53,
      66,
      58,
      71,
      64,
      49
    ],
    "slug": "golden-hour"
  },
  {
    "title": "Renaissance",
    "artist": "Beyoncé",
    "minutes": 62,
    "mood": "Electric",
    "arc": "Dance-floor climb",
    "energy": [
      64,
      75,
      86,
      81,
      92,
      78,
      94,
      85,
      98,
      91
    ],
    "slug": "renaissance"
  },
  {
    "title": "The Rise and Fall of a Midwest Princess",
    "artist": "Chappell Roan",
    "minutes": 49,
    "mood": "Bright",
    "arc": "Glittering peaks",
    "energy": [
      57,
      79,
      70,
      93,
      61,
      87,
      95,
      75,
      91,
      83
    ],
    "slug": "the-rise-and-fall-of-a-midwest-princess"
  },
  {
    "title": "Nurture",
    "artist": "Porter Robinson",
    "minutes": 59,
    "mood": "Reflective",
    "arc": "Hopeful lift",
    "energy": [
      25,
      38,
      49,
      55,
      66,
      62,
      78,
      85,
      91,
      72
    ],
    "slug": "nurture"
  },
  {
    "title": "BRAT",
    "artist": "Charli xcx",
    "minutes": 42,
    "mood": "Electric",
    "arc": "Club rush",
    "energy": [
      84,
      92,
      80,
      97,
      87,
      93,
      74,
      98,
      88,
      96
    ],
    "slug": "brat"
  },
  {
    "title": "Sling",
    "artist": "Clairo",
    "minutes": 44,
    "mood": "Reflective",
    "arc": "Quiet unfolding",
    "energy": [
      23,
      33,
      42,
      37,
      49,
      53,
      45,
      60,
      55,
      39
    ],
    "slug": "sling"
  }
];

export function generateStaticParams() {
  return albums.map(album => ({ slug: album.slug }));
}

export default async function AlbumDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = albums.find(item => item.slug === slug);
  if (!album) notFound();
  const coords = album.energy.map((v, i) => `${i / (album.energy.length - 1) * 600},${150 - v}`).join(" ");
  const search = encodeURIComponent(album.artist + " " + album.title);
  return <main className="min-h-screen bg-white text-[#161616]">
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-10">
      <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e8e8] pb-5">
        <Link href="/journey#discover" className="font-black text-[#1559c8]">← Back to album journeys ✳</Link>
        <Link href="/journey/profile" className="rounded-full bg-[#1559c8] px-4 py-2 text-sm font-black text-white">My Sticker Book ↗</Link>
      </nav>
      <section className="grid items-center gap-9 py-12 md:grid-cols-2">
        <div className="relative mx-auto flex aspect-square w-full max-w-sm rotate-[-3deg] flex-col items-center justify-center overflow-hidden rounded-[46%_54%_49%_51%] border-[10px] border-white bg-gradient-to-br from-[#f0a9b7] via-[#a0a6d9] to-[#5278a5] p-8 text-center text-white shadow-[0_0_0_2px_#ddd,8px_9px_0_#f2f2f2]">
          <div className="absolute inset-8 rounded-full border-2 border-white/50"/>
          <p className="relative z-10 text-sm font-bold uppercase tracking-widest">{album.artist}</p>
          <h1 className="relative z-10 mt-4 font-serif text-4xl font-black italic md:text-5xl">{album.title}</h1>
          <span className="absolute bottom-5 right-6 rotate-[8deg] rounded-full bg-[#ffe447] px-4 py-2 text-xs font-black text-black">AJ ✳</span>
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-[#1559c8]">Inside the sleeve ✳</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{album.title}</h2>
          <p className="mt-3 text-xl text-[#555]">{album.artist}</p>
          <p className="mt-5 leading-relaxed text-[#555]">A {album.arc.toLowerCase()} listening journey. Explore this record as a complete album and see how its illustrative energy pattern might fit your next run.</p>
          <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-[#ffe447] px-4 py-2 text-sm font-bold">{album.minutes} min</span><span className="rounded-full bg-[#e6f0ff] px-4 py-2 text-sm font-bold">{album.mood}</span><span className="rounded-full bg-[#e8f8ef] px-4 py-2 text-sm font-bold">{album.arc}</span></div>
        </div>
      </section>
      <section className="rounded-2xl border border-[#e5e5e5] p-6 md:p-9">
        <h2 className="text-2xl font-black">The album energy map ↗</h2>
        <p className="mt-2 text-sm text-[#666]">An editorial, illustrative sketch—not track-by-track measurements, Spotify analysis, or actual BPM data.</p>
        <svg viewBox="0 0 600 170" className="mt-5 w-full" role="img" aria-label="Illustrative energy profile across the album">
          <line x1="0" x2="600" y1="151" y2="151" stroke="#ddd" strokeDasharray="4 5"/>
          <polygon points={`0,151 ${coords} 600,151`} fill="#e8497b" opacity=".12"/>
          <polyline points={coords} stroke="#e8497b" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          {album.energy.map((v,i)=><circle key={i} cx={i/(album.energy.length-1)*600} cy={150-v} r="5" fill="#1559c8"/>)}
        </svg>
        <div className="flex justify-between text-xs text-[#777]"><span>Album start</span><span>Album finish</span></div>
      </section>
      <section className="mt-9 rounded-2xl bg-[#f5f8ff] p-6 md:p-9">
        <h2 className="text-2xl font-black">Listen to the full album ♪</h2>
        <p className="mt-2 text-sm text-[#555]">Find the official album on Spotify. Playback availability depends on your Spotify account and region.</p>
        <a href={`https://open.spotify.com/search/${search}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-full bg-[#1559c8] px-6 py-3 text-sm font-black text-white">Find on Spotify ↗</a>
        <Link href="/journey#match" className="ml-4 mt-5 inline-block text-sm font-black text-[#1559c8] underline">Try the AI run matchmaker ↗</Link>
      </section>
    </div>
  </main>;
}
