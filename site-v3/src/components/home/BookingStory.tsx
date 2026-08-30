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
const PESOS = [1, 1.25, 1.2, 1.5, 1.35] as const;

/** Escolha de horário, composta com as peças reais do app. */
function TelaDisponibilidade() {
  return (
    <div className="flex h-full flex-col bg-card px-4 pb-4 pt-6 text-left">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Consulta de avaliação
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-[0.78rem] font-semibold text-foreground">
        <CalendarDays aria-hidden="true" className="size-3.5 text-marca" />
        Domingo, 30 de agosto
      </p>

      <p className="mt-5 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Horários livres
      </p>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <ChipHorario hora="09:00" estado="selecionado" />
        <ChipHorario hora="10:30" />
        <ChipHorario hora="14:00" />
        <ChipHorario hora="15:30" />
        <ChipHorario hora="16:30" />
        <ChipHorario hora="17:00" />
      </div>

      <div className="mt-auto rounded-[var(--radius-md)] border border-marca/30 bg-marca-soft p-3">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-marca">
          Selecionado
        </p>
        <p className="mt-1 text-[0.82rem] font-semibold tabular-nums text-foreground">
          09:00 · 50 min
        </p>
      </div>
    </div>
  );
}

/** Conferência antes de confirmar — ainda NÃO é um Appointment confirmado. */
function TelaConferencia() {
  return (
    <div className="flex h-full flex-col bg-card px-4 pb-4 pt-6 text-left">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Confira antes de confirmar
      </p>
      <div className="mt-3 space-y-2 rounded-[var(--radius-md)] border border-border p-3">
        <Linha rotulo="Serviço" valor="Consulta de avaliação" />
        <Linha rotulo="Profissional" valor="Helena Vasconcelos" />
        <Linha rotulo="Quando" valor="30/08, 09:00" />
        <Linha rotulo="Duração" valor="50 min" />
      </div>

      <div className="mt-3 rounded-[var(--radius-md)] border border-border p-3">
        <p className="flex items-center justify-between text-[0.72rem] text-muted-foreground">
          Valor
          <span className="text-[0.95rem] font-semibold tabular-nums text-foreground">
            R$ 180,00
          </span>
        </p>
        <p className="mt-2 flex items-center gap-1.5 border-t border-border pt-2 text-[0.7rem] text-muted-foreground">
          <CreditCard aria-hidden="true" className="size-3.5 text-marca" />
          Pagamento disponível neste serviço: cartão ou PIX
        </p>
      </div>

      <p className="mt-3 rounded-[var(--radius-md)] bg-neutral-soft p-3 text-[0.68rem] leading-snug text-muted-foreground">
        Cancelamento e reagendamento sem multa, conforme a regra da profissional.
      </p>

      <div className="mt-auto rounded-[var(--radius-pill)] bg-marca py-2.5 text-center text-[0.8rem] font-semibold text-white">
        Confirmar Appointment
      </div>
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <p className="flex items-baseline justify-between gap-3 text-[0.72rem]">
      <span className="text-muted-foreground">{rotulo}</span>
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
            "absolute inset-0 h-full w-full object-contain transition-opacity duration-300",
            ativo === indice ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      <div
        data-visual="agende"
        data-visual-ativo={ativo === 2 || undefined}
        aria-hidden={ativo !== 2}
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
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
          "absolute inset-0 transition-opacity duration-300",
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
    start: "top 85%",
    end: "bottom bottom",
    pesos: PESOS,
  });

  const estado = ESTADOS[ativo]!;

  return (
    <Capitulo id="como-funciona" tom="quente" className="scroll-mt-20">
      {/* Os `data-*` abaixo não são enfeite: são o contrato de sincronia
          desta cena, e é por eles que a conferência automatizada prova que
          estado, texto, visual e indicador apontam para a mesma coisa. */}
      <section
        ref={secao}
        aria-labelledby="passos-titulo"
        data-cena="passos"
        data-estado={estado.id}
        data-passo-ativo={estado.passo}
      >
        <RotuloCapitulo>Quatro passos, nenhuma ligação</RotuloCapitulo>
        <h2 id="passos-titulo" className="mt-5 max-w-3xl text-3xl sm:text-4xl">
          Marcar um Appointment é tão fácil quanto mandar uma mensagem.
        </h2>

        {/* Trilho de progresso. O vermelho marca onde o visitante está; o
            cinza, o que ainda vem. O verde fica para o selo do fim. */}
        <ol className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-3" aria-hidden="true">
          {PASSOS.map((verbo, indice) => {
            const cumprido = indice < estado.passo || Boolean(estado.resolucao);
            const corrente = indice === estado.passo && !estado.resolucao;
            return (
              <li key={verbo} className="flex items-center gap-2">
                <span
                  data-indicador={verbo}
                  data-indicador-ativo={indice === estado.passo || undefined}
                  className={cn(
                    "inline-flex h-7 items-center gap-2 rounded-[var(--radius-pill)] px-3 text-[0.75rem] font-semibold transition-colors duration-300",
                    cumprido && "bg-marca-soft text-marca",
                    corrente && "bg-marca text-white",
                    !cumprido && !corrente && "bg-neutral-soft text-muted-foreground",
                  )}
                >
                  {cumprido ? <Check className="size-3.5" /> : <span>{indice + 1}</span>}
                  <span>{verbo}</span>
                </span>
                {indice < PASSOS.length - 1 ? (
                  <span
                    className={cn(
                      "h-px w-6 transition-colors duration-300 sm:w-10",
                      indice < estado.passo || estado.resolucao ? "bg-marca/50" : "bg-border",
                    )}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-16">
          <ol data-curso-etapas className={cn("space-y-14", estatico ? "" : "lg:space-y-[30vh]")}>
            {ESTADOS.map((item, indice) => (
              <li
                key={item.id}
                data-copy={item.id}
                data-copy-ativo={indice === ativo || undefined}
                className={cn(
                  // O apagamento é só de `lg` para cima. Abaixo disso o celular
                  // não é sticky, o curso da cena é curto e cada etapa durava
                  // cerca de 120px de rolagem — apagar texto ali é esconder
                  // conteúdo que ninguém tem tempo de ler.
                  "transition-opacity duration-300",
                  estatico || indice === ativo ? "opacity-100" : "opacity-100 lg:opacity-35",
                )}
              >
                <h3 className="text-xl sm:text-2xl">
                  <span className="text-marca">{item.resolucao ? "✓" : item.passo + 1}.</span>{" "}
                  {item.titulo}
                </h3>
                <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
                  {item.texto}
                </p>
                <div className="mt-6 max-w-sm">
                  <PecaDoEstado indice={indice} />
                </div>
              </li>
            ))}
          </ol>

          <div
            className={cn(
              "relative hidden lg:block",
              estatico ? "" : "lg:sticky lg:top-[max(6rem,calc(50vh-19rem))]",
            )}
          >
            {/* Halo da marca concentrado atrás do aparelho. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-10 -inset-y-8"
              style={{
                background:
                  "radial-gradient(58% 46% at 50% 46%, color-mix(in srgb, var(--appointment-red) 13%, transparent) 0%, transparent 72%)",
              }}
            />
            <PhoneFrame
              screen="fluxo"
              caption={estado.legenda}
              className="relative lg:max-w-[22rem]"
            >
              <PalcoTelas ativo={ativo} />
            </PhoneFrame>
          </div>
        </div>

        {/* Abaixo de lg o aparelho aparece uma vez, no fim do fluxo. */}
        <div className="mt-12 lg:hidden">
          <PhoneFrame screen="fluxo-compacto" caption={ESTADOS[4]!.legenda}>
            <PalcoTelas ativo={4} />
          </PhoneFrame>
        </div>
      </section>
    </Capitulo>
  );
}
