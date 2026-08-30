import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Capitulo, RotuloCapitulo } from "@/components/home/Capitulo";
import { LinhaAgenda } from "@/components/home/pecas";
import { useCenaSincronizada } from "@/lib/cena";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Capítulo 4 — um produto, três perspectivas.
 *
 * Cena sticky única com três estados. A agenda individual do profissional
 * recebe um novo horário, expande para a visão de equipe da empresa e se
 * reorganiza como a agenda pessoal do cliente — é a mesma agenda vista de três
 * lugares, não três cartões.
 *
 * Visual e texto trocam pelo MESMO estado: um índice só governa os dois. Na
 * versão anterior o círculo e o bloco de texto eram controlados por gatilhos
 * distintos, e dava para ver "Cliente" aceso com o texto de empresa na tela.
 * E nada de bloco seguinte desbotado embaixo — durante a cena aparece só o
 * estado atual, com contraste inteiro.
 */
const PERSPECTIVAS = [
  {
    id: "profissional",
    aba: "Profissional",
    quadrante: "Quem atende",
    titulo: "Enquanto o Appointment cuida da sua agenda, você cuida do que faz melhor.",
    itens: [
      "Disponibilidade publicada para o cliente, 24 horas por dia",
      "Menos tempo respondendo mensagem entre um atendimento e outro",
      "Opção de receber no ato do agendamento, por cartão ou PIX",
      "Regras próprias de cancelamento e remarcação",
      "Horário cancelado volta a circular sozinho",
    ],
    para: "/profissionais",
    cta: "Ver para profissionais",
  },
  {
    id: "empresa",
    aba: "Empresa",
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
  },
  {
    id: "cliente",
    aba: "Cliente",
    quadrante: "Quem marca",
    titulo: "Todos os seus compromissos em um só lugar.",
    itens: [
      "Profissionais diferentes no mesmo aplicativo",
      "Marcação a qualquer hora, sem depender do expediente",
      "Quando o serviço cobra pelo app, cartão ou PIX com comprovante guardado",
      "Histórico junto do atendimento que o gerou",
      "Menos aplicativos e menos conversas dispersas",
    ],
    para: "/publico",
    cta: "Ver para quem marca",
  },
] as const;

/** "Empresa" mostra quatro agendas de uma vez — precisa de mais permanência. */
const PESOS = [1, 1.35, 1.2] as const;

/** A agenda muda de forma conforme a perspectiva — é sempre a mesma agenda. */
function AgendaDaPerspectiva({ indice }: { indice: number }) {
  if (indice === 0) {
    return (
      <div className="space-y-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Agenda de Helena · domingo, 30
        </p>
        <LinhaAgenda
          hora="09:00"
          duracao="50 min"
          titulo="Consulta de avaliação"
          pessoa="Marina Albuquerque"
          iniciais="MA"
          status="confirmado"
        />
        {/* O novo horário chega sem interromper o atendimento em curso. */}
        <LinhaAgenda
          hora="10:30"
          duracao="50 min"
          titulo="Sessão de acompanhamento"
          pessoa="Rafael Toledo"
          iniciais="RT"
          status="reservado"
          className="animate-in fade-in slide-in-from-bottom-2 duration-500"
        />
        <p className="text-[0.78rem] text-muted-foreground">
          Novo Appointment recebido sem interromper o atendimento.
        </p>
      </div>
    );
  }

  if (indice === 1) {
    return (
      <div className="space-y-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Equipe · domingo, 30
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { p: "Helena", i: "HV", h: "09:00", t: "Consulta", s: "confirmado" as const },
            { p: "Otávio", i: "OB", h: "09:30", t: "Avaliação", s: "confirmado" as const },
            { p: "Juliana", i: "JR", h: "11:00", t: "Retorno", s: "reservado" as const },
            { p: "Thiago", i: "TN", h: "14:00", t: "Sessão", s: "pendente" as const },
          ].map((linha) => (
            <LinhaAgenda
              key={linha.p}
              hora={linha.h}
              duracao="50 min"
              titulo={linha.t}
              pessoa={linha.p}
              iniciais={linha.i}
              status={linha.s}
            />
          ))}
        </div>
        <p className="text-[0.78rem] text-muted-foreground">
          Quatro agendas na mesma visão, sem horário em conflito.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Meus compromissos · esta semana
      </p>
      <LinhaAgenda
        hora="09:00"
        duracao="50 min"
        titulo="Consulta de avaliação"
        pessoa="Helena Vasconcelos · Fisioterapia"
        iniciais="HV"
        status="confirmado"
      />
      <LinhaAgenda
        hora="15:30"
        duracao="1 h"
        titulo="Corte e barba"
        pessoa="Otávio Bandeira · Salão"
        iniciais="OB"
        status="confirmado"
      />
      <LinhaAgenda
        hora="19:00"
        duracao="1 h"
        titulo="Treino"
        pessoa="Thiago Nogueira · Personal"
        iniciais="TN"
        status="reservado"
      />
      <p className="text-[0.78rem] text-muted-foreground">
        Profissionais diferentes, uma agenda pessoal só.
      </p>
    </div>
  );
}

export function AudienceJourney() {
  const secao = useRef<HTMLElement>(null);
  const estatico = useReducedMotion();

  // Uma fonte só para aba, título, lista e agenda. Todos saem deste `ativo`,
  // no mesmo commit do React — não há instante em que "Empresa" esteja acesa
  // com o texto ou a interface de outro público.
  const { ativo } = useCenaSincronizada({
    escopo: secao,
    curso: "[data-curso-perspectivas]",
    quantidade: PERSPECTIVAS.length,
    nome: "publicos",
    start: "top top",
    end: "bottom bottom",
    estadoEstatico: 0,
    pesos: PESOS,
  });

  const atual = PERSPECTIVAS[ativo]!;

  // Com movimento reduzido a cena vira três blocos convencionais, sem altura
  // artificial: as marcas de scroll existem só para dirigir a animação.
  if (estatico) {
    return (
      <Capitulo tom="quente">
        <section aria-labelledby="publicos-titulo">
          <RotuloCapitulo>Três ângulos do mesmo problema: tempo</RotuloCapitulo>
          <h2 id="publicos-titulo" className="mt-5 max-w-3xl text-3xl sm:text-4xl">
            Um produto, três perspectivas.
          </h2>
          <div className="mt-14 space-y-16">
            {PERSPECTIVAS.map((p, indice) => (
              <article key={p.id} className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {p.quadrante}
                  </p>
                  <h3 className="mt-3 text-2xl leading-snug">{p.titulo}</h3>
                  <ul className="mt-5 space-y-2">
                    {p.itens.map((item) => (
                      <li key={item} className="flex gap-3 text-[0.93rem] leading-relaxed">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-marca"
                        />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={p.para}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-marca"
                  >
                    {p.cta}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
                <AgendaDaPerspectiva indice={indice} />
              </article>
            ))}
          </div>
        </section>
      </Capitulo>
    );
  }

  return (
    <Capitulo compacto tom="quente">
      <section
        ref={secao}
        aria-labelledby="publicos-titulo"
        data-cena="publicos"
        data-estado={atual.id}
      >
        <div data-curso-perspectivas className="relative">
          {/* A cena presa: um único estado visível de cada vez, com contraste
              inteiro. Nada de próximo bloco desbotado por baixo.

              Título e rótulo entram AQUI dentro, e não acima: fora da cena
              presa eles rolavam embora assim que ela prendia — o visitante
              ficava com três abas e uma agenda sem saber de que capítulo se
              tratava — e ainda deixavam um vão de meia tela no topo. */}
          <div className="sticky top-0 z-10 flex min-h-[92svh] flex-col justify-center py-8">
            <RotuloCapitulo>Três ângulos do mesmo problema: tempo</RotuloCapitulo>
            <h2 id="publicos-titulo" className="mb-8 mt-4 max-w-3xl text-3xl sm:text-4xl">
              Um produto, três perspectivas.
            </h2>
            <div className="grid w-full gap-10 rounded-[var(--radius-2xl)] border border-marca/20 border-l-[5px] border-l-marca bg-marca-muted/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-[2px] lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:p-10">
              <div>
                <ol className="flex flex-wrap gap-2" aria-hidden="true">
                  {PERSPECTIVAS.map((p, indice) => (
                    <li
                      key={p.id}
                      data-indicador={p.id}
                      data-indicador-ativo={indice === ativo || undefined}
                      className={cn(
                        "rounded-[var(--radius-pill)] px-4 py-1.5 text-[0.78rem] font-semibold transition-colors duration-300",
                        indice === ativo
                          ? "bg-marca text-white shadow-[var(--shadow-card)]"
                          : indice < ativo
                            ? "bg-marca-soft text-marca"
                            : "bg-neutral-soft text-muted-foreground",
                      )}
                    >
                      {p.aba}
                    </li>
                  ))}
                </ol>

                <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {atual.quadrante}
                </p>
                <h3
                  data-copy={atual.id}
                  data-copy-ativo
                  className="mt-2 text-2xl leading-snug sm:text-3xl"
                >
                  {atual.titulo}
                </h3>

                <ul className="mt-6 space-y-2.5">
                  {atual.itens.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.93rem] leading-relaxed">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-marca"
                      />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={atual.para}
                  className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-marca"
                >
                  {atual.cta}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <div data-visual={atual.id} data-visual-ativo>
                <AgendaDaPerspectiva indice={ativo} />
              </div>
            </div>
          </div>

          {/* O curso da cena: cada perspectiva ocupa um terço da rolagem. Não
              é vazio de layout — é o tempo que o visitante tem em cada uma. */}
          {PERSPECTIVAS.map((p) => (
            <div key={p.id} aria-hidden="true" className="h-[76vh]" />
          ))}
        </div>
      </section>
    </Capitulo>
  );
}
