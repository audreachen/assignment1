import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

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

  const runtimeToken = process.env.JOURNEY_RUNTIME_TOKEN;
  if (!runtimeToken) return NextResponse.json({ error: "AI generation logging is temporarily unavailable." }, { status: 503 });

  // Atomic database-backed limiter works across Vercel instances.
  // Fail closed if its configuration or database is unavailable.
  const supabaseUrl = process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "AI generation is temporarily unavailable." }, { status: 503 });
  }
  const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const bucket = createHash("sha256").update(ip + ":" + (process.env.GEMINI_API_KEY ?? "")).digest("hex");
  try {
    const limiter = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: claim, error: claimError } = await limiter.rpc("claim_ai_request", {
      p_bucket_key: bucket, p_max_requests: 8, p_window_seconds: 3600
    });
    if (claimError || !Array.isArray(claim) || claim.length === 0) {
      console.error("AI limiter unavailable", claimError?.code ?? "invalid result");
      return NextResponse.json({ error: "AI generation is temporarily unavailable. Please try later." }, { status: 503 });
    }
    if (!claim[0].allowed) {
      return NextResponse.json({ error: "You've reached the limit of 8 AI maps per hour. Please try again later." }, {
        status: 429, headers: { "Retry-After": String(claim[0].retry_after_seconds ?? 3600) }
      });
    }
  } catch {
    return NextResponse.json({ error: "AI generation is temporarily unavailable. Please try later." }, { status: 503 });
  }

  const db = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
  let userId: string | null = null;
  const bearer = request.headers.get("authorization");
  if (bearer) {
    const token = bearer.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return NextResponse.json({ error: "Invalid sign-in token." }, { status: 401 });
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) return NextResponse.json({ error: "Your session expired. Please sign in again." }, { status: 401 });
    userId = data.user.id;
  }
  type Step = { id: string; prompt_template: string; model_key: string; temperature: number };
  type Config = { chain_id: string; steps: Step[]; terms: unknown[]; examples: unknown[] };
  let requestId: string | null = null;
  async function rpc(name: string, values: Record<string, unknown>) {
    const result = await db.rpc(name, { p_token: runtimeToken, ...values });
    if (result.error) throw new Error("Generation audit unavailable: " + result.error.code);
    return result.data;
  }
  try {
    const config = await rpc("journey_runtime_config", {}) as Config;
    if (!config?.steps?.length) throw new Error("No enabled generation chain");
    requestId = await rpc("journey_begin_request", { p_chain_id: config.chain_id, p_input: { description, minutes }, p_user_id: userId }) as string;
    const ai = new GoogleGenAI({ apiKey });
    let previousOutput = "";
    for (const step of config.steps) {
      const prompt = step.prompt_template.replaceAll("{{minutes}}", String(minutes)).replaceAll("{{description}}", description)
        + (previousOutput ? "\nPrevious step output: " + previousOutput : "")
        + "\nVocabulary: " + JSON.stringify(config.terms)
        + "\nExample inputs and outputs (illustrations only): " + JSON.stringify(config.examples);
      for (let attempt = 0; attempt < 3; attempt++) {
        const started = Date.now();
        let output: string | null = null;
        let failure: unknown;
        try {
          const response = await ai.models.generateContent({
            model: step.model_key,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  energy: { type: Type.ARRAY, items: { type: Type.INTEGER, minimum: 0, maximum: 100 }, minItems: 10, maxItems: 10 }
                },
                required: ["title", "description", "energy"]
              },
              temperature: Number(step.temperature),
              thinkingConfig: { thinkingBudget: 0 },
              httpOptions: { timeout: 20000 }
            }
          });
          output = response.text?.trim() ?? "";
          if (!output) throw new Error("Empty Gemini response");
        } catch (error) { failure = error; }
        // Persist every actual provider attempt, including errors, before continuing.
        const errorText = failure ? (failure instanceof Error ? failure.message : String(failure)).slice(0,4000) : null;
        await rpc("journey_record_response", { p_request_id: requestId, p_step_id: step.id, p_model_key: step.model_key,
          p_prompt: prompt, p_output: output, p_error: errorText, p_duration_ms: Date.now() - started });
        if (failure) {
          if (!/503|unavailable|high demand|overloaded/i.test(errorText ?? "") || attempt === 2) throw failure;
          await new Promise(resolve => setTimeout(resolve, 700 * (attempt+1)));
        } else { previousOutput = output!; break; }
      }
    }
    const value: unknown = JSON.parse(previousOutput.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
    if (!value || typeof value !== "object") throw new Error("Invalid output structure");
    const data = value as Record<string, unknown>;
    const title = typeof data.title === "string" ? data.title.trim() : "";
    const summary = typeof data.description === "string" ? data.description.trim() : "";
    const energy = Array.isArray(data.energy) ? data.energy : [];
    if (!title || !summary || energy.length !== 10 || !energy.every(n => Number.isInteger(n) && n >= 0 && n <= 100)) throw new Error("Invalid output energy map");
    const output = { title: title.slice(0,55), description: summary.slice(0,250), energy };
    await rpc("journey_finish_request", { p_request_id: requestId, p_output: output });
    return NextResponse.json(output);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown generation error";
    if (requestId) {
      try { await rpc("journey_finish_request", { p_request_id: requestId, p_error: detail.slice(0,4000) }); }
      catch { console.error("Could not finalize generation audit", requestId); }
    }
    console.error("Run-vibe generation failed", { requestId, category: /audit/.test(detail) ? "audit" : "provider_or_output" });
    if (/429|quota|resource.exhausted|rate limit/i.test(detail)) return NextResponse.json({ error: "Gemini's quota or rate limit was reached. Please wait and try again." }, { status: 429 });
    if (/503|unavailable|high demand|overloaded|audit|enabled generation chain/i.test(detail)) return NextResponse.json({ error: "AI generation is temporarily unavailable. Please try again later." }, { status: 503 });
    return NextResponse.json({ error: "AI generation could not complete. Please try again later." }, { status: 502 });
  }
}
