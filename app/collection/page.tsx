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

    if (error) {
        return (
            <main>
                <p>Error loading collection: {error.message}</p>
            </main>
        );
    }

    return (
        <main
            style={{
                maxWidth: "900px",
                margin: "0 auto",
                padding: "40px 20px",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <nav>
                <Link href="/">Home</Link>
                {" | "}
                <Link href="/profile">Profile</Link>
            </nav>

            <h1>My Collection</h1>

            <p>Number of songs: {songs?.length ?? 0}</p>

            <RecordPlayer songs={songs ?? []} />
        </main>
    );
}