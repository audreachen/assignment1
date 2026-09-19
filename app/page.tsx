import { supabase } from "@/lib/supabase";

export default async function Home() {
    const { data: songs, error } = await supabase
        .from("Songs")
        .select("*");

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