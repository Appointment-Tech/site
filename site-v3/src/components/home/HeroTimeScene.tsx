import { useRef } from "react";
import { ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InviteDialog } from "@/components/site/InviteDialog";
import { ScrollClock } from "@/components/home/ScrollClock";
import { ChaosNotifications } from "@/components/home/ChaosNotifications";
import { useScrollScene } from "@/lib/motion";

/**
 * Capítulo 1 — o tempo está correndo, e a agenda se abre.
 *
 * O hero segura a cena enquanto o visitante rola: o relógio adianta os
 * ponteiros, as interrupções perdem força e são absorvidas pelo centro, e duas
 * folhas laterais se afastam como as páginas de uma agenda abrindo. É o
 * momento de maior impacto da página, e o que dá sentido a tudo que vem
 * depois.
 *
 * O conteúdo é HTML real e legível parado: com `prefers-reduced-motion`, ou
 * sem JavaScript, tudo fica no estado final e nada se perde.
 */
export function HeroTimeScene() {
  const secao = useRef<HTMLElement>(null);

  useScrollScene(secao, ({ gsap }) => {
    const linha = gsap.timeline({
      scrollTrigger: {
        trigger: secao.current,
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
      },
    });

    // Os ponteiros avançam com o scroll: o tempo passa porque você o move.
    linha
      .to("[data-clock-ponteiro-hora]", { rotate: 42, ease: "none" }, 0)
      .to("[data-clock-ponteiro-minuto]", { rotate: 300, ease: "none" }, 0)
      .to("[data-clock-ponteiro-segundo]", { rotate: 900, ease: "none" }, 0)
      .to("[data-clock-progresso]", { strokeDashoffset: 0.72, ease: "none" }, 0)
      // O miolo cresce: o centro abre espaço.
      .to("[data-clock-miolo]", { attr: { r: 26 }, ease: "power1.in" }, 0)
      .to("[data-hero-relogio]", { scale: 1.12, opacity: 0.5, ease: "none" }, 0);

    // As interrupções se afastam em profundidades diferentes e somem — são
    // absorvidas, não apagadas: o produto resolve o que elas representam.
    gsap.utils.toArray<HTMLElement>("[data-chaos-card]").forEach((card) => {
      const depth = Number(card.dataset["depth"] ?? 0.5);
      linha.to(
        card,
        {
          y: -140 * depth,
          x: (index) => (index % 2 === 0 ? -60 : 60) * depth,
          scale: 0.82,
          opacity: 0,
          ease: "none",
        },
        0,
      );
    });

    // As folhas laterais se abrem. É a promessa do capítulo: abrir espaço.
    linha
      .to("[data-folha='esquerda']", { xPercent: -100, ease: "power2.inOut" }, 0.15)
      .to("[data-folha='direita']", { xPercent: 100, ease: "power2.inOut" }, 0.15);

    // O texto sobe um pouco mais devagar que o resto: profundidade sem blur.
    linha.to("[data-hero-texto]", { y: -70, opacity: 0.15, ease: "none" }, 0);

    // Batida do relógio quando parado, para a cena não morrer sem scroll.
    const pulso = gsap.to("[data-clock-aro-medio]", {
      rotate: 360,
      duration: 90,
      ease: "none",
      repeat: -1,
      transformOrigin: "200px 200px",
    });
    return () => pulso.kill();
  });

  return (
    <section
      ref={secao}
      data-beat="distancia"
      aria-labelledby="hero-titulo"
      className="relative isolate flex min-h-[92svh] items-center overflow-hidden bg-surface"
    >
      {/* Camada distante: o relógio. */}
      <div
        data-hero-relogio
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 opacity-90
                   left-1/2 top-1/2 h-[104vmin] w-[104vmin] -translate-x-1/2 -translate-y-1/2
                   lg:left-auto lg:right-[-14vw] lg:h-[96vmin] lg:w-[96vmin] lg:translate-x-0"
      >
        <ScrollClock />
      </div>

      {/* Primeiro plano: o que hoje interrompe o dia. */}
      <ChaosNotifications className="-z-[5]" />

      {/* As folhas da agenda, que se abrem ao rolar. */}
      <div
        aria-hidden="true"
        data-folha="esquerda"
        className="pointer-events-none absolute inset-y-0 left-0 -z-[3] w-[22vw] border-r border-border bg-background/80"
      />
      <div
        aria-hidden="true"
        data-folha="direita"
        className="pointer-events-none absolute inset-y-0 right-0 -z-[3] w-[22vw] border-l border-border bg-background/80"
      />

      <div data-hero-texto className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-xl rounded-[var(--radius-2xl)] bg-surface/70 p-6 backdrop-blur-[2px] sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <span aria-hidden="true" className="inline-block h-px w-8 bg-primary" />O tempo se abre
            para você
          </p>

          <h1 id="hero-titulo" className="mt-6 text-5xl leading-[1.02] text-foreground sm:text-7xl">
            Seu tempo vale mais.
          </h1>

          <p className="mt-6 measure text-lg leading-relaxed text-muted-foreground">
            Organize compromissos, conecte pessoas e dedique seu tempo ao que realmente importa.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <InviteDialog
              trigger={
                <Button variant="brand" size="pill">
                  Marca um Appointment
                </Button>
              }
            />
            <Button variant="quiet" size="pill" asChild>
              <a href="#como-funciona">Descubra como funciona</a>
            </Button>
          </div>
        </div>
      </div>

      <a
        href="#como-funciona"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 rounded-full px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
      >
        Role para começar
        <ArrowDown aria-hidden="true" className="size-4 animate-bounce" />
      </a>
    </section>
  );
}
