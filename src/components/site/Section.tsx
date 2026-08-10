import type { ReactNode } from "react";

export function Section({
  children,
  className = "",
  id,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "default" | "sand" | "ink";
}) {
  const toneClass =
    tone === "ink" ? "surface-ink" : tone === "sand" ? "bg-secondary" : "";
  return (
    <section id={id} className={`py-20 sm:py-28 ${toneClass} ${className}`}>
      <div className="mx-auto max-w-6xl px-5">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, inverted }: { children: ReactNode; inverted?: boolean }) {
  return (
    <span
      className={`inline-block text-xs font-semibold uppercase tracking-[0.18em] ${
        inverted ? "text-ink-foreground/60" : "text-primary"
      }`}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  children,
  inverted,
  className = "",
}: {
  children: ReactNode;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <h2
      className={`mt-3 text-3xl font-bold text-balance-pretty sm:text-4xl ${
        inverted ? "text-ink-foreground" : "text-foreground"
      } ${className}`}
    >
      {children}
    </h2>
  );
}

export function Lead({
  children,
  inverted,
  className = "",
}: {
  children: ReactNode;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`mt-4 max-w-2xl text-base leading-relaxed sm:text-lg ${
        inverted ? "text-ink-foreground/75" : "text-muted-foreground"
      } ${className}`}
    >
      {children}
    </p>
  );
}
