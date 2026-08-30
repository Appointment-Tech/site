import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BeatProps = {
  /** Nome do momento narrativo — ponto de ancoragem da cena 3D. */
  beat: string;
  id?: string;
  children: ReactNode;
  className?: string;
  /** Fundo da seção. A cor primária nunca é fundo de conteúdo. */
  tone?: "base" | "surface" | "brand";
  /** Espaçamento vertical. */
  size?: "sm" | "md" | "lg";
};

/**
 * Os fundos são semitransparentes de propósito: a cena 3D vive num canvas fixo
 * atrás do documento, e uma seção com fundo opaco a esconde por completo — foi
 * o que aconteceu na primeira versão, em que a cena rodava e ninguém via.
 *
 * A opacidade é alta o bastante para o texto manter contraste AA: a cena
 * aparece como movimento por trás do conteúdo, não como concorrente dele.
 */
const toneClass: Record<NonNullable<BeatProps["tone"]>, string> = {
  base: "bg-background/75 text-foreground",
  surface: "bg-surface/80 text-foreground",
  // O hero é o único campo cheio: ali a cena fica por baixo do gradiente da
  // marca, quase imperceptível, e é assim que deve ser — o herói é o texto.
  brand: "brand-gradient text-white",
};

const sizeClass: Record<NonNullable<BeatProps["size"]>, string> = {
  sm: "py-14 sm:py-20",
  md: "py-20 sm:py-28",
  lg: "py-24 sm:py-36",
};

/**
 * Todo momento da narrativa é uma <section data-beat> com uma
 * <div data-scene-slot> vazia por baixo do conteúdo. O conteúdo é HTML real e
 * fica legível sem nenhum JavaScript — a cena é sempre uma camada por cima.
 */
export function Beat({
  beat,
  id,
  children,
  className,
  tone = "base",
  size = "md",
}: BeatProps) {
  return (
    <section
      data-beat={beat}
      id={id ?? beat}
      className={cn("relative overflow-hidden", toneClass[tone], sizeClass[size], className)}
    >
      <div data-scene-slot aria-hidden="true" className="scene-slot" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">{children}</div>
    </section>
  );
}

export function BeatLabel({
  children,
  invert = false,
}: {
  children: ReactNode;
  invert?: boolean;
}) {
  return (
    <p
      className={cn(
        "mb-5 flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em]",
        invert ? "text-white/70" : "text-muted-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("inline-block h-px w-8", invert ? "bg-white/40" : "bg-primary")}
      />
      {children}
    </p>
  );
}
