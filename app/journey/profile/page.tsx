"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Sticker = { id: string; label: string; sub: string; x: number; y: number; rotate: number; color: string; kind: "album" | "note" | "decoration" | "photo"; note?: string; photo?: string; page?: number };
const starter: Sticker[] = [
  { id:"jubilee",label:"Jubilee",sub:"Japanese Breakfast",x:8,y:13,rotate:-9,color:"#efb34c",kind:"album" },
  { id:"imaginal",label:"Imaginal Disk",sub:"Magdalena Bay",x:57,y:11,rotate:8,color:"#7d9ed8",kind:"album" },
  { id:"note-1",label:"Dear diary...",sub:"",x:35,y:43,rotate:-4,color:"#fff1a9",kind:"note",note:"Songs for the long way home ♡" },
  { id:"tape-1",label:"✿",sub:"",x:79,y:64,rotate:16,color:"#f3a8bd",kind:"decoration" },
  { id:"punisher",label:"Punisher",sub:"Phoebe Bridgers",x:10,y:65,rotate:7,color:"#9ba6b3",kind:"album" },
];
const supabase = process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_URL && process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_KEY ? createClient(process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_URL, process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_KEY) : null;
const storageKey="album-journeys-junk-journal-v1";
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export default function StickerBook() {
  const [stickers,setStickers]=useState<Sticker[]>(starter);
  const [ready,setReady]=useState(false);
  const [account,setAccount]=useState<string|null>(null);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [displayName,setDisplayName]=useState("");
  const [authMode,setAuthMode]=useState<"login"|"signup">("login");
  const [authBusy,setAuthBusy]=useState(false);
  const [recoveryMode,setRecoveryMode]=useState(false);
  const [newPassword,setNewPassword]=useState("");
  const [cloudReady,setCloudReady]=useState(false);
  const [cloudOwner,setCloudOwner]=useState<string|null>(null);
  const [authChecked,setAuthChecked]=useState(false);

  const [cloudMessage,setCloudMessage]=useState("");
  const [avatarUrl,setAvatarUrl]=useState("");
  const avatarInput=useRef<HTMLInputElement>(null);
  const [active,setActive]=useState<string|null>(null);
  const [page,setPage]=useState(1);
  const board=useRef<HTMLDivElement>(null);
  const photoInput=useRef<HTMLInputElement>(null);
  const [photoError,setPhotoError]=useState("");
  const drag=useRef<{id:string;offsetX:number;offsetY:number}|null>(null);
  useEffect(()=>{try {const raw=localStorage.getItem(storageKey);if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed.stickers)){const seen=new Set<string>();setStickers(parsed.stickers.filter((s:Sticker)=>{if(s.kind==="album"){const key=s.label.toLowerCase().trim();if(seen.has(key))return false;seen.add(key);}return true;}));}if(parsed.page===1||parsed.page===2)setPage(parsed.page);}}catch{}setReady(true);},[]);
  useEffect(()=>{if(ready&&authChecked&&!account){try{localStorage.setItem(storageKey,JSON.stringify({stickers,page}));}catch{setPhotoError("Browser storage is full. Remove a photo to save new changes.");}}},[stickers,page,ready,authChecked,account]);
  useEffect(()=>{
    if(!supabase)return;
    void supabase.auth.getUser().then(({data})=>{setAccount(data.user?.id??null);setAuthChecked(true);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{setAccount(previous=>{const next=session?.user.id??null;if(previous!==next){setStickers(next?[]:starter);setActive(null);setAvatarUrl("");setCloudOwner(null);try{localStorage.removeItem(storageKey);}catch{}}return next;});setCloudReady(false);setAuthChecked(true);if(event==="PASSWORD_RECOVERY")setRecoveryMode(true);});
    return()=>subscription.unsubscribe();
  },[]);
  async function passwordAuth(){
    if(!supabase||authBusy)return;
    setAuthBusy(true);setCloudMessage("");
    try{
      if(authMode==="signup"){
        const {data,error}=await supabase.auth.signUp({email,password,options:{data:{display_name:displayName.trim()}}});
        if(error){setCloudMessage(error.message);return;}
        if(data.session&&data.user){
          const {error:profileError}=await supabase.from("journal_profiles").upsert({user_id:data.user.id,display_name:displayName.trim()});
          setCloudMessage(profileError?"Account created; username could not be saved: "+profileError.message:"Welcome to your scrapbook! ✿");
        }else setCloudMessage("Account created! Check your email for a confirmation message if required, then sign in with your password.");
      }else{
        const {error}=await supabase.auth.signInWithPassword({email,password});
        setCloudMessage(error?error.message:"Welcome back! ✿");
      }
    }finally{setAuthBusy(false);}
  }
  async function resetPassword(){
    if(!supabase)return;
    if(!email.trim()){setCloudMessage("Enter your email address first, then select Forgot password.");return;}
    setAuthBusy(true);
    try{
      const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+"/journey/profile"});
      setCloudMessage(error?error.message:"If this email has an account, you'll receive a password-reset link. Check your inbox and spam folder.");
    }finally{setAuthBusy(false);}
  }
  async function updatePassword(newPassword:string){
    if(!supabase)return;
    setAuthBusy(true);
    try{
      const {error}=await supabase.auth.updateUser({password:newPassword});
      setCloudMessage(error?error.message:"Password updated! You're signed in.");
      if(!error)setRecoveryMode(false);
    }finally{setAuthBusy(false);}
  }
  async function saveDisplayName(){
    if(!supabase||!account||!displayName.trim())return;
    const {error}=await supabase.from("journal_profiles").upsert({user_id:account,display_name:displayName.trim()});
    setCloudMessage(error?error.message:"Username saved ✓");
  }
  async function uploadAvatar(file?:File){
    if(!file||!supabase||!account)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024){setCloudMessage("Choose a JPG, PNG, or WebP image under 5 MB.");return;}
    const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
    const path=account+"/avatar-"+Date.now()+"."+ext;
    const {error}=await supabase.storage.from("profile-pictures").upload(path,file,{contentType:file.type});
    if(error){setCloudMessage(error.message);return;}
    const {error:profileError}=await supabase.from("journal_profiles").upsert({user_id:account,avatar_path:path});
    if(profileError){setCloudMessage(profileError.message);return;}
    const {data}=await supabase.storage.from("profile-pictures").createSignedUrl(path,3600);
    setAvatarUrl(data?.signedUrl??"");setCloudMessage("Profile picture saved ✓");
  }
  useEffect(()=>{
    if(!supabase||!account||!ready){setCloudReady(false);return;}
    let cancelled=false;
    async function loadCloud(){
      const [{data:items,error},{data:profile}]=await Promise.all([
        supabase!.from("journal_items").select("*").eq("user_id",account!),
        supabase!.from("journal_profiles").select("avatar_path,display_name").eq("user_id",account!).maybeSingle()
      ]);
      if(cancelled)return;
      if(error){setCloudMessage("Could not load your journal: "+error.message);return;}
      if(profile?.display_name&&!cancelled)setDisplayName(profile.display_name);
      if(profile?.avatar_path){const {data}=await supabase!.storage.from("profile-pictures").createSignedUrl(profile.avatar_path,3600);if(!cancelled)setAvatarUrl(data?.signedUrl??"");}
      {
        const restored=await Promise.all((items??[]).map(async item=>{
          const photo=item.kind==="photo"&&item.image_path?(await supabase!.storage.from("journal-photos").createSignedUrl(item.image_path,3600)).data?.signedUrl:undefined;
          return {id:item.client_id||item.id,label:item.label,sub:item.subtitle||"",x:Number(item.pos_x),y:Number(item.pos_y),rotate:Number(item.rotation),color:item.color||"#fff1a9",kind:item.kind as Sticker["kind"],note:item.note||undefined,photo,page:item.page_number} as Sticker;
        }));
        if(!cancelled)setStickers(restored);
      }
      if(!cancelled){setCloudOwner(account!);setCloudReady(true);setCloudMessage("Cloud journal connected ✓");}
    }
    void loadCloud();return()=>{cancelled=true;};
  },[account,ready]);
  useEffect(()=>{
    if(!supabase||!account||!cloudReady||cloudOwner!==account)return;
    setCloudMessage("Saving journal changes…");
    const timer=setTimeout(async()=>{
      try {
      const client=supabase!;
      const {data:existing,error:readError}=await client.from("journal_items").select("id,client_id,image_path").eq("user_id",account);
      if(readError){setCloudMessage("Save failed: "+readError.message);return;}
      const rows=[];
      for(const item of stickers){
        const prior=existing?.find(row=>row.client_id===item.id);
        let imagePath=prior?.image_path??null;
        if(item.kind==="photo"&&item.photo?.startsWith("data:")&&!imagePath){
          const blob=await(await fetch(item.photo)).blob();const path=account+"/"+crypto.randomUUID()+".jpg";
          const {error}=await client.storage.from("journal-photos").upload(path,blob,{contentType:"image/jpeg"});
          if(error){setCloudMessage("Photo upload failed: "+error.message);return;}
          imagePath=path;
        }
        rows.push({id:prior?.id??crypto.randomUUID(),user_id:account,client_id:item.id,kind:item.kind,album_key:item.kind==="album"?item.label.toLowerCase().trim():null,label:item.label,subtitle:item.sub,note:item.note??null,image_path:imagePath,page_number:item.page??(item.id.startsWith("page2-")?2:1),pos_x:item.x,pos_y:item.y,rotation:item.rotate,color:item.color});
      }
      if(rows.length){const {error}=await client.from("journal_items").upsert(rows,{onConflict:"user_id,client_id"});if(error){setCloudMessage("Save failed: "+error.message);return;}}
      const removed=(existing??[]).filter(row=>!stickers.some(item=>item.id===row.client_id));
      if(removed.length){const {error}=await client.from("journal_items").delete().eq("user_id",account).in("id",removed.map(row=>row.id));if(error){setCloudMessage("Delete failed: "+error.message);return;}}
      setCloudMessage("Saved to your account ✓");
      } catch(e){setCloudMessage("Save failed: "+(e instanceof Error?e.message:"Unexpected upload error"));}
    },1200);
    return()=>clearTimeout(timer);
  },[stickers,account,cloudReady,cloudOwner]);
  const shown=stickers.filter(s=>(s.page??(s.id.startsWith("page2-")?2:1))===page);
  const hasMelodrama=stickers.some(s=>s.kind==="album"&&s.label.toLowerCase().trim()==="melodrama");
  function startDrag(e:React.PointerEvent<HTMLButtonElement>,id:string){
    if(!board.current)return;
    const rect=board.current.getBoundingClientRect();
    const item=stickers.find(s=>s.id===id);if(!item)return;
    drag.current={id,offsetX:(e.clientX-rect.left)/rect.width*100-item.x,offsetY:(e.clientY-rect.top)/rect.height*100-item.y};
    e.currentTarget.setPointerCapture(e.pointerId);setActive(id);
  }
  function moveDrag(e:React.PointerEvent<HTMLButtonElement>){
    if(!drag.current||!board.current)return;
    const rect=board.current.getBoundingClientRect();
    const {id,offsetX,offsetY}=drag.current;
    const x=clamp((e.clientX-rect.left)/rect.width*100-offsetX,0,78);
    const y=clamp((e.clientY-rect.top)/rect.height*100-offsetY,0,83);
    setStickers(prev=>prev.map(s=>s.id===id?{...s,x,y}:s));
  }
  function add(kind:Sticker["kind"],label:string,sub="",color="#fff1a9"){
    if(kind==="album"&&stickers.some(s=>s.kind==="album"&&s.label.toLowerCase().trim()===label.toLowerCase().trim()))return;
    const id=(page===2?"page2-":"")+kind+"-"+Date.now();
    setStickers(prev=>[...prev,{id,label,sub,x:27+Math.random()*25,y:25+Math.random()*25,rotate:Math.random()*18-9,color,kind,page,note:kind==="note"?"A little memory from this run...":undefined}]);
    setActive(id);
  }
  async function uploadPhoto(file?:File){
    if(!file)return;
    setPhotoError("");
    if(!file.type.startsWith("image/")){setPhotoError("Please choose an image file.");return;}
    if(file.size>12*1024*1024){setPhotoError("Choose a photo under 12 MB.");return;}
    try {
      const image=new Image();const url=URL.createObjectURL(file);
      try {await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error("Could not read this image."));image.src=url;});
        const scale=Math.min(1,900/Math.max(image.naturalWidth,image.naturalHeight));
        const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
        const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Image processing unavailable.");ctx.drawImage(image,0,0,canvas.width,canvas.height);
        const photo=canvas.toDataURL("image/jpeg",0.72);
        const id=(page===2?"page2-":"")+"photo-"+Date.now();
        setStickers(prev=>[...prev,{id,label:"A little memory",sub:"",x:30,y:25,rotate:-5,color:"#ffffff",kind:"photo",photo,page}]);setActive(id);
      }finally{URL.revokeObjectURL(url);}
    }catch{setPhotoError("This photo could not be added. Try a JPG or PNG.");}
  }
  function changeActive(patch:Partial<Sticker>){setStickers(prev=>prev.map(s=>s.id===active?{...s,...patch}:s));}
  const chosen=stickers.find(s=>s.id===active&&shown.includes(s));
  return <main className="min-h-screen bg-[#f9f7f1] text-[#27231e]">
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 md:px-8">
      <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e0d9c9] pb-5"><Link href="/journey" className="rotate-[-3deg] rounded-lg border-2 border-[#1355c8] bg-white px-3 py-1 text-xl font-black text-[#1355c8] shadow-[3px_3px_0_#ffe54f]">album journeys ✳</Link><Link href="/journey" className="text-sm font-black text-[#1355c8] hover:underline">← Back to the Crate</Link></nav>
      <header className="py-8"><p className="text-xs font-black uppercase tracking-[.24em] text-[#1355c8]">THE COLLECTION / VOL. 01</p><h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">My Sticker Book <span className="inline-block rotate-[-12deg]">✿</span></h1><p className="mt-3 max-w-xl text-[#6a6258]">A messy little home for the albums that follow you around. Drag, overlap, rotate, and make the pages yours.</p></header>
      <section className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[#e1d8c7] bg-white p-4">
        {avatarUrl?<img src={avatarUrl} alt="Your avatar" className="h-14 w-14 rounded-full object-cover"/>:<span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1a9] text-2xl">✿</span>}
        <div className="flex-1"><p className="font-black">Your music journal</p><p className="text-xs text-[#756b60]">{account?"Signed in — private cloud storage":"Sign in to save photos and stickers across devices"}</p></div>
        {recoveryMode?<form className="flex flex-wrap items-center gap-2" onSubmit={e=>{e.preventDefault();void updatePassword(newPassword);}}><input type="password" autoComplete="new-password" minLength={6} required placeholder="New password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="rounded-lg border p-2 text-sm"/><button disabled={authBusy} className="rounded-lg bg-[#1355c8] px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Save new password</button></form>:account?<><div className="flex flex-wrap items-center gap-2"><input aria-label="Scrapbook username" value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={40} placeholder="Your scrapbook username" className="rounded-lg border p-2 text-sm"/><button className="rounded-xl border px-3 py-2 text-sm font-bold" onClick={()=>void saveDisplayName()}>Save username</button></div><input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>{void uploadAvatar(e.target.files?.[0]);e.target.value="";}}/><button className="rounded-xl bg-[#fff1a9] px-3 py-2 text-sm font-bold" onClick={()=>avatarInput.current?.click()}>Upload profile picture</button><button className="rounded-xl border px-3 py-2 text-sm font-bold" onClick={()=>void supabase?.auth.signOut()}>Sign out</button></>:supabase?<form className="flex flex-wrap items-center gap-2" onSubmit={e=>{e.preventDefault();void passwordAuth();}}><input type="email" autoComplete="email" required placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} className="rounded-lg border p-2 text-sm"/><input type="password" autoComplete={authMode==="signup"?"new-password":"current-password"} minLength={6} required placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="rounded-lg border p-2 text-sm"/>{authMode==="signup"&&<input required maxLength={40} placeholder="Choose a username" value={displayName} onChange={e=>setDisplayName(e.target.value)} className="rounded-lg border p-2 text-sm"/>}<button disabled={authBusy} className="rounded-lg bg-[#1355c8] px-3 py-2 text-sm font-bold text-white disabled:opacity-50">{authBusy?"Please wait…":authMode==="signup"?"Create account":"Sign in"}</button><button type="button" className="rounded-lg border px-3 py-2 text-sm font-bold" onClick={()=>{setAuthMode(authMode==="signup"?"login":"signup");setCloudMessage("");}}>{authMode==="signup"?"Already have an account?":"Create an account"}</button>{authMode==="login"&&<button type="button" disabled={authBusy} className="rounded-lg border px-3 py-2 text-sm font-bold" onClick={()=>void resetPassword()}>Forgot password?</button>}</form>:<p className="text-xs">Cloud configuration pending</p>}
        {cloudMessage&&<p role="status" className="w-full text-xs text-[#1355c8]">{cloudMessage}</p>}
      </section>
      {account&&!cloudReady&&<p role="status" className="mb-4 rounded-xl bg-white p-3 text-sm font-semibold">Loading your private scrapbook…</p>}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><button onClick={()=>{setPage(1);setActive(null);}} className={`rounded-full px-4 py-2 text-sm font-black ${page===1?"bg-[#1355c8] text-white":"bg-white text-[#1355c8]"}`}>Page 01</button><button onClick={()=>{setPage(2);setActive(null);}} className={`rounded-full px-4 py-2 text-sm font-black ${page===2?"bg-[#1355c8] text-white":"bg-white text-[#1355c8]"}`}>Page 02</button></div><span className="text-xs font-semibold text-[#756b60]">{account?"Your layout syncs to Supabase ✳":"Your layout saves in this browser ✳"}</span></div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_245px]">
        <div ref={board} className="relative min-h-[650px] overflow-hidden rounded-[5px_19px_18px_6px] border border-[#d4c5a6] bg-[#f4e6c7] shadow-[8px_12px_0_#e0d7c4,12px_16px_25px_#a89d8640] md:min-h-[730px]" style={{backgroundImage:"repeating-linear-gradient(0deg,transparent 0px,transparent 29px,#9ca7a128 30px,#9ca7a128 31px),linear-gradient(90deg,#e9d7b4 0px,#e9d7b4 34px,#f9efda 35px,#f9efda 100%)"}}>
          <div className="pointer-events-none absolute bottom-0 left-[27px] top-0 w-px bg-[#e2a9a9]"/><div className="pointer-events-none absolute right-6 top-5 rotate-[8deg] border-2 border-dashed border-[#bd7c66] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[#ae6b5b]">Collected with ♡</div>
          <span className="pointer-events-none absolute bottom-5 right-7 font-serif text-2xl italic text-[#b0a088]">{String(page).padStart(2,"0")}</span>
          {(!account||cloudReady)&&shown.map(s=><button key={s.id} type="button" onPointerDown={e=>startDrag(e,s.id)} onPointerMove={moveDrag} onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null} onClick={()=>setActive(s.id)} aria-label={`Move or edit ${s.label}`} className={`absolute flex touch-none select-none flex-col items-center justify-center text-center shadow-[3px_5px_9px_#5c493740] transition-shadow hover:shadow-[5px_8px_14px_#5c493760] ${active===s.id?"outline-2 outline-dashed outline-[#1355c8] outline-offset-4":""} ${s.kind==="album"?"h-36 w-36 rounded-[47%_53%_48%_52%] border-[6px] border-white p-3 md:h-44 md:w-44":s.kind==="note"?"h-36 w-40 p-4":s.kind==="photo"?"h-44 w-36 border-[7px] border-white bg-white p-1 md:h-52 md:w-44":"h-20 w-20 rounded-full border-4 border-white text-4xl"}`} style={{left:`${s.x}%`,top:`${s.y}%`,transform:`rotate(${s.rotate}deg)`,backgroundColor:s.color,cursor:"grab",zIndex:active===s.id?30:10}}>
            {s.kind==="photo"?<><span className="block h-[80%] w-full overflow-hidden bg-[#eee]">{s.photo&&<img src={s.photo} alt={s.label} draggable={false} className="h-full w-full object-cover"/>}</span><span className="mt-2 font-serif text-xs italic">{s.label}</span></>:s.kind==="album"?<><span className="mb-2 text-[10px] font-black uppercase tracking-wider text-white drop-shadow">{s.sub}</span><span className="font-serif text-2xl font-black italic leading-none text-white drop-shadow-md">{s.label}</span><span className="mt-3 bg-white/90 px-2 py-1 font-mono text-[8px] text-[#222]">AJ ✳ RECORD CLUB</span></>:s.kind==="note"?<><span className="self-start font-serif text-xl font-bold italic">{s.label}</span><span className="mt-2 whitespace-pre-wrap font-serif text-sm italic leading-snug">{s.note}</span></>:<span>{s.label}</span>}
          </button>)}
          {shown.length===0&&<p className="absolute left-1/2 top-1/2 w-56 -translate-x-1/2 -translate-y-1/2 rotate-[-5deg] text-center font-serif text-2xl italic text-[#aa9171]">A fresh page, just for you. ✿</p>}
        </div>
        <aside className="self-start rounded-2xl border border-[#e1d8c7] bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[.18em] text-[#1355c8]">JOURNAL SUPPLIES</p><h2 className="mt-2 text-xl font-black">Make it yours ↗</h2><div className="mt-5 grid gap-2"><button onClick={()=>add("note","Note to self")} className="rounded-xl border border-[#e8d7a1] bg-[#fff1a9] px-4 py-3 text-left text-sm font-bold">✎ Add a sticky note</button><button onClick={()=>add("decoration","✿","","#f3a8bd")} className="rounded-xl border border-[#edc4d1] bg-[#fff1f5] px-4 py-3 text-left text-sm font-bold">✿ Add a flower</button><button onClick={()=>add("decoration","★","","#f5d36a")} className="rounded-xl border border-[#e8d7a1] bg-[#fff9dc] px-4 py-3 text-left text-sm font-bold">★ Add a star</button><button disabled={hasMelodrama} onClick={()=>add("album","Melodrama","Lorde","#4b6fbb")} className="rounded-xl border border-[#cddaf5] bg-[#f1f5ff] px-4 py-3 text-left text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50">💿 {hasMelodrama?"Melodrama collected ✓":"Add Melodrama"}</button><input ref={photoInput} type="file" accept="image/*" className="hidden" aria-label="Choose journal photo" onChange={e=>{void uploadPhoto(e.target.files?.[0]);e.target.value="";}}/><button onClick={()=>photoInput.current?.click()} className="rounded-xl border border-[#b5d7b9] bg-[#edf9ed] px-4 py-3 text-left text-sm font-bold">📷 Add a photo memory</button>{photoError&&<p role="alert" className="text-xs font-semibold text-[#b43243]">{photoError}</p>}</div>
          {chosen&&<div className="mt-6 border-t border-[#eee5d8] pt-5"><p className="text-xs font-black uppercase tracking-widest">Selected sticker</p><p className="mt-2 font-bold">{chosen.label}</p><label className="mt-3 block text-xs font-bold">Rotation <span className="font-normal">{chosen.rotate}°</span><input type="range" min="-35" max="35" value={chosen.rotate} onChange={e=>changeActive({rotate:Number(e.target.value)})} className="mt-2 w-full accent-[#1355c8]"/></label><label className="mt-3 block text-xs font-bold">Journal page<select value={chosen.page??(chosen.id.startsWith("page2-")?2:1)} onChange={e=>{changeActive({page:Number(e.target.value)});setActive(null);}} className="mt-2 w-full rounded-lg border border-[#ddd] bg-white p-2 text-sm"><option value={1}>Page 01</option><option value={2}>Page 02</option></select></label>{chosen.kind==="photo"&&<label className="mt-3 block text-xs font-bold">Photo caption<input value={chosen.label} onChange={e=>changeActive({label:e.target.value})} className="mt-2 w-full rounded-lg border border-[#ddd] p-2 text-sm font-normal"/></label>}{chosen.kind==="note"&&<label className="mt-3 block text-xs font-bold">Your note<textarea value={chosen.note||""} onChange={e=>changeActive({note:e.target.value})} rows={4} className="mt-2 w-full rounded-lg border border-[#ddd] p-2 text-sm font-normal"/></label>}<button onClick={()=>{setStickers(prev=>prev.filter(s=>s.id!==active));setActive(null);}} className="mt-4 text-xs font-bold text-[#c34555] underline">Remove from page</button></div>}
          <p className="mt-6 text-xs leading-relaxed text-[#746d65]">Tip: drag stickers with your mouse or finger. Tap one to rotate it or edit its note. Photos are compressed in your browser and uploaded to private Supabase storage when you sign in. The starter stickers are examples, not verified listening history.</p>
        </aside>
      </div>
    </div>
  </main>;
}
