import { useEffect, useRef, useState, type RefObject } from "react";

import { registrarDiagnostico, removerDiagnostico } from "@/lib/diagnostico";
import { prefersReducedMotion, useReducedMotion } from "@/lib/motion";

/**
 * Fonte ÚNICA de estado de uma cena guiada por scroll.
 *
 * Por que este módulo existe — as três cenas sticky da home tinham o mesmo
 * defeito de arquitetura, e ele produzia exatamente o desencontro que se via
 * na gravação:
 *
 * 1. **`scrub` numérico separa dois relógios.** Com `scrub: 0.4`, o
 *    ScrollTrigger continua entregando o progresso CRU em `onUpdate` — que ia
 *    para o `setState` do React — enquanto a animação do GSAP é suavizada em
 *    direção a esse valor. Texto e indicador trocavam no instante do scroll;
 *    o que era animado pelo GSAP chegava até 0,4 s depois.
 * 2. **Dois ScrollTriggers governando a mesma cena.** Na agenda radial o
 *    estado semântico vinha de um gatilho (`top 65%` → `bottom 75%`,
 *    `scrub: 0.5`) e o ponteiro de outro (`top 70%` → `bottom 70%`,
 *    `scrub: 0.6`). Começo, fim e suavização diferentes: os dois nunca
 *    estiveram em fase, em nenhum ponto do percurso.
 * 3. **Durações de transição diferentes no mesmo conjunto.** Chip a 300 ms e
 *    texto a 500 ms significam 200 ms em que o indicador já é do estado novo
 *    e a mensagem principal ainda é a do anterior.
 *
 * A correção é ter um relógio só. Este hook mantém **um** ScrollTrigger, sem
 * `scrub`, e no mesmo `onUpdate`:
 *
 * - escreve o progresso contínuo numa variável CSS (`--progresso`), que é
 *   quem move o que é contínuo — ponteiro, arco, trilho;
 * - deriva o índice discreto do estado e só então chama o `setState`.
 *
 * Contínuo e discreto saem do MESMO número, lido no MESMO instante. Não há
 * como um adiantar o outro.
 */

/** Folga para não piscar quando o scroll para em cima de um limiar. */
const HISTERESE = 0.012;

export type Cena = {
  /** Índice do estado ativo — governa texto, indicador, visual e legenda. */
  ativo: number;
  /** Progresso contínuo da cena, 0 a 1. */
  progresso: number;
  /** Progresso dentro do estado atual, 0 a 1. Para sub-animações. */
  progressoNoEstado: number;
  /** 1 descendo, -1 subindo, 0 parado. */
  direcao: number;
};

export function useCenaSincronizada({
  escopo,
  curso,
  quantidade,
  nome,
  start = "top 70%",
  end = "bottom bottom",
  estadoEstatico,
  pesos,
  linha,
}: {
  /** Elemento que delimita a cena; recebe a variável CSS de progresso. */
  escopo: RefObject<HTMLElement | null>;
  /** Seletor do elemento cuja rolagem é o curso da cena. */
  curso: string;
  quantidade: number;
  /** Nome exibido no painel `?debugScroll=1`. */
  nome: string;
  start?: string;
  end?: string;
  /** Estado mostrado quando o visitante pediu menos movimento. */
  estadoEstatico?: number;
  /**
   * Quanto de rolagem cada estado recebe, um peso por estado.
   *
   * Fatias iguais tratam "horários livres" e "remarcado" como se custassem o
   * mesmo para ler, e não custam: os estados finais têm mais informação e
   * chegavam a durar menos de um segundo. Omitido, todos pesam igual.
   */
  pesos?: readonly number[];
  /**
   * Timeline contínua da cena, montada dentro do escopo do gsap.
   *
   * Ela é entregue ao MESMO `ScrollTrigger` como `animation`, e não a um
   * gatilho próprio: é o que impede a cena de voltar a ter dois relógios de
   * progresso — o do visual e o do estado — andando fora de fase.
   */
  linha?: (gsap: (typeof import("gsap"))["gsap"]) => gsap.core.Timeline;
}): Cena {
  // Pelo hook, não por leitura direta: ler `matchMedia` durante o render faz
  // o servidor e o cliente discordarem no primeiro passe (React #418).
  const estatico = useReducedMotion();
  const finalEstatico = estadoEstatico ?? quantidade - 1;

  const [cena, setCena] = useState<Cena>({
    ativo: 0,
    progresso: 0,
    progressoNoEstado: 0,
    direcao: 0,
  });

  // O índice vive também numa ref: o `onUpdate` roda a cada frame e precisa
  // comparar com o valor corrente sem depender do ciclo de render do React.
  const indiceRef = useRef(0);

  useEffect(() => {
    const raiz = escopo.current;
    if (!raiz) return;

    if (prefersReducedMotion()) {
      indiceRef.current = finalEstatico;
      setCena({ ativo: finalEstatico, progresso: 1, progressoNoEstado: 1, direcao: 0 });
      raiz.style.setProperty("--progresso", "1");
      return;
    }

    let ativo = true;
    let gatilho: { kill: () => void } | undefined;
    let limpezaContexto: (() => void) | undefined;

    // Limiares acumulados a partir dos pesos. `limites[i]` é onde a fatia do
    // estado i começa; `limites[quantidade]` é sempre 1.
    const escala =
      pesos?.length === quantidade ? pesos : Array.from({ length: quantidade }, () => 1);
    const soma = escala.reduce((a, b) => a + b, 0);
    const limites: number[] = [0];
    for (let i = 0; i < quantidade; i++) limites.push(limites[i]! + escala[i]! / soma);
    limites[quantidade] = 1;

    const indiceDe = (p: number) => {
      for (let i = quantidade - 1; i >= 0; i--) if (p >= limites[i]!) return i;
      return 0;
    };

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (!ativo) return;
      gsap.registerPlugin(ScrollTrigger);

      const alvo = raiz.querySelector<HTMLElement>(curso) ?? raiz;

      // A timeline nasce dentro do contexto para o `revert()` recolhê-la.
      let animacao: gsap.core.Timeline | undefined;
      const contexto = gsap.context(() => {
        if (linha) animacao = linha(gsap);
      }, raiz);
      limpezaContexto = () => contexto.revert();

      gatilho = ScrollTrigger.create({
        trigger: alvo,
        start,
        end,
        // `scrub: true` — sem número. O número introduz suavização, e é
        // exatamente isso que fazia o visual chegar depois do estado.
        ...(animacao ? { animation: animacao, scrub: true } : {}),
        // Sem `scrub`: não há timeline a suavizar aqui. O progresso que este
        // callback recebe é o mesmo que vai para a variável CSS e para o
        // estado do React — é essa igualdade que garante a sincronia.
        onUpdate: (self) => {
          const p = self.progress;

          // O contínuo, sem passar pelo React: escrever uma custom property
          // não dispara render, então o ponteiro anda a 60 fps de graça.
          raiz.style.setProperty("--progresso", p.toFixed(5));

          // O discreto, do mesmo `p`. A histerese evita que parar exatamente
          // sobre um limiar faça o estado oscilar.
          const atual = indiceRef.current;
          const piso = limites[atual]!;
          const teto = limites[atual + 1]!;
          let proximo = atual;
          if (p > teto + HISTERESE) proximo = indiceDe(p);
          else if (p < piso - HISTERESE) proximo = indiceDe(p);

          const largura = limites[proximo + 1]! - limites[proximo]!;
          const dentro =
            largura > 0 ? Math.min(1, Math.max(0, (p - limites[proximo]!) / largura)) : 0;
          const direcao = self.direction;

          if (proximo !== atual) {
            indiceRef.current = proximo;
            setCena({ ativo: proximo, progresso: p, progressoNoEstado: dentro, direcao });
          } else {
            // Mesmo sem troca de estado o painel de diagnóstico precisa do
            // número corrente; ele lê da variável CSS, não do React.
            registrarDiagnostico(nome, {
              nome,
              progresso: p,
              ativo: proximo,
              progressoNoEstado: dentro,
              direcao,
            });
          }
        },
      });

      ScrollTrigger.refresh();
    })();

    return () => {
      ativo = false;
      gatilho?.kill();
      limpezaContexto?.();
      removerDiagnostico(nome);
    };

    // `pesos` entra pela serialização: um array literal muda de identidade a
    // cada render e reinstalaria o gatilho em todo commit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curso, quantidade, nome, start, end, finalEstatico, pesos?.join(","), linha]);

  // Publica o estado discreto sempre que ele muda, para o painel.
  useEffect(() => {
    registrarDiagnostico(nome, {
      nome,
      progresso: cena.progresso,
      ativo: cena.ativo,
      progressoNoEstado: cena.progressoNoEstado,
      direcao: cena.direcao,
    });
  }, [nome, cena]);

  if (estatico) {
    return { ativo: finalEstatico, progresso: 1, progressoNoEstado: 1, direcao: 0 };
  }
  return cena;
}
