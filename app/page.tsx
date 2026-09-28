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
        <main
            style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "40px 20px",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <h1>My Songs</h1>

            {user && (
                <div>
                    <p>
                        <Link href="/profile">Profile</Link>
                    </p>

                    <p>
                        <Link href="/collection">My Collection</Link>
                    </p>
                </div>
            )}

            {/* Logged out: offer Google login */}
            {!user && <GoogleSignInButton />}

            {/* Logged in, but profile isn't complete: ask for names */}
            {user && (!profile?.first_name || !profile?.last_name) && (
                <CompleteProfileForm userId={user.id} />
            )}

            {/* Assignment #2 song list */}
            <div style={{ display: "grid", gap: "16px" }}>
                {songs?.map((song) => (
                    <div
                        key={song.id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "20px",
                        }}
                    >
                        <h2 style={{ margin: "0 0 8px" }}>{song.title}</h2>

                        <p style={{ margin: "0 0 4px" }}>
                            <strong>Artist:</strong> {song.artist}
                        </p>

                        <p style={{ margin: 0 }}>
                            <strong>Year:</strong> {song.year}
                        </p>
                    </div>
                ))}
            </div>
        </main>
    );
}