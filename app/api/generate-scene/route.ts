import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { error: "You must be logged in to generate a painting." },
            { status: 401 }
        );
    }

    try {
        const { songTitle, idea } = await request.json();

        if (!songTitle || !idea) {
            return NextResponse.json(
                { error: "Song title and idea are required." },
                { status: 400 }
            );
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const prompt = `
Create a square pixel-art scene inspired by the song "${songTitle}".

The listener imagines:
"${idea}"

Style requirements:
- nostalgic 16-bit pixel art
- square composition
- atmospheric and expressive
- no text
- no logos
- no album artwork
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-image-preview",
            contents: prompt,
        });

        const parts = response.candidates?.[0]?.content?.parts ?? [];

        const imagePart = parts.find((part) => part.inlineData);

        if (!imagePart?.inlineData?.data) {
            return NextResponse.json(
                { error: "Gemini did not return an image." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            image: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType,
            prompt,
        });
    } catch (error) {
        console.error("Image generation error:", error);

        return NextResponse.json(
            { error: "Image generation failed." },
            { status: 500 }
        );
    }
}