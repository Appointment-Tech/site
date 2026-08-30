import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { useScrollScene } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Capítulo 4 — um produto, três perspectivas.
 *
 * Os três públicos não são três cards: são três quadrantes da mesma linha do
 * tempo. O mostrador gira conforme a seção passa e revela cada perspectiva —
 * é o mesmo relógio dos capítulos anteriores, visto de outro ângulo.
 */
const PERSPECTIVAS = [
  {
    id: "profissional",
    quadrante: "Quem atende",
    titulo: "Enquanto o Appointment cuida da sua agenda, você cuida do que faz melhor.",
    itens: [
      "Disponibilidade publicada para o cliente, 24 horas por dia",
      "Menos tempo respondendo mensagem entre um atendimento e outro",
      "Pagamento no ato do agendamento, por cartão ou PIX",
      "Regras próprias de cancelamento e remarcação",
      "Horário cancelado volta a circular sozinho",
    ],
    para: "/profissionais",
    cta: "Ver para profissionais",
    rotacao: 0,
  },
  {
    id: "empresa",
    quadrante: "Quem atende",
    titulo: "Todas as agendas da sua equipe trabalhando em conjunto.",
    itens: [
      "Vários profissionais numa visão só",
      "Agendas sincronizadas, sem encaixe feito no grito",
      "Menos conflito de horário e menos sala ociosa",
      "Serviços e recebimentos ligados a quem atendeu",
      "Mais previsibilidade para a operação",
    ],
    para: "/empresas",
    cta: "Ver para empresas",
    rotacao: 120,
  },
  {
    id: "cliente",
    quadrante: "Quem marca",
    titulo: "Todos os seus compromissos em um só lugar.",
    itens: [
      "Profissionais diferentes no mesmo aplicativo",
      "Marcação a qualquer hora, sem depender do expediente",
      "Pagamento por cartão ou PIX, com comprovante guardado",
      "Histórico junto do atendimento que o gerou",
      "Menos aplicativos e menos conversa dispersa",
    ],
    para: "/publico",
    cta: "Ver para quem marca",
    rotacao: 240,
  },
] as const;

export function AudienceJourney() {
  const secao = useRef<HTMLElement>(null);
  const [ativo, setAtivo] = useState(0);

  useScrollScene(secao, ({ gsap }) => {
    gsap.utils.toArray<HTMLElement>("[data-perspectiva]").forEach((bloco, indice) => {
      gsap.timeline({
        scrollTrigger: {
          trigger: bloco,
          start: "top 60%",
          end: "bottom 60%",
          onEnter: () => setAtivo(indice),
          onEnterBack: () => setAtivo(indice),
        },
      });
    });
  });

  return (
    <section
      ref={secao}
      data-beat="confirmacao"
      aria-labelledby="publicos-titulo"
      className="relative bg-background py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <span aria-hidden="true" className="inline-block h-px w-8 bg-primary" />
          Três ângulos do mesmo problema: tempo
        </p>
        <h2 id="publicos-titulo" className="mt-5 max-w-2xl text-3xl sm:text-4xl">
          Um produto, três perspectivas.
        </h2>

        <div className="mt-16 grid gap-16 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-20">
          {/* O mesmo mostrador, girando para o quadrante de cada público. */}
          <div className="hidden lg:sticky lg:top-28 lg:block" aria-hidden="true">
            <div className="relative aspect-square w-[17rem]">
              <div className="absolute inset-0 rounded-full border border-border" />
              {/* O anel gira para trazer o quadrante ativo ao topo; os rótulos
                  são posicionados por trigonometria e contra-rotacionados, para
                  o texto ficar sempre na horizontal. */}
              <div
                className="absolute inset-0 transition-transform duration-700 ease-out"
                style={{ transform: `rotate(${-PERSPECTIVAS[ativo]!.rotacao}deg)` }}
              >
                {PERSPECTIVAS.map((p, indice) => {
                  const rad = ((p.rotacao - 90) * Math.PI) / 180;
                  const esquerda = 50 + 38 * Math.cos(rad);
                  const topo = 50 + 38 * Math.sin(rad);
                  return (
                    <div
                      key={p.id}
                      className="absolute"
                      style={{ left: `${esquerda}%`, top: `${topo}%` }}
                    >
                      <span
                        className={cn(
                          "block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-[var(--radius-pill)] border px-3 py-1.5 text-[0.75rem] font-semibold transition-colors",
                          indice === ativo
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground",
                        )}
                        style={{ rotate: `${PERSPECTIVAS[ativo]!.rotacao}deg` }}
                      >
                        {p.id === "profissional"
                          ? "Profissional"
                          : p.id === "empresa"
                            ? "Empresa"
                            : "Cliente"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
            </div>
          </div>

          <div className="space-y-24 lg:space-y-32">
            {PERSPECTIVAS.map((p, indice) => (
              <article
                key={p.id}
                data-perspectiva
                className={cn(
                  "transition-opacity duration-500",
                  indice === ativo ? "opacity-100" : "opacity-55",
                )}
              >
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {p.quadrante}
                </p>
                <h3 className="mt-3 text-2xl leading-snug sm:text-3xl">{p.titulo}</h3>
                <ul className="mt-6 space-y-3">
                  {p.itens.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.95rem] leading-relaxed">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={p.para}
                  className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  {p.cta}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
