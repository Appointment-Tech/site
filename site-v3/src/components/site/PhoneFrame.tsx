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
}: {
  /** Nome do slot, usado pela camada 3D para localizar a moldura. */
  screen: string;
  src?: string;
  alt?: string;
  caption?: string;
  /** Verdadeiro quando a moldura aparece acima da dobra: sai do lazy. */
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={cn("mx-auto w-full max-w-[19rem]", className)}>
      <div className="rounded-[2.4rem] border border-border bg-card p-2.5 shadow-[var(--shadow-lift)]">
        <div
          data-screen-slot={screen}
          className="relative aspect-[9/20] w-full overflow-hidden rounded-[1.9rem] bg-neutral-soft"
        >
          {src ? (
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
          )}
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-4 text-center text-sm text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
