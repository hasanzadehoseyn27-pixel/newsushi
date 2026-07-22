import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".ogg"]);
const MAX_VIDEO_BYTES = 150 * 1024 * 1024;

function extensionFrom(file: File) {
  const byName = path.extname(file.name || "").toLowerCase();
  if (ALLOWED_EXTENSIONS.has(byName)) return byName;
  if (file.type === "video/webm") return ".webm";
  if (file.type === "video/mp4") return ".mp4";
  if (file.type === "video/quicktime") return ".mov";
  if (file.type === "video/ogg") return ".ogg";
  return "";
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ detail: "فایل ویدیو ارسال نشده است" }, { status: 400 });
  }

  const ext = extensionFrom(file);
  if (!ext) {
    return NextResponse.json({ detail: "فرمت ویدیو پشتیبانی نمی‌شود" }, { status: 400 });
  }

  if (file.size > MAX_VIDEO_BYTES) {
    return NextResponse.json({ detail: "حجم ویدیو بیش از حد مجاز است" }, { status: 400 });
  }

  const uploadDir = path.resolve(process.cwd(), "..", "backend", "static", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${randomUUID().replaceAll("-", "")}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/static/uploads/${filename}` });
}
