import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { InviteDialog } from "@/components/site/InviteDialog";
import { PriceDialog } from "@/components/site/PriceDialog";
import { useScrollScene } from "@/lib/motion";

/**
 * Capítulo 6 — seu tempo volta para você.
 *
 * O relógio se assenta: o movimento desacelera, os ponteiros param numa
 * posição equilibrada e o mostrador vira um halo — o mesmo círculo da marca.
 * A composição ganha ar, luz e silêncio, que é o oposto do hero.
 *
 * Não há botão de loja aqui: o app ainda não está publicado, e anunciar
 * download que não existe é o tipo de promessa que cobra caro depois.
 */
export function FinalCTA() {
  const secao = useRef<HTMLElement>(null);

  useScrollScene(secao, ({ gsap }) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: secao.current,
        start: "top 80%",
        end: "center center",
        scrub: 0.7,
      },
    });

    // O halo se abre a partir do centro: o relógio deixa de marcar pressão.
    tl.fromTo(
      "[data-halo]",
      { scale: 0.25, opacity: 0 },
      { scale: 1, opacity: 1, ease: "power2.out" },
      0,
    )
      .fromTo("[data-halo-anel]", { scale: 0.4 }, { scale: 1, ease: "power2.out" }, 0.1)
      .from(
        "[data-final-texto] > *",
        { y: 26, opacity: 0, stagger: 0.08, ease: "power2.out" },
        0.1,
      );
  });

  return (
    <section
      ref={secao}
      aria-labelledby="final-titulo"
      className="relative isolate overflow-hidden bg-background py-28 sm:py-40"
    >
      {/* O halo: o relógio virou luz. Fica atrás do texto e não o disputa. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2"
      >
        <div
          data-halo
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, var(--color-primary-soft) 0%, transparent 62%)",
          }}
        />
        <div
          data-halo-anel
          className="absolute inset-[18%] rounded-full border border-primary/20"
        />
        <div
          data-halo-anel
          className="absolute inset-[30%] rounded-full border border-primary/10"
        />
      </div>

      <div data-final-texto className="mx-auto w-full max-w-3xl px-5 text-center sm:px-8">
        <p className="flex items-center justify-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <span aria-hidden="true" className="inline-block h-px w-8 bg-primary" />
          Seu tempo volta para você
        </p>

        <h2 id="final-titulo" className="mt-6 text-4xl leading-[1.08] sm:text-5xl">
          Seu tempo não precisa ser consumido pela sua agenda.
        </h2>

        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Profissionais, empresas e clientes conectados em uma experiência simples, segura e feita
          para melhorar a qualidade de vida.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <InviteDialog
            trigger={
              <Button variant="brand" size="pill">
                Marca um Appointment
              </Button>
            }
          />
          <PriceDialog
            trigger={
              <Button variant="quiet" size="pill">
                Consulta de preço
              </Button>
            }
          />
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          O aplicativo ainda não está nas lojas. O acesso é por convite.
        </p>
      </div>
    </section>
  );
}
