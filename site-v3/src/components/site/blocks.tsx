import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function PainList({
  side,
  title,
  items,
}: {
  side: "atende" | "marca";
  title: string;
  items: string[];
}) {
  return (
    <Card as="article" className="h-full">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {side === "atende" ? "Quem atende" : "Quem marca"}
      </p>
      <h3 className="mt-3 text-xl">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-[0.95rem] leading-relaxed text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
            />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function ResolvedCard({
  step,
  title,
  text,
  tone = "success",
}: {
  step: string;
  title: string;
  text: string;
  tone?: "success" | "info" | "warning" | "primary";
}) {
  const toneClass = {
    success: "bg-success-soft text-success",
    info: "bg-info-soft text-info",
    warning: "bg-warning-soft text-warning",
    primary: "bg-primary-soft text-primary",
  }[tone];

  return (
    <Card as="li" className="h-full">
      <span
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
          toneClass,
        )}
      >
        {step}
      </span>
      <h3 className="mt-4 text-lg">{title}</h3>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">{text}</p>
    </Card>
  );
}

export function PathCard({
  to,
  eyebrow,
  title,
  text,
  cta,
}: {
  to: "/profissionais" | "/empresas" | "/publico";
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
}) {
  return (
    <Card
      as="li"
      className="group flex h-full flex-col transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-2xl">{title}</h3>
      <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-muted-foreground">{text}</p>
      <Link
        to={to}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        {cta}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </Card>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-border pl-4">
      <p className="font-display text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function SectionHeading({
  title,
  lead,
  invert = false,
}: {
  title: string;
  lead?: string;
  invert?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <h2 className={cn("text-3xl sm:text-4xl", invert && "text-primary-foreground")}>{title}</h2>
      {lead ? (
        <p
          className={cn(
            "mt-4 measure text-lg leading-relaxed",
            invert ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
