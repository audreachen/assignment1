import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error("Auth callback error:", error.message);
            return NextResponse.redirect(
                new URL("/?error=auth_callback_failed", requestUrl.origin)
            );
        }
    }

    return NextResponse.redirect(new URL("/", requestUrl.origin));
}
