import { useEffect, useRef } from "react";
import { Check, CalendarDays, CreditCard } from "lucide-react";

import { Capitulo, RotuloCapitulo } from "@/components/home/Capitulo";
import { ChipHorario, ChipServico, SeloStatus } from "@/components/home/pecas";
import { PhoneFrame } from "@/components/site/PhoneFrame";
import { telas } from "@/lib/telas";
import { useCenaSincronizada } from "@/lib/cena";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Capítulo 2 — marcar não deveria ser complicado.
 *
 * A ordem é a do produto e nenhuma etapa mostra o que ainda não aconteceu:
 * buscar, escolher o serviço, escolher o horário, conferir e confirmar. O
 * Appointment confirmado só aparece DEPOIS da confirmação — antes ele
 * entregava o final da história na terceira linha.
 *
 * Duas telas não existem entre as capturas do app: a escolha de horário e a
 * conferência antes de confirmar. Elas são compostas com as peças reais do
 * produto (`home/pecas.tsx`), sem inventar recurso.
 *
 * Todas as telas ficam montadas o tempo todo e trocam por opacidade. Antes o
 * `src` da imagem era trocado a cada estado: com `loading="lazy"` a captura da
 * etapa seguinte só começava a baixar no instante da troca, e o aparelho
 * ficava vazio enquanto o texto já era o da etapa nova.
 */
const ESTADOS = [
  {
    id: "encontre",
    passo: 0,
    titulo: "Encontre quem você precisa",
    texto: "Busque pela profissão, pelo serviço ou pelo nome. O que aparece está livre de verdade.",
    legenda: "Busca e profissionais disponíveis",
    resolucao: false,
  },
  {
    id: "escolha",
    passo: 1,
    titulo: "Escolha o serviço",
    texto: "Cada serviço leva seu valor e sua duração. Você sabe quanto custa antes de marcar.",
    legenda: "Perfil da profissional e serviços",
    resolucao: false,
  },
  {
    id: "agende",
    passo: 2,
    titulo: "Agende o horário",
    texto: "Os horários livres do dia aparecem na hora. Toque em um e ele sai de circulação.",
    legenda: "Horários livres do dia",
    resolucao: false,
  },
  {
    id: "confirme",
    passo: 3,
    titulo: "Confirme seu Appointment",
    texto: "Antes de fechar, você confere serviço, profissional, dia, horário e valor.",
    legenda: "Conferência antes de confirmar",
    resolucao: false,
  },
  {
    id: "confirmado",
    passo: 3,
    resolucao: true,
    titulo: "Pronto — o compromisso existe",
    texto: "Os dois lados recebem a confirmação, com cancelamento e remarcação sem multa.",
    legenda: "Appointment confirmado",
  },
] as const;

const PASSOS = ["Encontre", "Escolha", "Agende", "Confirme"] as const;

/** "Confirme" tem a tela mais densa da cena, e a resolução precisa assentar. */
/**
 * Rolagem de cada estado, em vh. É também o peso da fatia: espaçador e fatia
 * são o mesmo número, então o que se lê no CSS é o que governa a troca.
 */
const CURSO_VH = [80, 80, 85, 90, 60] as const;

/** Escolha de horário, composta com as peças reais do app. */
function TelaDisponibilidade() {
  return (
    <div className="flex h-full flex-col bg-card px-3 pb-3 pt-4 text-left">
      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Consulta de avaliação
      </p>
      <p className="mt-1 flex items-center gap-1 text-[0.7rem] font-semibold text-foreground">
        <CalendarDays aria-hidden="true" className="size-3 shrink-0 text-marca" />
        Domingo, 30 de agosto
      </p>

      <p className="mt-4 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Horários livres
      </p>
      <div className="mt-2 grid grid-cols-3 gap-1">
        <ChipHorario hora="09:00" estado="selecionado" />
        <ChipHorario hora="10:30" />
        <ChipHorario hora="14:00" />
        <ChipHorario hora="15:30" />
        <ChipHorario hora="16:30" />
        <ChipHorario hora="17:00" />
      </div>

      <div className="mt-auto rounded-[var(--radius-md)] border border-marca/30 bg-marca-soft p-2">
        <p className="text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-marca">
          Selecionado
        </p>
        <p className="mt-0.5 text-[0.75rem] font-semibold tabular-nums text-foreground">
          09:00 · 50 min
        </p>
      </div>
    </div>
  );
}

/** Conferência antes de confirmar — ainda NÃO é um Appointment confirmado. */
function TelaConferencia() {
  return (
    <div className="flex h-full flex-col bg-card px-3 pb-3 pt-4 text-left">
      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Confira antes de confirmar
      </p>
      <div className="mt-2 space-y-1 rounded-[var(--radius-md)] border border-border p-2">
        <Linha rotulo="Serviço" valor="Consulta de avaliação" />
        <Linha rotulo="Profissional" valor="Helena Vasconcelos" />
        <Linha rotulo="Quando" valor="30/08, 09:00" />
        <Linha rotulo="Duração" valor="50 min" />
      </div>

      <div className="mt-2 rounded-[var(--radius-md)] border border-border p-2">
        <p className="flex items-center justify-between text-[0.62rem] text-muted-foreground">
          Valor
          <span className="text-[0.85rem] font-semibold tabular-nums text-foreground">
            R$ 180,00
          </span>
        </p>
        <p className="mt-1.5 flex items-start gap-1 border-t border-border pt-1.5 text-[0.6rem] leading-tight text-muted-foreground">
          <CreditCard aria-hidden="true" className="mt-px size-3 shrink-0 text-marca" />
          Pagamento disponível neste serviço: cartão ou PIX
        </p>
      </div>

      <p className="mt-2 rounded-[var(--radius-md)] bg-neutral-soft p-2 text-[0.58rem] leading-tight text-muted-foreground">
        Cancelamento e reagendamento sem multa, conforme a regra da profissional.
      </p>

      <div className="mt-auto rounded-[var(--radius-pill)] bg-marca py-1.5 text-center text-[0.62rem] font-semibold text-white sm:py-2 sm:text-[0.72rem]">
        <span className="sm:hidden">Confirmar</span>
        <span className="hidden sm:inline">Confirmar Appointment</span>
      </div>
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <p className="flex items-baseline justify-between gap-2 text-[0.62rem] leading-tight">
      <span className="shrink-0 text-muted-foreground">{rotulo}</span>
      <span className="text-right font-medium text-foreground">{valor}</span>
    </p>
  );
}

/**
 * O palco: as cinco telas empilhadas, uma visível.
 *
 * Trocar opacidade em vez de trocar `src` é o que torna a virada instantânea —
 * e é o que garante que o aparelho nunca fique em branco no meio de um estado.
 */
/** As capturas do palco, por estado. Constante — vive fora do componente. */
const CAPTURAS = [
  { indice: 0, tela: telas.busca },
  { indice: 1, tela: telas.perfil },
  { indice: 4, tela: telas.confirmado },
] as const;

function PalcoTelas({ ativo }: { ativo: number }) {
  // `loading="lazy"` só promete que o browser PODE adiar, e montar a imagem não
  // garante que ela esteja DECODIFICADA quando o estado troca. Aqui as três
  // capturas são baixadas e decodificadas antes de a cena precisar delas.
  useEffect(() => {
    for (const { tela } of CAPTURAS) {
      const img = new Image();
      img.src = tela.src;
      void img.decode?.().catch(() => {});
    }
  }, []);

  return (
    <div className="absolute inset-0">
      {CAPTURAS.map(({ indice, tela }) => (
        <img
          key={indice}
          data-visual={ESTADOS[indice]!.id}
          data-visual-ativo={ativo === indice || undefined}
          src={tela.src}
          alt={ativo === indice ? tela.alt : ""}
          aria-hidden={ativo !== indice}
          width={1080}
          height={2400}
          decoding="sync"
          className={cn(
            "absolute inset-0 h-full w-full object-contain transition-opacity duration-150",
            ativo === indice ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      <div
        data-visual="agende"
        data-visual-ativo={ativo === 2 || undefined}
        aria-hidden={ativo !== 2}
        className={cn(
          "absolute inset-0 transition-opacity duration-150",
          ativo === 2 ? "opacity-100" : "opacity-0",
        )}
      >
        <TelaDisponibilidade />
      </div>
      <div
        data-visual="confirme"
        data-visual-ativo={ativo === 3 || undefined}
        aria-hidden={ativo !== 3}
        className={cn(
          "absolute inset-0 transition-opacity duration-150",
          ativo === 3 ? "opacity-100" : "opacity-0",
        )}
      >
        <TelaConferencia />
      </div>
    </div>
  );
}

/** A peça de apoio de cada estado, ao lado do texto. */
function PecaDoEstado({ indice }: { indice: number }) {
  if (indice === 0) {
    return (
      <div className="flex flex-wrap gap-2">
        <ChipHorario hora="09:00" />
        <ChipHorario hora="10:30" />
        <ChipHorario hora="14:00" />
      </div>
    );
  }
  if (indice === 1) {
    return (
      <div className="space-y-2">
        <ChipServico nome="Consulta de avaliação" valor="R$ 180,00" ativo />
        <ChipServico nome="Sessão de acompanhamento" valor="R$ 150,00" />
      </div>
    );
  }
  if (indice === 2) {
    return (
      <div className="flex flex-wrap gap-2">
        <ChipHorario hora="09:00" estado="selecionado" />
        <ChipHorario hora="10:30" />
        <ChipHorario hora="14:00" />
      </div>
    );
  }
  if (indice === 3) {
    return (
      <div className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-marca/30 bg-marca-soft px-3 py-2 text-[0.85rem] font-medium text-marca">
        <CreditCard aria-hidden="true" className="size-4" />
        R$ 180,00 · pagamento disponível neste serviço
      </div>
    );
  }
  // Só aqui o verde aparece — e só no selo, que é o que ele significa.
  return <SeloStatus status="confirmado" />;
}

export function BookingStory() {
  const secao = useRef<HTMLElement>(null);
  const estatico = useReducedMotion();

  const { ativo } = useCenaSincronizada({
    escopo: secao,
    curso: "[data-curso-etapas]",
    quantidade: ESTADOS.length,
    nome: "passos",
    start: "top top",
    end: "bottom bottom",
    pesos: CURSO_VH,
  });

  const estado = ESTADOS[ativo]!;

  /** A trilha dos quatro passos. Não se move: é a referência da cena. */
  const trilha = (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2" aria-hidden="true">
      {PASSOS.map((verbo, indice) => {
        const cumprido = indice < estado.passo || Boolean(estado.resolucao);
        const corrente = indice === estado.passo && !estado.resolucao;
        return (
          <li key={verbo} className="flex items-center gap-2">
            <span
              data-indicador={verbo}
              data-indicador-ativo={indice === estado.passo || undefined}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-[var(--radius-pill)] px-2 text-[0.7rem] font-semibold transition-colors duration-300 sm:gap-2 sm:px-3 sm:text-[0.75rem]",
                cumprido && "bg-marca-soft text-marca",
                corrente && "bg-marca text-white",
                !cumprido && !corrente && "bg-neutral-soft text-muted-foreground",
              )}
            >
              {cumprido ? (
                <Check className="size-3.5" />
              ) : (
                <span className="inline-block w-3.5 text-center">{indice + 1}</span>
              )}
              <span>{verbo}</span>
            </span>
            {indice < PASSOS.length - 1 ? (
              <span
                className={cn(
                  "hidden h-px transition-colors duration-300 sm:inline-block sm:w-9",
                  indice < estado.passo || estado.resolucao ? "bg-marca/50" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );

  // Com movimento reduzido a cena vira uma lista convencional: sem palco preso
  // e sem curso, que é altura existente só para dirigir a animação.
  if (estatico) {
    return (
      <Capitulo id="como-funciona" tom="quente" className="scroll-mt-20">
        <section ref={secao} aria-labelledby="passos-titulo">
          <RotuloCapitulo>Quatro passos, nenhuma ligação</RotuloCapitulo>
          <h2 id="passos-titulo" className="mt-5 max-w-3xl text-3xl sm:text-4xl">
            Marcar um Appointment é tão fácil quanto mandar uma mensagem.
          </h2>
          <div className="mt-10">{trilha}</div>
          <div className="mt-12 space-y-14">
            {ESTADOS.map((item, indice) => (
              <article
                key={item.id}
                className="grid gap-8 lg:grid-cols-[1fr_16rem] lg:items-center"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl">
                    <span className="text-marca">{item.resolucao ? "✓" : item.passo + 1}.</span>{" "}
                    {item.titulo}
                  </h3>
                  <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
                    {item.texto}
                  </p>
                  <div className="mt-5 max-w-sm">
                    <PecaDoEstado indice={indice} />
                  </div>
                </div>
                <PhoneFrame screen={`fluxo-${item.id}`} caption={item.legenda}>
                  <PalcoTelas ativo={indice} />
                </PhoneFrame>
              </article>
            ))}
          </div>
        </section>
      </Capitulo>
    );
  }

  return (
    <Capitulo id="como-funciona" tom="quente" compacto className="scroll-mt-20">
      <section
        ref={secao}
        aria-labelledby="passos-titulo"
        data-cena="passos"
        data-estado={estado.id}
        data-passo-ativo={estado.passo}
      >
        <div data-curso-etapas className="relative">
          {/*
           * O palco.
           *
           * **Por que o capítulo funcionava como lista vertical.** Os cinco
           * textos eram `<li>` empilhados no documento, separados por 30vh, e
           * só o celular era `sticky`. O visitante rolava até encontrar a
           * próxima mensagem, e a certa altura via a tela do app sem título e
           * sem trilha na tela — as duas referências da cena já tinham subido.
           *
           * Agora eyebrow, título, trilha, mensagem e celular vivem no mesmo
           * bloco preso. O documento rola; nada aqui atravessa a página. Só a
           * MENSAGEM troca, sempre na mesma posição física.
           */}
          <div
            data-passos-palco
            className="sticky top-[var(--header-height)] flex h-[calc(100dvh-var(--header-height))] flex-col justify-center py-4"
          >
            <div data-passos-cabecalho>
              <RotuloCapitulo>Quatro passos, nenhuma ligação</RotuloCapitulo>
              <h2
                id="passos-titulo"
                className="mt-3 max-w-3xl text-xl leading-tight sm:text-3xl lg:text-4xl"
              >
                Marcar um Appointment é tão fácil quanto mandar uma mensagem.
              </h2>
              <div className="mt-5">{trilha}</div>
            </div>

            {/* Área da etapa ativa. Todas as etapas ocupam este mesmo lugar. */}
            <div className="mt-6 grid items-start gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8">
              <div
                key={estado.id}
                data-copy={estado.id}
                data-copy-ativo
                // Altura reservada: os parágrafos das etapas têm números de
                // linha diferentes, e sem piso a coluna encolhia entre estados
                // e empurrava o aparelho alguns pixels para cima.
                className="min-h-[6.5rem] animate-in fade-in slide-in-from-bottom-1 duration-300 sm:min-h-[9rem] lg:min-h-[15rem]"
              >
                <h3 className="text-xl leading-snug sm:text-2xl">
                  <span className="text-marca">{estado.resolucao ? "✓" : estado.passo + 1}.</span>{" "}
                  {estado.titulo}
                </h3>
                <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
                  {estado.texto}
                </p>
                <div className="mt-5 hidden max-w-sm lg:block">
                  <PecaDoEstado indice={ativo} />
                </div>
              </div>

              {/* O celular não muda de posição nem de tamanho entre estados.
                  A largura é conservadora de propósito: a 22rem o aparelho
                  tem 780px de altura e não cabe no palco junto do título e da
                  trilha, que são as referências que precisam ficar na tela. */}
              <div className="relative mx-auto lg:mx-0">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-x-10 -inset-y-6"
                  style={{
                    background:
                      "radial-gradient(58% 46% at 50% 46%, color-mix(in srgb, var(--appointment-red) 13%, transparent) 0%, transparent 72%)",
                  }}
                />
                <PhoneFrame
                  screen="fluxo"
                  className="relative w-[min(11.5rem,calc((100svh-var(--header-height)-24rem)*0.45))] sm:w-[min(13rem,calc((100svh-var(--header-height)-23.5rem)*0.45))] lg:w-[min(15.25rem,calc((100dvh-var(--header-height)-19rem)*0.45))] 2xl:w-[min(17.5rem,calc((100dvh-var(--header-height)-20rem)*0.45))]"
                >
                  <PalcoTelas ativo={ativo} />
                </PhoneFrame>
                {/* A legenda fica FORA da moldura, com altura reservada para
                    duas linhas. Dentro dela, uma legenda que quebrava em duas
                    linhas em alguns estados mudava a altura da figura e o
                    aparelho deslizava até 21px entre uma etapa e outra. */}
                <p className="relative mt-2 flex min-h-[2.25rem] items-start justify-center text-center text-xs leading-snug text-muted-foreground sm:mt-3 sm:min-h-[2.75rem] sm:text-sm">
                  {estado.legenda}
                </p>
              </div>
            </div>
          </div>

          {/* O curso: cada estado recebe a rolagem declarada em CURSO_VH. */}
          {ESTADOS.map((item, indice) => (
            <div key={item.id} aria-hidden="true" style={{ height: `${CURSO_VH[indice]}vh` }} />
          ))}
        </div>
      </section>
    </Capitulo>
  );
}
