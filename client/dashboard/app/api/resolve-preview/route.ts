import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const parsed = new URL(url);

    // If it's an itch.io game page, scrape the embeddable itch.zone WebGL frame URL
    if (parsed.hostname.endsWith("itch.io")) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(6000),
        });
        const html = await response.text();
        const match = html.match(/https:\/\/[^"'\s]+\.itch\.zone\/[^"'\s]+/);
        if (match) {
          const embedUrl = match[0].replace(/&quot;.*$/, "").replace(/["'\\]+$/, "");
          return NextResponse.json({
            embedUrl,
            originalUrl: url,
            isItchZone: true,
            embeddable: true,
          });