"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type GenerateSceneFormProps = {
    userId: string;
    songId: number;
    songTitle: string;
};

export default function GenerateSceneForm({
                                              userId,
                                              songId,
                                              songTitle,
                                          }: GenerateSceneFormProps) {
    const [idea, setIdea] = useState("");
    const [message, setMessage] = useState("");
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const router = useRouter();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setIsGenerating(true);
        setMessage("Generating your scene...");
        setGeneratedImage(null);

        try {
            const response = await fetch("/api/generate-scene", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    songTitle,
                    idea,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.error || "Generation failed.");
                return;
            }

            const imageUrl = `data:${data.mimeType};base64,${data.image}`;

// Convert Gemini's base64 image into a file we can upload.
            const imageResponse = await fetch(imageUrl);
            const imageBlob = await imageResponse.blob();

            const supabase = createClient();

// Give every painting its own unique filename inside the user's folder.
            const fileExtension =
                data.mimeType === "image/jpeg" ? "jpg" : "png";

            const filePath =
                `${userId}/${crypto.randomUUID()}.${fileExtension}`;

// Upload the actual image to Supabase Storage.
            const { error: uploadError } = await supabase.storage
                .from("generated-scenes")
                .upload(filePath, imageBlob, {
                    contentType: data.mimeType,
                });

            if (uploadError) {
                setMessage(`Image upload failed: ${uploadError.message}`);
                return;
            }

// Get the permanent public URL for the uploaded image.
            const { data: publicUrlData } = supabase.storage
                .from("generated-scenes")
                .getPublicUrl(filePath);

            const permanentImageUrl = publicUrlData.publicUrl;

// Save the generation itself in the database.
            const { error: generationError } = await supabase
                .from("generations")
                .insert({
                    user_id: userId,
                    song_id: songId,
                    prompt: data.prompt,
                    image_url: permanentImageUrl,
                });

            if (generationError) {
                setMessage(`Saving generation failed: ${generationError.message}`);
                return;
            }

            setGeneratedImage(permanentImageUrl);
            setMessage("Painting crafted and saved!");

// Refresh server data so the new painting can appear in the gallery.
            router.refresh();
        } catch (error) {
            console.error("Generation request failed:", error);
            setMessage("Generation failed.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <section className="painting-workshop">
            <div className="workshop-heading">
                <span>✦ PAINTING TABLE ✦</span>
                <h3>Imagine This Song</h3>
                <p>
                    What do you picture while listening to{" "}
                    <strong>{songTitle}</strong>?
                </p>
            </div>

            <form onSubmit={handleSubmit} className="scene-form">
                <input
                    type="text"
                    value={idea}
                    onChange={(event) => setIdea(event.target.value)}
                    placeholder="A rainy subway platform at midnight..."
                    required
                />

                <button type="submit" disabled={isGenerating}>
                    {isGenerating ? "CRAFTING..." : "CRAFT PAINTING"}
                </button>
            </form>

            {message && (
                <p className="generation-message">
                    {message}
                </p>
            )}

            {generatedImage && (
                <div className="generated-painting">
                    <div className="painting-frame">
                        <img
                            src={generatedImage}
                            alt={`AI-generated pixel art inspired by ${songTitle}`}
                        />
                    </div>

                    <p>Inspired by {songTitle}</p>
                </div>
            )}
        </section>
    );
}


