import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type TrackBody = {
  slug?: unknown;
  event?: unknown;
};

const EVENTS = new Set(["view", "whatsapp"]);

export async function POST(request: Request) {
  let body: TrackBody;
  try {
    body = (await request.json()) as TrackBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const slug =
    typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const event = typeof body.event === "string" ? body.event.trim() : "";

  if (!slug || !EVENTS.has(event)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ua = request.headers.get("user-agent") ?? "";
  if (/bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp/i.test(ua)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("track_property_event", {
    p_slug: slug,
    p_event: event,
  });

  if (error) {
    console.error("track_property_event", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
