import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Moldura de um capítulo da home.
 *
 * Centraliza três decisões que antes estavam repetidas em cada seção:
 *
 * - **Largura útil.** O container cresce até 90rem em telas grandes. Com
 *   `max-w-6xl` fixo sobrava margem morta demais em 1440 e 1920, e a página
 *   lia como uma coluna estreita perdida no meio da tela.
 * - **Tom de fundo.** Cada capítulo tem o seu, numa escala discreta que marca
 *   a virada sem transformar a página em blocos coloridos.
 * - **Ritmo vertical.** O espaço entre capítulos existe para criar
 *   expectativa; onde ele não cumpre isso, é vazio e foi cortado.
 */
export type TomCapitulo = "quente" | "claro" | "marca" | "brasa";

const TONS: Record<TomCapitulo, string> = {
  // Branco quente — o fundo padrão da marca.
  quente: "bg-background",
  // Cinza muito claro, para o capítulo vizinho não encostar no mesmo tom.
  claro: "bg-surface",
  // Vermelho extremamente suave: encerramento e respiros da marca.
  marca: "bg-marca-muted",
  // O momento de alto impacto: fundo no vermelho escuro da marca, texto
  // branco. Um só na página — é o pico, e um pico repetido deixa de ser pico.
  brasa: "bg-marca-dark text-white",
};

export function Capitulo({
  id,
  tom = "quente",
  compacto = false,
  className,
  children,
  ...resto
}: {
  id?: string;
  tom?: TomCapitulo;
  /** Capítulo de respiro curto, para pares que se completam. */
  compacto?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "id" | "className" | "children">) {
  return (
    <section
      id={id}
      className={cn(
        "relative isolate",
        TONS[tom],
        compacto ? "py-16 sm:py-20" : "py-20 sm:py-28",
        className,
      )}
      {...resto}
    >
      <div className="mx-auto w-full max-w-[76rem] px-5 sm:px-8 2xl:max-w-[90rem]">{children}</div>
    </section>
  );
}

/** Rótulo curto que abre cada capítulo. */
export function RotuloCapitulo({
  children,
  invertido = false,
}: {
  children: ReactNode;
  invertido?: boolean;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em]",
        invertido ? "text-white/70" : "text-muted-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("inline-block h-px w-8", invertido ? "bg-white/40" : "bg-primary")}
      />
      {children}
    </p>
  );
}
