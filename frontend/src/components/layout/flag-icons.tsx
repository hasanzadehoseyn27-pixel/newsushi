export function FlagIR({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 9 6" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="9" height="6" fill="#fff" />
      <rect width="9" height="2" fill="#239f40" />
      <rect y="4" width="9" height="2" fill="#da0000" />
    </svg>
  );
}

export function FlagGB({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 36" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="36" fill="#00247d" />
      <path d="M0 0 60 36M60 0 0 36" stroke="#fff" strokeWidth="7" />
      <path d="M0 0 60 36M60 0 0 36" stroke="#cf142b" strokeWidth="3" />
      <path d="M30 0V36M0 18H60" stroke="#fff" strokeWidth="11" />
      <path d="M30 0V36M0 18H60" stroke="#cf142b" strokeWidth="6" />
    </svg>
  );
}

export function FlagJP({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 9 6" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="9" height="6" fill="#fff" />
      <circle cx="4.5" cy="3" r="1.5" fill="#bc002d" />
    </svg>
  );
}

export function LocaleFlag({ locale, className }: { locale: string; className?: string }) {
  if (locale === "fa") return <FlagIR className={className} />;
  if (locale === "ja") return <FlagJP className={className} />;
  return <FlagGB className={className} />;
}
