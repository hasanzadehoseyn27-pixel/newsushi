import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_EXTENSIONS = new Set([".mp3", ".wav", ".m4a", ".ogg", ".webm"]);
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

function extensionFrom(file: File) {
  const byName = path.extname(file.name || "").toLowerCase();
  if (ALLOWED_EXTENSIONS.has(byName)) return byName;
  if (file.type === "audio/webm") return ".webm";
  if (file.type === "audio/ogg") return ".ogg";
  if (file.type === "audio/mpeg") return ".mp3";
  if (file.type === "audio/wav") return ".wav";
  return "";
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ detail: "فایل صوتی ارسال نشده است" }, { status: 400 });
  }

  const ext = extensionFrom(file);
  if (!ext) {
    return NextResponse.json({ detail: "فرمت صوت پشتیبانی نمی‌شود" }, { status: 400 });
  }

  if (file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ detail: "حجم صوت بیش از حد مجاز است" }, { status: 400 });
  }

  const uploadDir = path.resolve(process.cwd(), "..", "backend", "static", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${randomUUID().replaceAll("-", "")}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/static/uploads/${filename}` });
}
