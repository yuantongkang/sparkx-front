import { NextResponse } from "next/server";

import { clearSparkxSessionCookie } from "@/lib/sparkx-session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSparkxSessionCookie(response);
  return response;
}
