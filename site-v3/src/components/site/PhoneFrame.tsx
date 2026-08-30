import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Moldura de celular que exibe uma tela real do app.
 *
 * As imagens vêm de captura do app Flutter rodando em emulador com dados
 * fictícios (ver ADR 0003) e são 1080x2400 — proporção 9/20. A moldura respeita
 * essa proporção exata e usa `object-contain`: `object-cover` cortaria o topo
 * da tela, que é justamente o que prova o produto (o título, a data, o seletor
 * de semana).
 *
 * A moldura é deliberadamente leve — raio e sombra dos tokens, sem chassi preto
 * de celular — para a tela ler como parte da página, não como figura colada.
 * Sem `src`, o slot fica vazio e a moldura ainda se sustenta.
 */
export function PhoneFrame({
  screen,
  src,
  alt,
  caption,
  priority = false,
  className,
  children,
}: {
  /** Nome do slot, usado pela camada 3D para localizar a moldura. */
  screen: string;
  src?: string;
  alt?: string;
  caption?: string;
  /** Verdadeiro quando a moldura aparece acima da dobra: sai do lazy. */
  priority?: boolean;
  className?: string;
  /**
   * Conteúdo composto no lugar da captura. Usado quando a tela que a narrativa
   * precisa não existe entre as capturas — a demonstração é então montada com
   * as peças reais do app (ver `home/pecas.tsx`), sem inventar recurso.
   */
  children?: ReactNode;
}) {
  return (
    <figure className={cn("mx-auto w-full max-w-[19rem]", className)}>
      <div className="relative rounded-[2.4rem] border border-border bg-card p-2.5 shadow-[var(--shadow-lift)] ring-1 ring-marca/12">
        <div
          data-screen-slot={screen}
          className="relative aspect-[9/20] w-full overflow-hidden rounded-[1.9rem] bg-neutral-soft"
        >
          {children ??
            (src ? (
              <img
                src={src}
                alt={alt ?? ""}
                width={1080}
                height={2400}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-contain"
              />
            ) : (
              <>
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-full bg-background/70"
                />
                <span className="sr-only">Tela do aplicativo: {screen}</span>
              </>
            ))}
        </div>
        {/* Traço da marca no topo do aparelho, no lugar do alto-falante. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[0.9rem] z-10 h-1 w-12 -translate-x-1/2 rounded-full bg-marca/30"
        />
      </div>
      {caption ? (
        <figcaption className="mt-4 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
