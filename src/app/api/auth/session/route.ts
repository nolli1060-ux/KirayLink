import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session =
    request.cookies.getAll().length > 0 ? await getSession() : null;
  return NextResponse.json(
    { user: session },
    { headers: { "Cache-Control": "no-store" } }
  );
}
