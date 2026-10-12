import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI generation is not configured." }, { status: 503 });
  }

  let input: { description?: unknown; minutes?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const description = typeof input.description === "string" ? input.description.trim() : "";
  const minutes = Number(input.minutes);
  if (!description || description.length > 500 || !Number.isFinite(minutes) || minutes < 20 || minutes > 90) {
    return NextResponse.json({ error: "Provide a run description and valid duration." }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Create an imaginative, illustrative running energy journey for a " + minutes +
        "-minute run. User description: " + description +
        ". Return a short title (max 55 characters), one-sentence description, and exactly 10 energy numbers from 0 to 100, sampled evenly throughout the run. Do not claim to analyze real audio.",
      config: { responseMimeType: "application/json", temperature: 0.7 }
    });
    const value: unknown = JSON.parse(response.text || "{}");
    if (!value || typeof value !== "object") throw new Error("Invalid output");
    const data = value as Record<string, unknown>;
    if (typeof data.title !== "string" || typeof data.description !== "string" ||
        !Array.isArray(data.energy) || data.energy.length !== 10 ||
        !data.energy.every((n: unknown) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 100)) {
      throw new Error("Invalid output");
    }
    return NextResponse.json({
      title: data.title.slice(0, 55),
      description: data.description.slice(0, 250),
      energy: data.energy.map((n: number) => Math.round(n))
    });
  } catch (error) {
    console.error("Gemini run vibe failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "AI generation is temporarily unavailable. Try again." }, { status: 502 });
  }
}
