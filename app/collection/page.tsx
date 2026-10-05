import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { supabase as musicSupabase } from "@/lib/supabase";
import RecordPlayer from "@/components/collection/RecordPlayer";

export default async function CollectionPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    const { data: songs, error } = await musicSupabase
        .from("Songs")
        .select("*");

    const { data: generations, error: generationsError } = await supabase
        .from("generations")
        .select("*")
        .order("created_at", { ascending: false });

    if (generationsError) {
        console.error("Error loading generations:", generationsError.message);
    }

    if (error) {
        return (
            <main>
                <p>Error loading collection: {error.message}</p>
            </main>
        );
    }

    return (
        <main className="collection-page">
            <nav className="game-nav">
                <Link href="/" className="game-logo">
                    ♪ JUKECRAFT
                </Link>

                <div className="game-nav-links">
                    <Link href="/">SONGS</Link>
                    <Link href="/profile">PROFILE</Link>
                </div>
            </nav>

            <header className="collection-header">
                <span>✦ YOUR MUSIC WORLD ✦</span>

                <h1>My Collection</h1>

                <p>
                    Insert a music disc, imagine the world behind the song,
                    and turn it into a painting.
                </p>

                <div className="collection-count">
                    {songs?.length ?? 0} MUSIC DISCS
                </div>
            </header>

            <RecordPlayer
                songs={songs ?? []}
                userId={user.id}
                generations={generations ?? []}
            />
        </main>
    );
}