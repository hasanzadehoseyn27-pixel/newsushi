"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminTranslateFromPersian,
  adminUploadAudio,
  adminUploadImage,
  adminUploadVideo,
  AdminApiError,
  resolveAdminImageUrl,
  type ProductPayload,
} from "@/lib/admin-api";
import { ANIMATION_PRESETS } from "@/lib/animation-presets";
import { slugifyPersian } from "@/lib/transliteration";
import type { Category, Product } from "@/lib/types";

const inputStyle = {
  borderColor: "var(--line)",
  background: "var(--bg)",
  color: "var(--ink)",
} as const;

function toCsv(list: string[]): string {
  return list.join("، ");
}
function fromCsv(value: string): string[] {
  return value
    .split(/[،,、]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: Product;
}) {
  const router = useRouter();
  const isEdit = !!initial;
  const backendSupportsAudio =
    !initial || Object.prototype.hasOwnProperty.call(initial, "audio_url");

  const [form, setForm] = useState<ProductPayload>(
    initial
      ? {
          slug: initial.slug,
          category_id: initial.category_id,
          name_fa: initial.name_fa,
          name_en: initial.name_en,
          name_ja: initial.name_ja,
          description_fa: initial.description_fa,
          description_en: initial.description_en,
          description_ja: initial.description_ja,
          ingredients_fa: initial.ingredients_fa,
          ingredients_en: initial.ingredients_en,
          ingredients_ja: initial.ingredients_ja,
          price_toman: initial.price_toman,
          is_spicy: initial.is_spicy,
          is_available: initial.is_available ?? true,
          animation: initial.animation,
          images: initial.images,
          audio_url: initial.audio_url ?? "",
          video_url: initial.video_url ?? "",
          sort_order: initial.sort_order,
        }
      : {
          slug: "",
          category_id: categories[0]?.id ?? 0,
          name_fa: "",
          name_en: "",
          name_ja: "",
          description_fa: "",
          description_en: "",
          description_ja: "",
          ingredients_fa: [],
          ingredients_en: [],
          ingredients_ja: [],
          price_toman: 0,
          is_spicy: false,
          is_available: true,
          animation: "float",
          images: [],
          audio_url: "",
          video_url: "",
          sort_order: 0,
        }
  );

  const [uploading, setUploading] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioFileName, setAudioFileName] = useState("");
  const [audioStatus, setAudioStatus] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoFileName, setVideoFileName] = useState("");
  const [videoStatus, setVideoStatus] = useState("");
  const [recordingAudio, setRecordingAudio] = useState(false);
  const [recordElapsed, setRecordElapsed] = useState(0);
  const [translatingName, setTranslatingName] = useState(false);
  const [translatingDescription, setTranslatingDescription] = useState(false);
  const [translatingIngredients, setTranslatingIngredients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestAudioUrlRef = useRef(initial?.audio_url ?? "");
  const latestVideoUrlRef = useRef(initial?.video_url ?? "");

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const update = <K extends keyof ProductPayload>(key: K, value: ProductPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateAudioUrl = (url: string) => {
    latestAudioUrlRef.current = url;
    update("audio_url", url);
  };

  const updateVideoUrl = (url: string) => {
    latestVideoUrlRef.current = url;
    update("video_url", url);
  };

  const fillNameTranslations = async () => {
    if (!form.name_fa.trim()) return;
    setTranslatingName(true);
    setError("");
    try {
      const [en, ja] = await Promise.all([
        adminTranslateFromPersian(form.name_fa, "en"),
        adminTranslateFromPersian(form.name_fa, "ja"),
      ]);
      setForm((f) => ({
        ...f,
        slug: f.slug || slugifyPersian(f.name_fa),
        name_en: en || f.name_en,
        name_ja: ja || f.name_ja,
      }));
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "ترجمه گوگل انجام نشد");
    } finally {
      setTranslatingName(false);
    }
  };

  const fillDescriptionTranslations = async () => {
    if (!form.description_fa.trim()) return;
    setTranslatingDescription(true);
    setError("");
    try {
      const [en, ja] = await Promise.all([
        adminTranslateFromPersian(form.description_fa, "en"),
        adminTranslateFromPersian(form.description_fa, "ja"),
      ]);
      setForm((f) => ({
        ...f,
        description_en: en || f.description_en,
        description_ja: ja || f.description_ja,
      }));
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "ترجمه گوگل انجام نشد");
    } finally {
      setTranslatingDescription(false);
    }
  };

  const fillIngredientTranslations = async () => {
    if (form.ingredients_fa.length === 0) return;
    setTranslatingIngredients(true);
    setError("");
    try {
      const source = toCsv(form.ingredients_fa);
      const [en, ja] = await Promise.all([
        adminTranslateFromPersian(source, "en"),
        adminTranslateFromPersian(source, "ja"),
      ]);
      setForm((f) => ({
        ...f,
        ingredients_en: fromCsv(en),
        ingredients_ja: fromCsv(ja),
      }));
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "ترجمه گوگل انجام نشد");
    } finally {
      setTranslatingIngredients(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await adminUploadImage(file);
      update("images", [...form.images, url]);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "خطا در آپلود");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (url: string) =>
    update("images", form.images.filter((i) => i !== url));

  const uploadAudioFile = async (file: File) => {
    setAudioFileName(file.name);
    setUploadingAudio(true);
    setError("");
    try {
      const url = await adminUploadAudio(file);
      updateAudioUrl(url);
      if (isEdit && initial) {
        const saved = await adminUpdateProduct(initial.id, { audio_url: url });
        if (saved.audio_url !== url) {
          throw new AdminApiError(
            "بک‌اند هنوز فیلد ویس را ذخیره نمی‌کند؛ بک‌اند را stop/start کن تا audio_url فعال شود",
            500
          );
        }
        setAudioStatus("ویس آپلود و روی همین محصول ذخیره شد");
      } else {
        setAudioStatus("ویس آپلود شد؛ برای محصول جدید دکمه افزودن محصول را بزن");
      }
    } catch (err) {
      setError(
        err instanceof AdminApiError
          ? `${err.message} - اگر همین الان بک‌اند را ری‌استارت نکردی، یک بار ری‌استارتش کن.`
          : "خطا در آپلود صوت"
      );
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAudioFile(file);
    } finally {
      e.target.value = "";
    }
  };

  const uploadVideoFile = async (file: File) => {
    setVideoFileName(file.name);
    setUploadingVideo(true);
    setError("");
    try {
      const url = await adminUploadVideo(file);
      updateVideoUrl(url);
      if (isEdit && initial) {
        const saved = await adminUpdateProduct(initial.id, { video_url: url });
        if (saved.video_url !== url) {
          throw new AdminApiError(
            "بک‌اند هنوز فیلد ویدیو را ذخیره نمی‌کند؛ بک‌اند را stop/start کن تا video_url فعال شود",
            500
          );
        }
        setVideoStatus("ویدیو آپلود و روی همین محصول ذخیره شد");
      } else {
        setVideoStatus("ویدیو آپلود شد؛ برای محصول جدید دکمه افزودن محصول را بزن");
      }
    } catch (err) {
      setError(
        err instanceof AdminApiError
          ? `${err.message} - اگر همین الان بک‌اند را ری‌استارت نکردی، یک بار ری‌استارتش کن.`
          : "خطا در آپلود ویدیو"
      );
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadVideoFile(file);
    } finally {
      e.target.value = "";
    }
  };

  const removeVideo = async () => {
    try {
      updateVideoUrl("");
      setVideoFileName("");
      setVideoStatus("ویدیو حذف شد؛ با ذخیره تغییرات نهایی می‌شود");
      if (isEdit && initial) {
        const saved = await adminUpdateProduct(initial.id, { video_url: "" });
        if (saved.video_url) {
          throw new AdminApiError(
            "بک‌اند هنوز حذف ویدیو را ذخیره نمی‌کند؛ بک‌اند را stop/start کن",
            500
          );
        }
        setVideoStatus("ویدیو از روی محصول حذف شد");
      }
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "حذف ویدیو ذخیره نشد");
    }
  };

  const startAudioRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("مرورگر شما ضبط صدا را پشتیبانی نمی‌کند");
      return;
    }

    setError("");
    setRecordElapsed(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
        setRecordingAudio(false);
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        if (blob.size === 0) {
          setError("صدایی ضبط نشد");
          return;
        }

        const file = new File([blob], `product-voice-${Date.now()}.webm`, {
          type: blob.type,
        });
        void uploadAudioFile(file);
      };

      recorder.start();
      setRecordingAudio(true);
      recordTimerRef.current = setInterval(() => {
        setRecordElapsed((value) => value + 1);
      }, 1000);
    } catch {
      setError("اجازه میکروفون داده نشد یا ضبط صدا شروع نشد");
    }
  };

  const stopAudioRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingAudio || recordingAudio || uploadingVideo) {
      setError("اول صبر کن آپلود یا ضبط ویس/ویدیو تمام شود، بعد ذخیره کن");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      audio_url: latestAudioUrlRef.current,
      video_url: latestVideoUrlRef.current,
    };
    try {
      if (isEdit && initial) {
        const saved = await adminUpdateProduct(initial.id, payload);
        if (payload.audio_url && saved.audio_url !== payload.audio_url) {
          throw new AdminApiError(
            "ویس در دیتابیس ذخیره نشد؛ بک‌اند را stop/start کن تا audio_url فعال شود",
            500
          );
        }
        if (payload.video_url && saved.video_url !== payload.video_url) {
          throw new AdminApiError(
            "ویدیو در دیتابیس ذخیره نشد؛ بک‌اند را stop/start کن تا video_url فعال شود",
            500
          );
        }
      } else {
        const saved = await adminCreateProduct(payload);
        if (payload.audio_url && saved.audio_url !== payload.audio_url) {
          throw new AdminApiError(
            "ویس در محصول جدید ذخیره نشد؛ بک‌اند را stop/start کن تا audio_url فعال شود",
            500
          );
        }
        if (payload.video_url && saved.video_url !== payload.video_url) {
          throw new AdminApiError(
            "ویدیو در محصول جدید ذخیره نشد؛ بک‌اند را stop/start کن تا video_url فعال شود",
            500
          );
        }
      }
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-6">
      {error && (
        <p className="rounded-lg border p-3 text-sm" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
          {error}
        </p>
      )}

      {!backendSupportsAudio && (
        <p className="rounded-lg border p-3 text-sm" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
          سرور بک‌اند فعلی هنوز audio_url را برنمی‌گرداند؛ برای ذخیره ویس، بک‌اند را کامل stop/start کن.
        </p>
      )}

      <Field label="اسلاگ (شناسه در آدرس)">
        <input
          value={form.slug}
          onChange={(e) => update("slug", e.target.value)}
          required
          placeholder="salmon-nigiri"
          className="w-full rounded-lg border px-4 py-2.5 outline-none"
          style={inputStyle}
        />
      </Field>

      <Field label="دسته‌بندی">
        <select
          value={form.category_id}
          onChange={(e) => update("category_id", Number(e.target.value))}
          className="w-full rounded-lg border px-4 py-2.5 outline-none"
          style={inputStyle}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name_fa}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="نام (فارسی)">
          <input value={form.name_fa} onChange={(e) => update("name_fa", e.target.value)} required className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
        <Field label="نام (English)">
          <input value={form.name_en} onChange={(e) => update("name_en", e.target.value)} required className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
        <Field label="نام (日本語)">
          <input value={form.name_ja} onChange={(e) => update("name_ja", e.target.value)} required className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
      </div>
      <TranslateButton onClick={fillNameTranslations} disabled={!form.name_fa.trim() || translatingName}>
        {translatingName ? "در حال ترجمه..." : "ترجمه نام با Google Translate"}
      </TranslateButton>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="توضیحات (فارسی)">
          <textarea value={form.description_fa} onChange={(e) => update("description_fa", e.target.value)} rows={3} className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
        <Field label="توضیحات (English)">
          <textarea value={form.description_en} onChange={(e) => update("description_en", e.target.value)} rows={3} className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
        <Field label="توضیحات (日本語)">
          <textarea value={form.description_ja} onChange={(e) => update("description_ja", e.target.value)} rows={3} className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
      </div>
      <TranslateButton onClick={fillDescriptionTranslations} disabled={!form.description_fa.trim() || translatingDescription}>
        {translatingDescription ? "در حال ترجمه..." : "ترجمه توضیحات با Google Translate"}
      </TranslateButton>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="ترکیبات (فارسی) — با ، جدا کنید">
          <input value={toCsv(form.ingredients_fa)} onChange={(e) => update("ingredients_fa", fromCsv(e.target.value))} className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
        <Field label="Ingredients (English) — comma separated">
          <input value={toCsv(form.ingredients_en)} onChange={(e) => update("ingredients_en", fromCsv(e.target.value))} className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
        <Field label="材料（日本語）— カンマ区切り">
          <input value={toCsv(form.ingredients_ja)} onChange={(e) => update("ingredients_ja", fromCsv(e.target.value))} className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
      </div>
      <TranslateButton onClick={fillIngredientTranslations} disabled={form.ingredients_fa.length === 0 || translatingIngredients}>
        {translatingIngredients ? "در حال ترجمه..." : "ترجمه ترکیبات با Google Translate"}
      </TranslateButton>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="قیمت (تومان)">
          <input
            type="number"
            min={0}
            value={form.price_toman}
            onChange={(e) => update("price_toman", Number(e.target.value))}
            required
            className="w-full rounded-lg border px-4 py-2.5 outline-none"
            style={inputStyle}
          />
        </Field>

        <Field label="انیمیشن نمایش محصول">
          <select
            value={form.animation}
            onChange={(e) => update("animation", e.target.value as ProductPayload["animation"])}
            className="w-full rounded-lg border px-4 py-2.5 outline-none"
            style={inputStyle}
          >
            {ANIMATION_PRESETS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label} — {a.hint}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--ink)" }}>
          <input type="checkbox" checked={form.is_spicy} onChange={(e) => update("is_spicy", e.target.checked)} />
          تند 🌶️
        </label>
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--ink)" }}>
          <input
            type="checkbox"
            checked={form.is_available}
            onChange={(e) => update("is_available", e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          موجود است
          {form.is_available && (
            <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              پیش‌فرض روشن
            </span>
          )}
        </label>
      </div>

      <Field label="تصاویر محصول">
        <div className="flex flex-wrap gap-3">
          {form.images.map((img) => (
            <div key={img} className="relative h-24 w-24 overflow-hidden rounded-lg border" style={{ borderColor: "var(--line)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveAdminImageUrl(img)} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(img)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity hover:opacity-100"
              >
                حذف
              </button>
            </div>
          ))}
          <label
            className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border text-sm"
            style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
          >
            {uploading ? "..." : "+ افزودن"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </Field>

      <Field label="ویس توضیحات محصول">
        <div className="rounded-2xl border p-4" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
          {recordingAudio ? (
            <div className="rounded-xl border p-4" style={{ borderColor: "var(--accent)", background: "var(--accent-soft)" }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                    در حال ضبط ویس...
                  </p>
                  <p className="mt-1 font-mono text-xs" style={{ color: "var(--ink-soft)" }}>
                    {Math.floor(recordElapsed / 60)}:{String(recordElapsed % 60).padStart(2, "0")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={stopAudioRecording}
                  className="rounded-full px-5 py-2 text-sm font-medium"
                  style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
                >
                  توقف و آپلود
                </button>
              </div>
              <div className="mt-4 flex h-12 items-end gap-1.5">
                {Array.from({ length: 24 }).map((_, index) => (
                  <span
                    key={index}
                    className="w-1.5 animate-pulse rounded-full"
                    style={{
                      height: `${14 + (index % 7) * 4}px`,
                      background: "var(--accent)",
                      animationDelay: `${index * 45}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : uploadingAudio ? (
            <div className="overflow-hidden rounded-xl border p-4" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center justify-between gap-3 text-sm" style={{ color: "var(--ink)" }}>
                <span>در حال آپلود ویس...</span>
                <span className="max-w-[60%] truncate text-xs" style={{ color: "var(--ink-soft)" }}>
                  {audioFileName || "فایل صوتی"}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
                <div
                  className="h-full w-1/2 animate-pulse rounded-full"
                  style={{ background: "var(--accent)" }}
                />
              </div>
            </div>
          ) : form.audio_url ? (
            <div className="flex flex-col gap-3">
              <audio controls src={resolveAdminImageUrl(form.audio_url)} className="w-full" />
              <div className="flex flex-wrap items-center gap-3">
                <span className="break-all text-xs" style={{ color: "var(--ink-soft)" }}>
                  {audioFileName || form.audio_url}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      updateAudioUrl("");
                      setAudioFileName("");
                      setAudioStatus("ویس حذف شد؛ با ذخیره تغییرات نهایی می‌شود");
                      if (isEdit && initial) {
                        const saved = await adminUpdateProduct(initial.id, { audio_url: "" });
                        if (saved.audio_url) {
                          throw new AdminApiError(
                            "بک‌اند هنوز حذف ویس را ذخیره نمی‌کند؛ بک‌اند را stop/start کن",
                            500
                          );
                        }
                        setAudioStatus("ویس از روی محصول حذف شد");
                      }
                    } catch (err) {
                      setError(err instanceof AdminApiError ? err.message : "حذف ویس ذخیره نشد");
                    }
                  }}
                  className="rounded-full border px-4 py-2 text-xs"
                  style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                >
                  حذف ویس
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm transition-transform hover:-translate-y-0.5"
                style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
              >
                <span>آپلود ویس آماده</span>
                <span className="text-xs opacity-70">mp3, wav, m4a, ogg, webm</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                  disabled={uploadingAudio}
                />
              </label>
              <button
                type="button"
                onClick={startAudioRecording}
                className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border text-sm transition-transform hover:-translate-y-0.5"
                style={{ borderColor: "var(--accent)", color: "var(--accent)", background: "var(--accent-soft)" }}
              >
                <span>ضبط ویس با میکروفون</span>
                <span className="text-xs opacity-75">شروع ضبط</span>
              </button>
            </div>
          )}
          {audioStatus && (
            <p className="mt-3 rounded-full px-3 py-2 text-xs" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              {audioStatus}
            </p>
          )}
        </div>
      </Field>

      <Field label="ویدیو محصول (اختیاری)">
        <div className="rounded-2xl border p-4" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
          {uploadingVideo ? (
            <div className="overflow-hidden rounded-xl border p-4" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center justify-between gap-3 text-sm" style={{ color: "var(--ink)" }}>
                <span>در حال آپلود ویدیو...</span>
                <span className="max-w-[60%] truncate text-xs" style={{ color: "var(--ink-soft)" }}>
                  {videoFileName || "فایل ویدیویی"}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
                <div
                  className="h-full w-1/2 animate-pulse rounded-full"
                  style={{ background: "var(--accent)" }}
                />
              </div>
            </div>
          ) : form.video_url ? (
            <div className="flex flex-col gap-3">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                controls
                src={resolveAdminImageUrl(form.video_url)}
                className="w-full rounded-lg"
                style={{ maxHeight: 260 }}
              />
              <div className="flex flex-wrap items-center gap-3">
                <span className="break-all text-xs" style={{ color: "var(--ink-soft)" }}>
                  {videoFileName || form.video_url}
                </span>
                <button
                  type="button"
                  onClick={removeVideo}
                  className="rounded-full border px-4 py-2 text-xs"
                  style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                >
                  حذف ویدیو
                </button>
              </div>
            </div>
          ) : (
            <label
              className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm transition-transform hover:-translate-y-0.5"
              style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
            >
              <span>آپلود ویدیوی محصول</span>
              <span className="text-xs opacity-70">mp4, webm, mov, ogg — حداکثر ۱۵۰ مگابایت</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                disabled={uploadingVideo}
              />
            </label>
          )}
          {videoStatus && (
            <p className="mt-3 rounded-full px-3 py-2 text-xs" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              {videoStatus}
            </p>
          )}
          <p className="mt-3 text-xs" style={{ color: "var(--ink-soft)" }}>
            اگر ویدیو اضافه شود، در صفحه محصول بالای ویس نمایش داده می‌شود.
          </p>
        </div>
      </Field>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploadingAudio || recordingAudio || uploadingVideo}
          className="rounded-full px-8 py-3 text-sm font-medium disabled:opacity-60"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
        >
          {saving ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "افزودن محصول"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-full border px-8 py-3 text-sm"
          style={{ borderColor: "var(--line)", color: "var(--ink)" }}
        >
          انصراف
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm" style={{ color: "var(--ink-soft)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TranslateButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="-mt-3 w-fit rounded-full border px-4 py-2 text-xs font-medium transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-45"
      style={{ borderColor: "var(--accent)", color: "var(--accent)", background: "var(--accent-soft)" }}
    >
      {children}
    </button>
  );
}
