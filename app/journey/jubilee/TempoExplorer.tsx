"use client";

import { useState } from "react";

const tracks = ["Paprika","Be Sweet","Kokomo, IN","Slide Tackle","Posing in Bondage","Sit","Savage Good Boy","In Hell","Tactics","Posing for Cars"];
// DEMONSTRATION VALUES ONLY. Replace with independently verified track tempos before calling these measured BPM.
const exampleBpm = [92,118,76,142,105,84,154,110,135,82];
type Mode = "original" | "running" | "compare";
const pulseFor = (bpm:number,cadence:number) => [bpm/2,bpm,bpm*2].filter(v=>v>=60&&v<=220).sort((a,b)=>Math.abs(a-cadence)-Math.abs(b-cadence))[0]??bpm;

export default function JubileeTempoExplorer() {
  const [mode,setMode] = useState<Mode>("compare");
  const [cadence,setCadence] = useState(160);
  const [selected,setSelected] = useState(0);
  const running=exampleBpm.map(v=>pulseFor(v,cadence));
  const x=(i:number)=>58+i*(580/9);
  const y=(bpm:number)=>210-(bpm-60)*(170/160);
  const path=(values:number[])=>values.map((v,i)=>`${i===0?"M":"L"} ${x(i)} ${y(v)}`).join(" ");
  const showOriginal=mode!=="running",showRunning=mode!=="original";
  const difference=Math.abs(running[selected]-cadence);
  return <section className="mt-6 rounded-2xl border border-[#e5d5b9] bg-[#fffaf0] p-6 md:p-9">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-2xl font-black">Track-by-track tempo ♫</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#655b50]">Explore original tempo and a half-time / double-time pulse for running. Move the cadence slider to see how the running pulse changes.</p></div>
      <span className="rounded-full bg-[#ffe4a5] px-3 py-2 text-xs font-black text-[#6e460c]">Interactive prototype · sample BPM</span>
    </div>
    <p className="mt-3 text-xs font-semibold text-[#80572e]">The numbers below are illustrative examples, NOT measured tempos from Jubilee. Track names and order are real; BPM verification is pending.</p>
    <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Tempo chart mode">
      {(["original","running","compare"] as Mode[]).map(m=><button key={m} type="button" onClick={()=>setMode(m)} aria-pressed={mode===m} className={`rounded-full px-4 py-2 text-sm font-bold transition ${mode===m?"bg-[#1559c8] text-white":"border border-[#cbd5e1] bg-white text-[#334155] hover:bg-[#e6f0ff]"}`}>{m==="original"?"Original BPM":m==="running"?"Running pulse":"Compare both"}</button>)}
    </div>
    {mode!=="original"&&<div className="mt-6 rounded-xl bg-white p-4"><div className="flex justify-between gap-3 text-sm font-bold"><label htmlFor="jubilee-cadence">Your target running cadence</label><output htmlFor="jubilee-cadence" className="text-[#1559c8]">{cadence} steps/min</output></div><input id="jubilee-cadence" type="range" min="120" max="200" step="5" value={cadence} onChange={e=>setCadence(Number(e.target.value))} className="mt-4 w-full accent-[#1559c8]"/><div className="flex justify-between text-xs text-[#777]"><span>120 steps/min</span><span>200 steps/min</span></div></div>}
    <div className="mt-5 overflow-x-auto rounded-xl bg-white p-3">
      <svg viewBox="0 0 680 255" className="min-w-[540px] w-full" role="img" aria-label="Interactive demonstration of original and running BPM across Jubilee tracks">
        {[60,100,140,180,220].map(t=><g key={t}><line x1="58" x2="638" y1={y(t)} y2={y(t)} stroke="#e7e5e4" strokeDasharray="4 5"/><text x="48" y={y(t)+4} textAnchor="end" fontSize="12" fill="#777">{t}</text></g>)}
        {mode!=="original"&&<line x1="58" x2="638" y1={y(cadence)} y2={y(cadence)} stroke="#16a34a" strokeWidth="2" strokeDasharray="6 5"/>}
        {showOriginal&&<path d={path(exampleBpm)} stroke="#e8497b" strokeWidth="3.5" fill="none" strokeLinejoin="round"/>}
        {showRunning&&<path d={path(running)} stroke="#1559c8" strokeWidth="3.5" fill="none" strokeLinejoin="round"/>}
        {exampleBpm.map((v,i)=><g key={tracks[i]}>{showOriginal&&<circle cx={x(i)} cy={y(v)} r={selected===i?7:4.5} fill="#e8497b" stroke="white" strokeWidth="1.5"/>}{showRunning&&<circle cx={x(i)} cy={y(running[i])} r={selected===i?7:4.5} fill="#1559c8" stroke="white" strokeWidth="1.5"/>}<text x={x(i)} y="235" textAnchor="middle" fontSize="12" fill="#555">{String(i+1).padStart(2,"0")}</text></g>)}
      </svg>
      <div className="flex flex-wrap gap-4 px-3 pb-2 text-xs font-bold">{showOriginal&&<span className="text-[#d82c65]">● Original example BPM</span>}{showRunning&&<span className="text-[#1559c8]">● Running pulse</span>}{mode!=="original"&&<span className="text-[#16803b]">- - Target cadence</span>}</div>
    </div>
    <div className="mt-5 grid gap-2 sm:grid-cols-2">{tracks.map((track,i)=><button type="button" key={track} onClick={()=>setSelected(i)} aria-pressed={selected===i} className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-3 text-left text-sm ${selected===i?"border-[#1559c8] bg-[#eaf1ff]":"border-[#e9e2d5] bg-white hover:bg-[#fff4dc]"}`}><span><span className="mr-2 font-mono text-xs text-[#777]">{String(i+1).padStart(2,"0")}</span><strong>{track}</strong></span><span className="whitespace-nowrap font-mono text-xs text-[#555]">{mode==="running"?running[i]:exampleBpm[i]} BPM</span></button>)}</div>
    <p className="mt-5 text-xs leading-relaxed text-[#80572e]">Tempo data resource: <a href="https://getsongbpm.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-[#1559c8] underline underline-offset-2">GetSongBPM</a>. This is a source credit and backlink; the chart currently uses sample BPM values, not data retrieved from GetSongBPM.</p>
    <div className="mt-5 rounded-xl border border-[#e3cba6] bg-white p-4"><p className="text-xs font-black uppercase tracking-widest text-[#1559c8]">Selected track · {String(selected+1).padStart(2,"0")}</p><h3 className="mt-1 text-xl font-black">{tracks[selected]}</h3><p className="mt-2 text-sm">Example original tempo: <strong>{exampleBpm[selected]} BPM</strong> · Running pulse: <strong>{running[selected]} BPM</strong></p>{mode!=="original"&&<p className="mt-1 text-sm">Difference from {cadence} steps/min target: <strong>{difference} BPM</strong>. This is a rhythmic comparison, not a guarantee that the song suits your stride.</p>}</div>
  </section>;
}
