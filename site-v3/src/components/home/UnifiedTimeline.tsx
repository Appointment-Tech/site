import { useRef } from "react";

import { useScrollScene } from "@/lib/motion";

/**
 * Capítulo 3 — tudo no mesmo lugar.
 *
 * O relógio deixa de marcar pressão e vira uma agenda radial: os compromissos
 * se encaixam nas horas livres, cada um com o benefício que ele representa.
 * Evita a grade de cards — a informação fica presa à posição no mostrador, que
 * é o que sustenta a ideia de um dia inteiro cabendo num app só.
 */
const COMPROMISSOS = [
  { hora: "08:00", angulo: -120, rotulo: "Academia", beneficio: "Marcação disponível 24 horas" },
  { hora: "10:30", angulo: -60, rotulo: "Consulta", beneficio: "Appointments fáceis de consultar" },
  { hora: "13:00", angulo: 0, rotulo: "Reunião", beneficio: "Menos conflitos de horário" },
  { hora: "15:30", angulo: 60, rotulo: "Salão", beneficio: "Remarcação e cancelamento simples" },
  { hora: "17:00", angulo: 120, rotulo: "Personal", beneficio: "Pagamentos no próprio app" },
  { hora: "19:00", angulo: 180, rotulo: "Pessoal", beneficio: "Informações centralizadas" },
] as const;

export function UnifiedTimeline() {
  const secao = useRef<HTMLElement>(null);

  useScrollScene(secao, ({ gsap }) => {
    gsap.from("[data-compromisso]", {
      scale: 0.6,
      opacity: 0,
      duration: 0.5,
      stagger: 0.12,
      ease: "back.out(1.6)",
      scrollTrigger: { trigger: secao.current, start: "top 65%" },
    });

    // O mostrador gira devagar enquanto a seção passa: o dia avançando.
    gsap.to("[data-radial]", {
      rotate: 7,
      ease: "none",
      scrollTrigger: {
        trigger: secao.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8,
      },
    });
  });

  return (
    <section
      ref={secao}
      data-beat="colisao"
      aria-labelledby="agenda-titulo"
      className="relative overflow-hidden bg-surface py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <span aria-hidden="true" className="inline-block h-px w-8 bg-primary" />
          Tudo no mesmo lugar
        </p>
        <h2 id="agenda-titulo" className="mt-5 max-w-2xl text-3xl sm:text-4xl">
          Um dia inteiro, de profissionais diferentes, num app só.
        </h2>
        <p className="mt-4 measure text-lg leading-relaxed text-muted-foreground">
          Consulta, academia, salão, reunião. O que hoje mora em seis conversas passa a caber num
          mostrador.
        </p>

        <div className="mt-16 grid gap-14 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-20">
          {/* O mostrador. Em telas pequenas ele encolhe, mas continua sendo o
              elemento narrativo — some só o parallax, nunca o significado. */}
          <div
            data-radial
            className="relative mx-auto aspect-square w-[19rem] sm:w-[24rem]"
            aria-hidden="true"
          >
            <div className="absolute inset-0 rounded-full border border-border" />
            <div className="absolute inset-[12%] rounded-full border border-dashed border-border/70" />
            <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />

            {COMPROMISSOS.map((item) => {
              // Posição por trigonometria, não por translate percentual: o
              // translate é relativo ao tamanho do próprio cartão, então
              // `translateY(-42%)` empilhava todos no centro em vez de
              // distribuí-los pelo raio.
              const rad = ((item.angulo - 90) * Math.PI) / 180;
              const esquerda = 50 + 42 * Math.cos(rad);
              const topo = 50 + 42 * Math.sin(rad);
              return (
                <div
                  key={item.hora}
                  data-compromisso
                  className="absolute"
                  style={{ left: `${esquerda}%`, top: `${topo}%` }}
                >
                  <div className="-translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-[var(--radius-pill)] border border-border bg-card px-3 py-1.5 shadow-[var(--shadow-card)]">
                    <span className="text-[0.7rem] font-semibold tabular-nums text-primary">
                      {item.hora}
                    </span>
                    <span className="ml-2 text-[0.75rem] text-foreground">{item.rotulo}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <ul className="space-y-5">
            {COMPROMISSOS.map((item) => (
              <li key={item.beneficio} className="flex gap-4 border-l border-border pl-5">
                <span className="w-14 shrink-0 pt-0.5 text-[0.8rem] font-semibold tabular-nums text-primary">
                  {item.hora}
                </span>
                <p className="text-[0.95rem] leading-relaxed">
                  <strong className="font-semibold">{item.rotulo}.</strong>{" "}
                  <span className="text-muted-foreground">{item.beneficio}.</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
