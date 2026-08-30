import { useEffect, useRef } from "react";

import { DEFAULT_BEAT } from "@/scene/beats";

/**
 * Liga a cena three.js à página.
 *
 * A cena é carregada por import dinâmico: three são centenas de kB e o site
 * precisa estar pronto e legível antes disso — quem não tem WebGL, ou pediu
 * menos movimento, nunca baixa o bundle.
 *
 * Este componente vive no root, acima do <Outlet>, para a cena não ser
 * remontada a cada navegação (ADR 0002).
 */
export function SceneLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let scene:
      | {
          setBeat: (b: string, p?: number, n?: string) => void;
          setFocus: (x: number, y: number) => void;
          resize: () => void;
          start: () => void;
          stop: () => void;
          dispose: () => void;
        }
      | null = null;
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    void (async () => {
      const { shouldRunScene, StreamsScene } = await import("@/scene/StreamsScene");

      // Verificado depois do import e de novo aqui: entre montar o componente e
      // o chunk chegar, o visitante pode ter ligado "reduzir movimento".
      if (cancelled || !shouldRunScene()) return;

      const instance = new StreamsScene(canvas);
      if (cancelled) {
        instance.dispose();
        return;
      }
      scene = instance;

      /**
       * Qual momento está na tela. IntersectionObserver em vez de ouvir scroll:
       * o navegador resolve isso fora da thread principal, e um listener de
       * scroll a 60 Hz é justamente o tipo de coisa que trava celular modesto.
       */
      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-beat]"));
      if (sections.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          // O momento vigente é o mais visível — não o primeiro que cruzou o
          // limiar, senão duas seções vizinhas ficam disputando a cena.
          let best: IntersectionObserverEntry | null = null;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
          }
          if (!best) return;

          const element = best.target as HTMLElement;
          const beat = element.dataset["beat"] ?? DEFAULT_BEAT;
          const index = sections.indexOf(element);
          const next = sections[index + 1]?.dataset["beat"];

          // Progresso dentro da seção: quanto ela já subiu na viewport.
          const rect = element.getBoundingClientRect();
          const travelled = -rect.top / Math.max(rect.height, 1);
          scene?.setBeat(beat, Math.min(Math.max(travelled, 0), 1), next);

          // As correntes convergem para a moldura do celular desta seção, se
          // houver uma. Sem isso o encontro acontece no meio da página, por
          // trás do texto, e lê como ruído em vez de efeito.
          const alvo =
            element.querySelector<HTMLElement>("[data-screen-slot]") ??
            element.querySelector<HTMLElement>("figure");
          if (alvo) {
            const caixa = alvo.getBoundingClientRect();
            // Ponto de encontro à beira da moldura, do lado de dentro da
            // página: convergir para o centro exato esconde os blocos atrás do
            // celular, e para o meio da tela os joga por cima do texto. A
            // borda é o vão que sobra entre os dois.
            const beira = caixa.left < window.innerWidth / 2
              ? caixa.right + caixa.width * 0.15
              : caixa.left - caixa.width * 0.15;
            const cx = beira / window.innerWidth;
            const cy = (caixa.top + caixa.height / 2) / window.innerHeight;
            scene?.setFocus(cx * 2 - 1, -(cy * 2 - 1));
          } else {
            scene?.setFocus(0, 0);
          }
        },
        { threshold: [0.1, 0.25, 0.5, 0.75, 1] },
      );

      sections.forEach((section) => observer.observe(section));
      cleanups.push(() => observer.disconnect());

      const onResize = () => instance.resize();
      window.addEventListener("resize", onResize, { passive: true });
      cleanups.push(() => window.removeEventListener("resize", onResize));

      // Aba oculta não desenha: continuar renderizando um canvas que ninguém vê
      // gasta bateria e nada mais.
      const onVisibility = () => {
        if (document.hidden) instance.stop();
        else instance.start();
      };
      document.addEventListener("visibilitychange", onVisibility);
      cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

      instance.start();
    })();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      scene?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      /**
       * `fixed` e atrás de tudo: a cena é pano de fundo do documento inteiro,
       * e `pointer-events-none` garante que ela nunca roube um clique de um
       * link ou de um botão.
       */
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
