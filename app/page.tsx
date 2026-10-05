import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import CompleteProfileForm from "@/components/profile/CompleteProfileForm";
import { createClient } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function Home() {
    // Assignment #2: get the songs
    const { data: songs, error } = await supabase
        .from("Songs")
        .select("*");

    // Assignment #3: determine who is logged in
    const authSupabase = await createClient();

    const {
        data: { user },
    } = await authSupabase.auth.getUser();

    // If someone is logged in, get their profile
    let profile = null;

    if (user) {
        const { data } = await authSupabase
            .from("profiles")
            .select("first_name, last_name, avatar_url")
            .eq("id", user.id)
            .single();

        profile = data;
    }

    // Keep your Assignment #2 error handling
    if (error) {
        return (
            <main>
                <h1>My Songs</h1>
                <p>Error loading songs: {error.message}</p>
            </main>
        );
    }

    return (
        <main className="songs-page">
            <nav className="game-nav">
                <Link href="/" className="game-logo">
                    ♪ JUKECRAFT
                </Link>

                {user && (
                    <div className="game-nav-links">
                        <Link href="/collection">JUKEBOX</Link>
                        <Link href="/profile">PROFILE</Link>
                    </div>
                )}
            </nav>

            <header className="songs-header">
                <span>✦ MUSIC INVENTORY ✦</span>
                <h1>My Songs</h1>
                <p>
                    Choose a music disc from the collection and take it
                    to the jukebox.
                </p>
            </header>

            {/* Logged out: offer Google login */}
            {!user && (
                <div className="songs-login">
                    <p>Sign in to access your jukebox and create paintings.</p>
                    <GoogleSignInButton />
                </div>
            )}

            {/* Logged in, but profile isn't complete */}
            {user && (!profile?.first_name || !profile?.last_name) && (
                <CompleteProfileForm userId={user.id} />
            )}

            <section className="disc-inventory">
                {songs?.map((song, index) => (
                    <div className="disc-card" key={song.id}>
                        <div className="inventory-slot">
                            <div className="inventory-disc">
                                <div className="inventory-disc-label">
                                    {index + 1}
                                </div>
                            </div>
                        </div>

                        <div className="disc-info">
                        <span className="disc-number">
                            MUSIC DISC #{String(index + 1).padStart(2, "0")}
                        </span>

                            <h2>{song.title}</h2>

                            <p>{song.artist}</p>

                            <small>{song.year}</small>
                        </div>
                    </div>
                ))}
            </section>

            {user && (
                <div className="inventory-action">
                    <Link href="/collection">
                        OPEN JUKEBOX →
                    </Link>
                </div>
            )}
        </main>
    );
}