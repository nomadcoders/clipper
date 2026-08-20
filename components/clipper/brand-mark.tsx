type BrandMarkProps = {
  className?: string;
  compact?: boolean;
};

export function BrandMark({ className = "", compact = false }: BrandMarkProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-warm-accent text-warm-surface shadow-[3px_3px_0_var(--warm-ink)]"
      >
        <svg viewBox="0 0 36 36" className="size-6" fill="none">
          <path d="M10.6 14.5c-1.6-3.9.1-7.6 2.9-8.7 2.4-.9 4.3.9 4.5 3.7.7-2.8 3.1-4.3 5.2-3.3 2.7 1.3 3.5 5.1 1.8 8.8 2.4-.5 4.6.3 5.2 2.4.8 2.9-1.9 5.6-5.8 6.7-4.7 1.3-10.9.1-14.9-3.3-3.2-2.8-3.3-5.7-1.1-6.3.7-.2 1.4-.1 2.2 0Z" fill="#fff8e9" />
          <path d="M15.5 19.5c1.2.8 2.4 1.1 3.7 1" stroke="#25231e" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="21.3" cy="16.2" r="1" fill="#25231e" />
          <path d="M24.4 20.2c.8-.4 1.5-.9 2.1-1.6" stroke="#25231e" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
      <span className={compact ? "sr-only" : "font-serif text-[1.65rem] font-bold leading-none tracking-[-0.07em] text-warm-ink"}>
        clipper
      </span>
    </span>
  );
}
