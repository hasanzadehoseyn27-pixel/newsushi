import { NextRequest, NextResponse } from "next/server";

function readTranslatedText(payload: unknown): string {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return "";
  return payload[0]
    .map((part) => (Array.isArray(part) && typeof part[0] === "string" ? part[0] : ""))
    .join("")
    .trim();
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    text?: string;
    source?: string;
    target?: string;
  } | null;

  const text = body?.text?.trim() ?? "";
  const source = body?.source ?? "fa";
  const target = body?.target;

  if (!text) return NextResponse.json({ text: "" });
  if (target !== "en" && target !== "ja") {
    return NextResponse.json({ detail: "زبان مقصد پشتیبانی نمی‌شود" }, { status: 400 });
  }

  const params = new URLSearchParams({
    client: "gtx",
    sl: source,
    tl: target,
    dt: "t",
    q: text,
  });

  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ detail: "ترجمه گوگل در دسترس نیست" }, { status: 502 });
  }

  const translated = readTranslatedText(await response.json());
  return NextResponse.json({ text: translated });
}
