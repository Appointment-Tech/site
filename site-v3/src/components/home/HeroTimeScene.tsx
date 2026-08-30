import { useCallback, useRef } from "react";
import { ArrowDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InviteDialog } from "@/components/site/InviteDialog";
import { ScrollClock } from "@/components/home/ScrollClock";
import { ChaosNotifications } from "@/components/home/ChaosNotifications";
import { useCenaSincronizada } from "@/lib/cena";
import { useReducedMotion } from "@/lib/motion";

/**
 * Capítulo 1 — o tempo está correndo, e a agenda se abre.
 *
 * **Por que o hero não ficava parado.** A seção tinha a altura de uma tela e o
 * gatilho ia de `top top` a `bottom top` — ou seja, a animação inteira rodava
 * exatamente durante o período em que a seção SAÍA da tela. Não havia pin nem
 * sticky: o palco subia junto com o documento. Na metade do progresso o
 * relógio já estava meio fora da viewport, e no fim tinha sumido — o visitante
 * nunca via o mostrador funcionando, que é o ponto do capítulo.
 *
 * Agora a estrutura é a mesma das outras cenas presas: um curso externo alto e
 * um palco `sticky` da altura da tela (descontando o header). O documento rola,
 * o palco não sai do lugar, e o progresso muda só o ESTADO da cena.
 */
const ESTADOS = [
  { id: "entrada", rotulo: "Entrada" },
  { id: "abertura", rotulo: "Abertura" },
  { id: "relogio", rotulo: "Tempo em movimento" },
  { id: "resolucao", rotulo: "Resolução" },
  { id: "saida", rotulo: "Saída" },
] as const;

/**
 * Rolagem por estado: 10 / 20 / 40 / 15 / 15 por cento do curso.
 *
 * O curso encolheu 25% (300vh → 225vh) e a abertura começa antes: nos primeiros
 * segundos quase nada mudava. O trecho com o mostrador inteiro é o maior de
 * todos — a abertura é o gesto, o relógio funcionando é o que se observa.
 */
const PESOS = [10, 20, 40, 15, 15] as const;
/** Rolagem por fase. No celular o curso encurta ~22%: mesma narrativa, menos
 *  scroll — cena presa comprida demais em tela pequena lê como página travada. */
const CURSO = [
  "h-[18vh] lg:h-[23vh]",
  "h-[35vh] lg:h-[45vh]",
  "h-[70vh] lg:h-[90vh]",
  "h-[27vh] lg:h-[34vh]",
  "h-[26vh] lg:h-[33vh]",
] as const;

export function HeroTimeScene() {
  const secao = useRef<HTMLElement>(null);
  const estatico = useReducedMotion();

  /**
   * A timeline contínua da cena.
   *
   * Vai para o MESMO ScrollTrigger que deriva o estado (ver `lib/cena.ts`), com
   * `scrub: true`. As posições abaixo são frações do curso e batem com os
   * limiares dos cinco estados.
   */
  const linha = useCallback((gsap: (typeof import("gsap"))["gsap"]) => {
    const tl = gsap.timeline();

    // Ponteiros: avançam do começo ao fim — o tempo passa porque você o move.
    tl.to(
      "[data-clock-ponteiro-hora]",
      { rotate: 42, svgOrigin: "200 200", ease: "none", duration: 1 },
      0,
    )
      .to(
        "[data-clock-ponteiro-minuto]",
        { rotate: 300, svgOrigin: "200 200", ease: "none", duration: 1 },
        0,
      )
      .to(
        "[data-clock-ponteiro-segundo]",
        { rotate: 900, svgOrigin: "200 200", ease: "none", duration: 1 },
        0,
      )
      .to("[data-clock-progresso]", { strokeDashoffset: 0.72, ease: "none", duration: 1 }, 0);

    // Abertura das folhas: 10% → 30% do curso. Antes disso elas estão fechadas,
    // e é por isso que o estado 1 existe.
    tl.to("[data-folha='esquerda']", { xPercent: -100, ease: "power2.inOut", duration: 0.2 }, 0.1)
      .to("[data-folha='direita']", { xPercent: 100, ease: "power2.inOut", duration: 0.2 }, 0.1)
      .to("[data-hero-luz]", { opacity: 1, ease: "power1.out", duration: 0.2 }, 0.13);

    // As interrupções só recuam DEPOIS do trecho de observação: 70% → 85%.
    // De 30% a 70% o mostrador fica inteiro e só os ponteiros se movem.
    gsap.utils.toArray<HTMLElement>("[data-chaos-card]").forEach((card, i) => {
      const depth = Number(card.dataset["depth"] ?? 0.5);
      tl.to(
        card,
        {
          y: -120 * depth,
          x: window.innerWidth < 1024 ? 0 : (i % 2 === 0 ? -70 : 70) * depth,
          scale: 0.84,
          opacity: 0,
          ease: "power1.out",
          duration: 0.15,
        },
        0.7,
      );
    });

    // O miolo cresce na resolução, preparando o halo do capítulo final.
    tl.to("[data-clock-miolo]", { attr: { r: 22 }, ease: "power1.in", duration: 0.15 }, 0.7);

    // Saída: só nos últimos 15%. O título perde força e o relógio se afasta —
    // até aqui ele permaneceu inteiro dentro da viewport.
    tl.to("[data-hero-fade]", { opacity: 0.2, y: -28, ease: "power1.in", duration: 0.12 }, 0.88).to(
      "[data-hero-relogio]",
      { scale: 1.14, opacity: 0.45, ease: "none", duration: 0.12 },
      0.88,
    );

    return tl;
  }, []);

  const { ativo } = useCenaSincronizada({
    escopo: secao,
    curso: "[data-curso-hero]",
    quantidade: ESTADOS.length,
    nome: "hero",
    start: "top top",
    end: "bottom bottom",
    pesos: PESOS,
    linha,
  });

  const fechada = !estatico && ativo === 0;

  return (
    <section
      ref={secao}
      data-cena="hero"
      data-estado={ESTADOS[ativo]!.id}
      aria-labelledby="hero-titulo"
    >
      <div data-curso-hero className={cn("relative", estatico ? "" : "isolate")}>
        {/* O palco. `top` e `height` descontam o header sticky: sem isso o
            topo da cena nasce por baixo da barra e o relógio perde altura
            útil justamente onde ele precisa caber inteiro. */}
        <div
          data-hero-palco
          className={cn(
            "relative flex items-start pt-[6svh] lg:items-center lg:pt-0 overflow-hidden bg-surface",
            estatico
              ? "min-h-[92svh]"
              : "sticky top-[var(--header-height)] h-[calc(100dvh-var(--header-height))]",
          )}
        >
          {/* Camada distante: o relógio. Centrado no PALCO, que não se move —
              é o que garante o critério de o centro permanecer na viewport. */}
          <div
            data-hero-relogio
            aria-hidden="true"
            className="pointer-events-none absolute -z-10
                       right-[-34vw] top-[62%] h-[124vmin] w-[124vmin] -translate-y-1/2
                       lg:right-[-14vw] lg:top-1/2 lg:h-[92vmin] lg:w-[92vmin]"
          >
            <ScrollClock />
          </div>

          {/* Primeiro plano: o que hoje interrompe o dia. */}
          <ChaosNotifications className="-z-[5]" />

          {/* As folhas da agenda. Largas o bastante para a abertura ser um
              evento, com teto de 24rem: em 1920 duas folhas de 42vw cobriam
              84% da tela e o hero abria praticamente vazio. */}
          <div
            aria-hidden="true"
            data-folha="esquerda"
            style={estatico ? { transform: "translateX(-100%)" } : undefined}
            className="pointer-events-none absolute inset-y-0 left-0 -z-[3] w-[26vw] max-w-[24rem] bg-background
                       shadow-[inset_-24px_0_48px_-24px_rgba(28,21,21,0.10)]
                       after:absolute after:inset-y-0 after:right-0 after:w-px
                       after:bg-gradient-to-b after:from-transparent after:via-primary/35 after:to-transparent"
          />
          <div
            aria-hidden="true"
            data-folha="direita"
            style={estatico ? { transform: "translateX(100%)" } : undefined}
            className="pointer-events-none absolute inset-y-0 right-0 -z-[3] w-[26vw] max-w-[24rem] bg-background
                       shadow-[inset_24px_0_48px_-24px_rgba(28,21,21,0.10)]
                       before:absolute before:inset-y-0 before:left-0 before:w-px
                       before:bg-gradient-to-b before:from-transparent before:via-primary/35 before:to-transparent"
          />

          {/* A luz que entra quando a agenda abre. */}
          <div
            aria-hidden="true"
            data-hero-luz
            className={cn(
              "pointer-events-none absolute inset-0 -z-[4]",
              estatico ? "opacity-100" : "opacity-0",
            )}
            style={{
              background:
                "radial-gradient(60% 55% at 50% 45%, var(--color-primary-soft) 0%, transparent 70%)",
            }}
          />

          <div
            data-hero-texto
            className="mx-auto w-full max-w-[76rem] px-5 sm:px-8 2xl:max-w-[90rem]"
          >
            <div className="max-w-xl rounded-[var(--radius-2xl)] bg-surface/70 p-6 backdrop-blur-[2px] sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
              <p
                data-hero-fade
                className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
              >
                <span aria-hidden="true" className="inline-block h-px w-8 bg-primary" />O tempo se
                abre para você
              </p>

              <h1
                data-hero-fade
                id="hero-titulo"
                className="mt-6 text-5xl leading-[1.02] text-foreground sm:text-7xl"
              >
                Seu tempo vale mais.
              </h1>

              <p
                data-hero-fade
                className="mt-6 measure text-lg leading-relaxed text-muted-foreground"
              >
                Organize compromissos, conecte pessoas e dedique seu tempo ao que realmente importa.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <InviteDialog
                  trigger={
                    <Button variant="brand" size="pill">
                      Solicitar acesso
                    </Button>
                  }
                />
                <Button variant="quiet" size="pill" asChild>
                  <a href="#como-funciona">Descubra como funciona</a>
                </Button>
              </div>

              <p data-hero-fade className="mt-5 max-w-md text-sm text-muted-foreground">
                O acesso é liberado por convite, em levas, enquanto o aplicativo não chega às lojas.
              </p>
            </div>
          </div>

          {/* O convite a rolar some assim que a cena começa a responder. */}
          <a
            href="#como-funciona"
            className={cn(
              "absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 rounded-full px-4 py-2",
              "text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
              "transition-opacity duration-500 hover:text-foreground",
              estatico || fechada ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            Role para começar
            <ArrowDown aria-hidden="true" className="size-4 animate-bounce" />
          </a>
        </div>

        {/* O curso da cena. Sem movimento não existe: é altura que só serve
            para dirigir a animação. */}
        {estatico
          ? null
          : ESTADOS.map((e, i) => <div key={e.id} aria-hidden="true" className={CURSO[i]} />)}
      </div>
    </section>
  );
}
