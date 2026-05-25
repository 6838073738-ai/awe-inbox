import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDetail } from "@/components/EventDetail";
import { getCuratedFeed } from "@/lib/curation";
import { fetchOpenEvents } from "@/lib/eonet";
import { scoreEvent } from "@/lib/curation";
import { resolveImagery } from "@/lib/gibs";
import { reflections } from "@/lib/reflections";
import { lastPointGeom } from "@/lib/format";
import type { CategoryId, ScoredEvent } from "@/lib/types";

type Params = { id: string };

async function getScoredById(id: string): Promise<ScoredEvent | null> {
  const decoded = decodeURIComponent(id);

  // First check the curated 7 (cached via getCuratedFeed)
  const feed = await getCuratedFeed();
  const fromFeed = feed.today
    ? [feed.today, ...feed.inbox].find((s) => s.event.id === decoded)
    : feed.inbox.find((s) => s.event.id === decoded);
  if (fromFeed) {
    const point = lastPointGeom(fromFeed.event.geometry);
    if (point) {
      const dateRef = new Date(point.date);
      fromFeed.imagery = await resolveImagery(point.lat, point.lng, dateRef, {
        halfWidthDeg: 2,
        width: 2048,
        height: 1024,
      });
    }
    return fromFeed;
  }

  // Fall back to the full open feed (globe shows a broader set than the curated 7)
  const open = await fetchOpenEvents(60);
  const match = open.find((e) => e.id === decoded);
  if (!match) return null;

  const breakdown = scoreEvent(match);
  const point = lastPointGeom(match.geometry);
  const imagery = point
    ? await resolveImagery(point.lat, point.lng, new Date(point.date), {
        halfWidthDeg: 2,
        width: 2048,
        height: 1024,
      })
    : undefined;

  return {
    event: match,
    score: breakdown.score,
    breakdown,
    category: match.categories[0]?.id as CategoryId,
    imagery,
  };
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { id } = await params;
  const scored = await getScoredById(id);
  if (!scored) {
    return { title: "Event not found" };
  }
  const ref =
    scored.category in reflections
      ? reflections[scored.category as keyof typeof reflections]
      : null;
  return {
    title: scored.event.title,
    description: ref?.short ?? "A planetary event from NASA EONET.",
    openGraph: {
      title: scored.event.title,
      description: ref?.short ?? undefined,
      type: "article",
    },
  };
}

export default async function EventPage(
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const scored = await getScoredById(id);
  if (!scored) notFound();

  const point = lastPointGeom(scored.event.geometry);
  const ref =
    scored.category in reflections
      ? reflections[scored.category as keyof typeof reflections]
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: scored.event.title,
    datePublished: point?.date,
    description: ref?.short,
    author: { "@type": "Organization", name: "Awe Inbox" },
    publisher: { "@type": "Organization", name: "Awe Inbox" },
    about: point
      ? {
          "@type": "Place",
          name: scored.event.title,
          geo: {
            "@type": "GeoCoordinates",
            latitude: point.lat,
            longitude: point.lng,
          },
        }
      : undefined,
    isBasedOn: scored.event.sources?.[0]?.url ?? scored.event.link,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EventDetail scored={scored} />
    </>
  );
}
