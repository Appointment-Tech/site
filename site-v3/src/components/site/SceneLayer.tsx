import { useEffect, useRef } from "react";

import { DEFAULT_BEAT } from "@/scene/beats";



/**
 * Liga a cena three.js à página.
 *
 * A cena tem um palco definido: a área ao redor da moldura do celular da seção
 * visível. Foi a terceira tentativa de posicioná-la, e as duas anteriores
 * falharam pelo mesmo motivo — um canvas de tela cheia atrás de um layout de
 * duas colunas não tem onde acontecer. No meio ele cobre o texto; empurrado
 * para as bordas, vira duas colunas soltas nos cantos, sem relação com nada.
 *
 * Ancorado na moldura, o movimento ganha sentido: os horários dos dois lados
 * convergem e desaparecem atrás do aparelho, como se entrassem no app. E onde
 * não há moldura a cena simplesmente não aparece — melhor nada do que ruído.
 *
 * A cena é carregada por import dinâmico: three são centenas de kB e o site
 * precisa estar pronto antes disso. Quem não tem WebGL, ou pediu menos
 * movimento, nunca baixa o bundle.
 */
export function SceneLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let scene:
      | {
          setBeat: (b: string, p?: number, n?: string) => void;
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

      // Verificado de novo aqui: entre montar o componente e o chunk chegar, o
      // visitante pode ter ligado "reduzir movimento".
      if (cancelled || !shouldRunScene()) return;

      const instance = new StreamsScene(canvas);
      if (cancelled) {
        instance.dispose();
        return;
      }
      scene = instance;

      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-beat]"));
      if (sections.length === 0) return;

      const palcos = Array.from(document.querySelectorAll<HTMLElement>("[data-scene-stage]"));

      /**
       * O palco em cena é o mais próximo do centro da viewport.
       *
       * Escolher pelo IntersectionObserver não bastava: depois de um scroll
       * programático ele pode não disparar (os limiares já foram cruzados), e
       * a cena ficava escondida com a faixa bem à vista.
       */
      const palcoVisivel = (): HTMLElement | null => {
        const meio = window.innerHeight / 2;
        let melhor: HTMLElement | null = null;
        let menorDistancia = Number.POSITIVE_INFINITY;
        for (const candidato of palcos) {
          const r = candidato.getBoundingClientRect();
          if (r.width < 40 || r.bottom < 0 || r.top > window.innerHeight) continue;
          const distancia = Math.abs(r.top + r.height / 2 - meio);
          if (distancia < menorDistancia) {
            menorDistancia = distancia;
            melhor = candidato;
          }
        }
        return melhor;
      };

      /**
       * Momento e palco saem da mesma leitura da geometria, a cada quadro de
       * scroll. Depender do IntersectionObserver para isso deixava a cena no
       * momento anterior depois de um scroll programático — os limiares já
       * tinham sido cruzados e o callback não vinha.
       */
      const atualizarMomento = () => {
        const meio = window.innerHeight / 2;
        let ativa: HTMLElement | null = null;
        let menor = Number.POSITIVE_INFINITY;
        for (const secao of sections) {
          const r = secao.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) continue;
          const distancia = Math.abs(r.top + r.height / 2 - meio);
          if (distancia < menor) {
            menor = distancia;
            ativa = secao;
          }
        }
        if (!ativa) return;

        const beat = ativa.dataset["beat"] ?? DEFAULT_BEAT;
        const index = sections.indexOf(ativa);
        const next = sections[index + 1]?.dataset["beat"];
        const r = ativa.getBoundingClientRect();
        const travelled = -r.top / Math.max(r.height, 1);
        instance.setBeat(beat, Math.min(Math.max(travelled, 0), 1), next);
      };

      const posicionar = () => {
        atualizarMomento();
        const palco = palcoVisivel();
        if (!palco) {
          canvas.style.opacity = "0";
          return;
        }
        const r = palco.getBoundingClientRect();
        // Fora da viewport não há o que mostrar, e reposicionar custa layout.
        if (r.bottom < 0 || r.top > window.innerHeight) {
          canvas.style.opacity = "0";
          return;
        }
        // O palco tem tamanho zero quando a coluna não existe (telas menores).
        if (r.width < 40) {
          canvas.style.opacity = "0";
          return;
        }
        const largura = r.width;
        const altura = r.height;
        canvas.style.opacity = "1";
        canvas.style.width = `${largura}px`;
        canvas.style.height = `${altura}px`;
        canvas.style.left = `${r.left + r.width / 2 - largura / 2}px`;
        canvas.style.top = `${r.top + r.height / 2 - altura / 2}px`;
        instance.resize();
      };

      // O observer serve só para acordar o reposicionamento quando uma seção
      // entra ou sai de vista; quem decide momento e palco é a leitura da
      // geometria, que não depende de limiar nenhum.
      const observer = new IntersectionObserver(() => posicionar(), {
        threshold: [0, 0.25, 0.5, 0.75, 1],
      });
      sections.forEach((section) => observer.observe(section));
      cleanups.push(() => observer.disconnect());

      // O palco acompanha o scroll. Um rAF por evento, e não trabalho por
      // evento: rolagem dispara dezenas de vezes por segundo.
      let agendado = 0;
      const aoRolar = () => {
        if (agendado) return;
        agendado = requestAnimationFrame(() => {
          agendado = 0;
          posicionar();
        });
      };
      posicionar();
      window.addEventListener("scroll", aoRolar, { passive: true });
      window.addEventListener("resize", aoRolar, { passive: true });
      cleanups.push(() => {
        window.removeEventListener("scroll", aoRolar);
        window.removeEventListener("resize", aoRolar);
        if (agendado) cancelAnimationFrame(agendado);
      });

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
       * Posicionado por JS sobre a moldura da seção visível. Fica atrás do
       * conteúdo (-z-10), então os blocos somem por trás do aparelho — que é
       * exatamente a leitura desejada: os horários entram no app.
       */
      className="pointer-events-none fixed -z-10 opacity-0 transition-opacity duration-500"
      style={{ left: 0, top: 0, width: 0, height: 0 }}
    />
  );
}
