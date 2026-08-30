import { useRef } from "react";

import { useScrollScene } from "@/lib/motion";

/**
 * Capítulo 5 — do problema à confirmação.
 *
 * Sem tabela comparativa: os fragmentos do "antes" se reorganizam no fluxo do
 * app conforme o scroll avança. Cada item da esquerda tem um par à direita, e
 * a animação leva um ao outro — a simplificação é vista, não lida.
 */
const CONVERSOES = [
  { antes: "Mensagem às 23h", depois: "Horário livre, visível na hora" },
  { antes: "Ligação não atendida", depois: "Confirmação automática" },
  { antes: "Horários desencontrados", depois: "Agenda sincronizada" },
  { antes: "Cobrança manual, depois", depois: "Pagamento no ato" },
  { antes: "Anotação em três lugares", depois: "Informações centralizadas" },
  { antes: "Falta sem aviso", depois: "Lembrete antes da hora" },
] as const;

export function BeforeAfterFlow() {
  const secao = useRef<HTMLElement>(null);

  useScrollScene(secao, ({ gsap }) => {
    gsap.utils.toArray<HTMLElement>("[data-conversao]").forEach((linha, indice) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: linha,
          start: "top 78%",
          end: "top 42%",
          scrub: 0.5,
        },
      });

      // O fragmento antigo perde força e desliza para a direita; o novo entra
      // no lugar dele. É a mesma informação, reorganizada.
      tl.to(linha.querySelector("[data-antes]"), { xPercent: 12, opacity: 0.28, ease: "none" }, 0)
        .fromTo(
          linha.querySelector("[data-depois]"),
          { xPercent: -8, opacity: 0 },
          { xPercent: 0, opacity: 1, ease: "none" },
          0,
        )
        .fromTo(
          linha.querySelector("[data-tracado]"),
          { scaleX: 0 },
          { scaleX: 1, ease: "none" },
          0,
        );

      if (indice === 0) tl.progress(0);
    });
  });

  return (
    <section
      ref={secao}
      data-beat="dispersao"
      aria-labelledby="conversao-titulo"
      className="relative bg-surface py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <span aria-hidden="true" className="inline-block h-px w-8 bg-primary" />
          Do problema à confirmação
        </p>
        <h2 id="conversao-titulo" className="mt-5 max-w-2xl text-3xl sm:text-4xl">
          O que hoje é ruído vira um passo só.
        </h2>

        <ul className="mt-16 space-y-6">
          {CONVERSOES.map((item) => (
            <li
              key={item.antes}
              data-conversao
              className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]"
            >
              <p
                data-antes
                className="rounded-[var(--radius-lg)] border border-border bg-card/60 px-4 py-3 text-[0.9rem] text-muted-foreground line-through decoration-primary/40"
              >
                {item.antes}
              </p>

              <span aria-hidden="true" className="hidden h-px w-16 bg-border sm:block">
                <span data-tracado className="block h-px w-full origin-left bg-primary" />
              </span>

              <p
                data-depois
                className="rounded-[var(--radius-lg)] border border-success/25 bg-success-soft px-4 py-3 text-[0.9rem] font-medium text-success"
              >
                {item.depois}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
