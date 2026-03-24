import { NextRequest } from "next/server";
import { CATEGORIES } from "@/lib/types";
import { fetchCategoryWithProgress } from "@/lib/propublica";
import { enrichCategoryBenchmarkWithCharityNavigator, hasCharityNavigatorApiKey } from "@/lib/charity-navigator";
import { buildCategoryBenchmark } from "@/lib/ratios";
import type { SSEProgress } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categorySlug = searchParams.get("category");
  const topN = parseInt(searchParams.get("top") || "20", 10);
  const state = searchParams.get("state") || undefined;
  const location = searchParams.get("location") || undefined;
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");

  if (!categorySlug) {
    return new Response(JSON.stringify({ error: "Missing category parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const config = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!config) {
    return new Response(JSON.stringify({ error: `Unknown category: ${categorySlug}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  let streamClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: SSEProgress) {
        if (streamClosed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          streamClosed = true;
        }
      }

      try {
        const fetchResult = await fetchCategoryWithProgress(
          config,
          topN,
          send,
          state,
          location,
          latitude ? Number(latitude) : undefined,
          longitude ? Number(longitude) : undefined,
        );

        send({ phase: "compute", message: "Computing benchmarks and ratios..." });
        let benchmark = buildCategoryBenchmark(config, fetchResult.details);
        benchmark = {
          ...benchmark,
          locationFilter: fetchResult.locationFilter,
          orgs: benchmark.orgs.map((org) => ({
            ...org,
            distanceMiles: fetchResult.distancesByEin[org.profile.ein] ?? null,
          })),
        };

        if (hasCharityNavigatorApiKey()) {
          benchmark = await enrichCategoryBenchmarkWithCharityNavigator(benchmark, send);
        }

        send({ phase: "complete", data: benchmark, message: `Done. ${benchmark.orgCount} organizations benchmarked.` });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        send({ phase: "error", message });
      } finally {
        if (!streamClosed) {
          try {
            controller.close();
          } catch {
            // already closed
          }
        }
      }
    },
    cancel() {
      streamClosed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
