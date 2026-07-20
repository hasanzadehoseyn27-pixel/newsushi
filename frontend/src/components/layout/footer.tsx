import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer
      className="mt-24 border-t px-6 py-10 text-sm"
      style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:justify-between">
        <p className="font-display" style={{ color: "var(--ink)" }}>
          新寿司 — NewSushi
        </p>
        <p>{t("hours")}: 12:00 – 23:30</p>
        <p>© {new Date().getFullYear()} NewSushi — {t("rights")}</p>
      </div>
    </footer>
  );
}
