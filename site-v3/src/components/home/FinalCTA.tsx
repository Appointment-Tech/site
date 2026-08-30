import { useRef } from "react";

import { Capitulo, RotuloCapitulo } from "@/components/home/Capitulo";
import { SeloStatus } from "@/components/home/pecas";
import { ScrollClock } from "@/components/home/ScrollClock";
import { Button } from "@/components/ui/button";
import { InviteDialog } from "@/components/site/InviteDialog";
import { PriceDialog } from "@/components/site/PriceDialog";
import { useScrollScene } from "@/lib/motion";

/**
 * Capítulo 6 — seu tempo volta para você.
 *
 * É o MESMO relógio do hero, e isso precisa ser visível: o objeto que abria a
 * página cercado de interrupções fecha-a em silêncio, com um Appointment
 * confirmado e o resto do dia livre. Por isso ele reaparece aqui inteiro, com
 * o halo por trás — e não um círculo novo, que não diria nada.
 */
export function FinalCTA() {
  const secao = useRef<HTMLElement>(null);

  useScrollScene(secao, ({ gsap }) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: secao.current,
          start: "top 85%",
          end: "center center",
          scrub: 0.7,
        },
      })
      // Os ponteiros chegam a uma posição equilibrada e param.
      .fromTo("[data-clock-ponteiro-hora]", { rotate: 42 }, { rotate: 300, ease: "power2.out" }, 0)
      .fromTo(
        "[data-clock-ponteiro-minuto]",
        { rotate: 300 },
        { rotate: 420, ease: "power2.out" },
        0,
      )
      .fromTo(
        "[data-clock-progresso]",
        { strokeDashoffset: 0.72 },
        { strokeDashoffset: 0, ease: "none" },
        0,
      )
      .fromTo(
        "[data-halo]",
        { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, ease: "power2.out" },
        0,
      )
      .from(
        "[data-final-texto] > *",
        { y: 24, opacity: 0, stagger: 0.07, ease: "power2.out" },
        0.15,
      )
      .from("[data-resumo]", { y: 20, opacity: 0, ease: "power2.out" }, 0.3);
  });

  return (
    <Capitulo tom="marca" className="overflow-hidden">
      <section ref={secao} aria-labelledby="final-titulo" className="relative py-6 sm:py-10">
        {/* O relógio do hero, agora em repouso, com o halo por trás. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 sm:h-[52rem] sm:w-[52rem]"
        >
          <div
            data-halo
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--color-primary-soft) 85%, transparent) 0%, transparent 64%)",
            }}
          />
          <div className="absolute inset-[14%] opacity-70">
            <ScrollClock />
          </div>
        </div>

        <div data-final-texto className="mx-auto max-w-3xl text-center">
          <RotuloCapitulo>
            <span className="mx-auto">Seu tempo volta para você</span>
          </RotuloCapitulo>

          <h2 id="final-titulo" className="mt-6 text-4xl leading-[1.08] sm:text-5xl">
            Seu tempo não precisa ser consumido pela sua agenda.
          </h2>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Profissionais, empresas e clientes conectados em uma experiência simples, segura e feita
            para melhorar a qualidade de vida.
          </p>
        </div>

        {/* O dia resolvido: um Appointment confirmado e o resto livre. */}
        <div
          data-resumo
          className="mx-auto mt-12 max-w-xl rounded-[var(--radius-xl)] border border-border bg-card/85 p-5 shadow-[var(--shadow-card)] backdrop-blur-[2px]"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Domingo, 30 de agosto
            </p>
            <SeloStatus status="confirmado" />
          </div>
          <p className="mt-3 text-[0.95rem] font-semibold text-foreground">
            09:00 · Consulta de avaliação
          </p>
          <p className="text-[0.85rem] text-muted-foreground">
            Helena Vasconcelos · pagamento registrado
          </p>
          <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
            <span className="h-1.5 flex-1 rounded-full bg-neutral-soft">
              <span className="block h-full w-[14%] rounded-full bg-success" />
            </span>
            <p className="shrink-0 text-[0.78rem] text-muted-foreground">O resto do dia é seu</p>
          </div>
          <p className="mt-3 text-[0.68rem] text-muted-foreground">
            Exemplo demonstrativo, com dados fictícios.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <InviteDialog
            trigger={
              <Button variant="brand" size="pill">
                Solicitar acesso
              </Button>
            }
          />
          <PriceDialog
            trigger={
              <Button variant="quiet" size="pill">
                Conhecer os planos
              </Button>
            }
          />
        </div>

        <p className="mx-auto mt-6 max-w-md text-center text-sm text-muted-foreground">
          O Appointment ainda não está aberto ao público: o acesso é liberado por convite, em levas,
          enquanto o aplicativo não chega às lojas.
        </p>
      </section>
    </Capitulo>
  );
}
