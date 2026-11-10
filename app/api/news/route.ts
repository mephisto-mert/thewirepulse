import { NextResponse } from "next/server";
import { getCachedWireNews } from "@/lib/feeds-cache";

export const dynamic = "force-dynamic";

// Lightweight in-memory rate limiter: 60 requests per minute per IP
const ipRequestMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestMap.get(ip);
  if (!record || now > record.expiresAt) {
    ipRequestMap.set(ip, { count: 1, expiresAt: now + 60000 });
    return false;
  }
  if (record.count >= 60) {
    return true;
  }
  record.count += 1;
  return false;
}

export async function GET(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { success: false, error: "Too many telemetry sync requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const { articles, fromCache } = await getCachedWireNews();
    return NextResponse.json(
      {
        success: true,
        count: articles.length,
        fromCache,
        timestamp: new Date().toISOString(),
        articles
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120"
        }
      }
    );
  } catch (error: any) {
    console.error("API news route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch live wire feeds" },
      { status: 500 }
    );
  }
}
