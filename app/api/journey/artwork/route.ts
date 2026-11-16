import { NextRequest, NextResponse } from "next/server";

export const revalidate = 86400;

export async function GET(request: NextRequest) {
  const artist = request.nextUrl.searchParams.get("artist")?.trim() ?? "";
  const album = request.nextUrl.searchParams.get("album")?.trim() ?? "";
  if (!artist || !album || artist.length > 120 || album.length > 150) {
    return new NextResponse(null, { status: 400 });
  }
  try {
    const term = encodeURIComponent(artist + " " + album);
    const knownCatalogNames: Record<string,string> = { "charlixcx|brat":"BRAT", "phoebebridgers|punisher":"Punisher" };
    const key = (artist+"|"+album).toLowerCase().replace(/[^a-z0-9|]/g,"");
    const verifiedCovers: Record<string, string> = {"phoebebridgers|punisher": "https://image-cdn-fa.spotifycdn.com/image/ab67616d0000b273a91b75c9ef65ed8d760ff600", "beyonc|renaissance": "https://image-cdn-fa.spotifycdn.com/image/ab67616d0000b27369a3c061676c2020adfe8315", "chappellroan|theriseandfallofamidwestprincess": "https://image-cdn-fa.spotifycdn.com/image/ab67616d0000b273a21d22ecf823e1c90aa22d1f", "charlixcx|brat": "https://image-cdn-ak.spotifycdn.com/image/ab67616d0000b273f88b43d15fd14e9525338b59", "acdc|dirtydeedsdonedirtcheap": "https://image-cdn-ak.spotifycdn.com/image/ab67616d0000b273dfce70698f4d925525383c7c"};
    if (verifiedCovers[key]) return NextResponse.redirect(verifiedCovers[key], { status: 307, headers: { "Cache-Control": "public, max-age=86400" } });
    const response = await fetch(`https://itunes.apple.com/search?term=${term}&entity=album&limit=25`, {
      next: { revalidate: 86400 }, signal: AbortSignal.timeout(6500)
    });
    if (!response.ok) return new NextResponse(null, { status: 404 });
    const data: { results?: Array<{ artistName?: string; collectionName?: string; artworkUrl100?: string }> } = await response.json();
    const normalize = (text: string) => text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
    const wantedArtist = normalize(artist);
    const wantedAlbum = normalize(album);
    const found = data.results?.find(item =>
      normalize(item.artistName ?? "") === wantedArtist &&
      (normalize(item.collectionName ?? "") === wantedAlbum || normalize(item.collectionName ?? "").startsWith(wantedAlbum)) &&
      typeof item.artworkUrl100 === "string"
    );
    let match = found;
    // Apple occasionally returns edition titles or artist formatting that differ
    // from our display labels. Retry by album title before giving up.
    if (!match && knownCatalogNames[key]) {
      const retryTerm = encodeURIComponent(knownCatalogNames[key] + " " + artist);
      const retry = await fetch(`https://itunes.apple.com/search?term=${retryTerm}&entity=album&limit=100`, {
        next: { revalidate: 86400 }, signal: AbortSignal.timeout(6500)
      });
      if (retry.ok) {
        const retryData: typeof data = await retry.json();
        match = retryData.results?.find(item =>
          normalize(item.artistName ?? "").includes(wantedArtist) &&
          normalize(item.collectionName ?? "").startsWith(wantedAlbum) &&
          typeof item.artworkUrl100 === "string"
        ) ?? retryData.results?.find(item =>
          normalize(item.collectionName ?? "") === wantedAlbum &&
          typeof item.artworkUrl100 === "string"
        );
      }
    }
    if (!match?.artworkUrl100) return new NextResponse(null, { status: 404 });
    const artwork = new URL(match.artworkUrl100);
    if (artwork.protocol !== "https:" || !artwork.hostname.endsWith(".mzstatic.com")) {
      return new NextResponse(null, { status: 404 });
    }
    artwork.pathname = artwork.pathname.replace(/\d+x\d+bb(?=\.)/, "600x600bb");
    return NextResponse.redirect(artwork, { status: 307, headers: { "Cache-Control": "public, max-age=86400" } });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
