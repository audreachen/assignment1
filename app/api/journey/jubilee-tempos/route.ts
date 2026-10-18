import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const tracks = ["Paprika","Be Sweet","Kokomo, IN","Slide Tackle","Posing in Bondage","Sit","Savage Good Boy","In Hell","Tactics","Posing for Cars"];
type Result = { title:string; bpm:number|null; sourceUrl:string|null; status:"matched"|"unverified"|"missing" };
type Candidate = { title?:string; tempo?:number|string; uri?:string; artist?:{name?:string}|{name?:string}[]; album?:{title?:string}|{title?:string}[] };
const normalize=(s:string)=>s.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
function matchCandidate(title:string,candidates:Candidate[]):Candidate|undefined {
  return candidates.find(c=>normalize(c.title??"")===normalize(title)&&(Array.isArray(c.artist)?c.artist.some(a=>normalize(a.name??"")==="japanese breakfast"):normalize((c.artist as {name?:string}|undefined)?.name??"")==="japanese breakfast")&&
    (Array.isArray(c.album)?c.album.some(a=>normalize(a.title??"")==="jubilee"):normalize((c.album as {title?:string}|undefined)?.title??"")==="jubilee"));
}
export async function GET() {
  const key=process.env.GETSONGBPM_API_KEY;
  if(!key) return NextResponse.json({error:"Tempo service not configured",tracks:tracks.map(title=>({title,bpm:null,sourceUrl:null,status:"missing"}))},{status:503,headers:{"Cache-Control":"no-store"}});
  const diagnostics:Record<string,number>={};
  const note=(reason:string)=>{diagnostics[reason]=(diagnostics[reason]??0)+1};
  const results:Result[]=await Promise.all(tracks.map(async title=>{
    const fallback:Result={title,bpm:null,sourceUrl:null,status:"missing"};
    try {
      const url=new URL("https://api.getsong.co/search/");
      url.searchParams.set("type","both");
      url.searchParams.set("lookup",`song:${title} artist:Japanese Breakfast`);
      url.searchParams.set("limit","20");
      const response=await fetch(url,{headers:{"X-API-KEY":key},cache:"no-store",signal:AbortSignal.timeout(7000)});
      if(!response.ok){note(`upstream_http_${response.status}`);return fallback;}
      const data=await response.json() as {search?:Candidate[]};
      let candidates=Array.isArray(data.search)?data.search:[];
      if(candidates.length===0){
        const broad=new URL("https://api.getsong.co/search/");
        broad.searchParams.set("type","song");
        broad.searchParams.set("lookup",title);
        broad.searchParams.set("limit","50");
        try {
          const fallbackResponse=await fetch(broad,{headers:{"X-API-KEY":key},cache:"no-store",signal:AbortSignal.timeout(7000)});
          if(fallbackResponse.ok){const body=await fallbackResponse.json() as {search?:Candidate[]};candidates=Array.isArray(body.search)?body.search:[];}
          else note(`broad_search_http_${fallbackResponse.status}`);
        }catch{note("broad_search_network_error");}
      }
      if(candidates.length===0)note("no_search_results_after_broad_retry");
      const candidate=matchCandidate(title,candidates);
      if(candidates.length>0&&!candidate){
        note("no_exact_artist_title_album_match");
        const sameTitle=candidates.filter(c=>normalize(c.title??"")===normalize(title));
        const sameArtist=sameTitle.filter(c=>Array.isArray(c.artist)?c.artist.some(a=>normalize(a.name??"")==="japanese breakfast"):normalize((c.artist as {name?:string}|undefined)?.name??"")==="japanese breakfast");
        if(sameTitle.length===0)note("no_exact_title_in_candidates");
        else if(sameArtist.length===0)note("no_exact_artist_in_title_matches");
        else note("artist_title_match_but_album_missing_or_different");
      }
      const bpm=Number(candidate?.tempo);
      if(!candidate)return fallback;
      if(!Number.isFinite(bpm)||bpm<40||bpm>220||!candidate.uri?.startsWith("https://getsongbpm.com/")){note("invalid_bpm_or_source_url");return fallback;}
      return {title,bpm,sourceUrl:candidate.uri,status:"matched"};
    }catch{note("network_or_parse_error");return fallback;}
  }));
  return NextResponse.json({tracks:results,source:"GetSongBPM",diagnostics,note:"Database matches are provisional and may require independent tempo verification."},{headers:{"Cache-Control":"no-store"}});
}
