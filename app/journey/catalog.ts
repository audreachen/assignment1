export type Album = { title: string; artist: string; minutes: number; mood: string; arc: string; colors: string; energy: number[]; initials: string };
export const albums: Album[] = [
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

export function albumHref(title: string) { return title === "Jubilee" ? "/journey/jubilee" : "/journey/album/" + title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }
