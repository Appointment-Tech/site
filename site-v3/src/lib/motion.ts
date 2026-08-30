import { useEffect, useRef, type RefObject } from "react";

/**
 * Base de animação por scroll da home.
 *
 * Duas decisões que valem para tudo o que usa este módulo:
 *
 * - **GSAP e ScrollTrigger entram por import dinâmico.** A home precisa estar
 *   legível antes de qualquer biblioteca de animação chegar; quem pediu menos
 *   movimento nunca baixa o bundle.
 * - **`prefers-reduced-motion` não degrada o conteúdo, só o movimento.** Com
 *   ele ativo nada é animado e todos os elementos ficam no estado final —
 *   nenhuma informação depende de a animação rodar.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type GsapModule = typeof import("gsap");
type Contexto = {
  gsap: GsapModule["gsap"];
  /** Registra limpezas; chamadas na desmontagem. */
  onCleanup: (fn: () => void) => void;
};

/**
 * Monta uma timeline de scroll dentro de um escopo, com limpeza garantida.
 *
 * `gsap.context` recolhe tudo o que foi criado dentro dele — timelines,
 * tweens e ScrollTriggers — e o `revert()` desfaz na desmontagem. Sem isso, um
 * ScrollTrigger sobrevive à troca de rota e passa a medir um elemento que não
 * existe mais.
 */
export function useScrollScene(
  escopo: RefObject<HTMLElement | null>,
  montar: (ctx: Contexto) => void,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    const raiz = escopo.current;
    if (!raiz || prefersReducedMotion()) return;

    let ativo = true;
    let reverter: (() => void) | undefined;
    const limpezas: Array<() => void> = [];

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (!ativo) return;

      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        montar({ gsap, onCleanup: (fn) => limpezas.push(fn) });
      }, raiz);

      reverter = () => ctx.revert();
    })();

    return () => {
      ativo = false;
      limpezas.forEach((fn) => fn());
      reverter?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Ref tipado para um elemento, sem repetir a assinatura em cada componente. */
export function useElemento<T extends HTMLElement>() {
  return useRef<T>(null);
}
