import { NextResponse } from "next/server";
import { fetchLiveWireNews } from "@/lib/feeds";

export const revalidate = 60; // Cache for 60s, then revalidate

export async function GET() {
  try {
    const articles = await fetchLiveWireNews();
    return NextResponse.json({
      success: true,
      count: articles.length,
      timestamp: new Date().toISOString(),
      articles
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
