import { NextResponse, type NextRequest } from "next/server";
import { adminClient, adminConfigured } from "@/lib/supabase/server";

// The email link lands here with a one-time code; trade it for a session, then go to the inbox.
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  if (code && adminConfigured()) {
    const supabase = await adminClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/admin`);
  }
  return NextResponse.redirect(`${origin}/admin/login?error=1`);
}
