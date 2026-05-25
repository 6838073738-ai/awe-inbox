import { NextResponse } from "next/server";
import { debugScoreReport, getCuratedFeed } from "@/lib/curation";

// Development-only endpoint that returns a tidy score breakdown table for
// today's EONET events. Useful for verifying that the threat-awe filter is
// behaving against live data. Not linked from anywhere.

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }
  const [report, feed] = await Promise.all([
    debugScoreReport(30),
    getCuratedFeed(),
  ]);
  return NextResponse.json({
    surfaced: {
      today: feed.today
        ? { id: feed.today.event.id, title: feed.today.event.title, score: feed.today.score }
        : null,
      inbox: feed.inbox.map((s) => ({
        id: s.event.id,
        title: s.event.title,
        category: s.category,
        score: s.score,
      })),
      generatedAt: feed.generatedAt,
      totalConsidered: feed.totalConsidered,
    },
    topScored: report,
  });
}
