import type React from "react";
import { useRef } from "react";
import { Check, ArrowRight } from "lucide-react";

import { Capitulo, RotuloCapitulo } from "@/components/home/Capitulo";
import { useCenaSincronizada } from "@/lib/cena";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Capítulo 3 — profissionais diferentes, uma agenda só.
 *
 * O relógio do capítulo 1 vira uma agenda radial viva. A progressão conta uma
 * história com UM compromisso, não com seis: o horário está livre, alguém
 * escolhe, a marcação se consolida e depois é remarcada — e o horário
 * abandonado volta a circular.
 *
 * Antes a regra de pintura era `passo do item < passo atual → verde`, o que
 * deixava quase todos os seis cartões verdes já no terceiro estado. O verde
 * passou a ser a cor dominante do capítulo, competindo com a marca. Agora o
 * verde aparece só onde significa alguma coisa: o selo "Confirmado". Todo o
 * resto — seleção, ponteiro, arco, indicador — é o vermelho do Appointment.
 */
const COMPROMISSOS = [
  { hora: "08:00", angulo: -150, servico: "Academia", pessoa: "RT" },
  { hora: "10:30", angulo: -95, servico: "Consulta", pessoa: "MA" },
  { hora: "13:00", angulo: -40, servico: "Reunião", pessoa: "BS" },
  { hora: "15:30", angulo: 20, servico: "Salão", pessoa: "CF" },
  { hora: "17:00", angulo: 80, servico: "Personal", pessoa: "LM" },
  { hora: "19:00", angulo: 140, servico: "Pessoal", pessoa: "EP" },
] as const;

/** O compromisso que a narrativa acompanha, e para onde ele é remarcado. */
const FOCO = 1;
const DESTINO = 3;

const ESTADOS = [
  {
    id: "livres",
    rotulo: "Horários livres",
    texto: "A agenda publica o que está disponível de verdade — nada de “te confirmo depois”.",
  },
  {
    id: "escolhido",
    rotulo: "Escolhido",
    texto: "O cliente seleciona e o horário sai de circulação na hora, para todo mundo.",
  },
  {
    id: "confirmado",
    rotulo: "Confirmado",
    texto: "Os dois lados recebem o mesmo aviso, com o pagamento já registrado.",
  },
  {
    id: "remarcado",
    rotulo: "Remarcado",
    texto: "Mudou? O horário liberado volta a circular sozinho, e o novo já nasce confirmado.",
  },
] as const;

const BENEFICIOS = [
  "Appointments fáceis de consultar",
  "Marcação disponível 24 horas",
  "Remarcação e cancelamento simplificados",
  "Pagamentos no próprio app",
  "Informações centralizadas",
  "Menos conflitos de horário",
] as const;

/**
 * Rolagem por estado. Não é uniforme de propósito: "confirmado" e "remarcado"
 * carregam mais informação (selo, linha de transferência, horário liberado) e
 * com fatias iguais duravam menos de um segundo na leitura.
 */
const PESOS = [1, 1.15, 1.35, 1.5] as const;

type EstadoSlot = "livre" | "selecionado" | "confirmado" | "liberado";

function posicao(angulo: number) {
  const rad = ((angulo - 90) * Math.PI) / 180;
  return { esquerda: 50 + 41 * Math.cos(rad), topo: 50 + 41 * Math.sin(rad) };
}

/**
 * Posição do slot no celular: elipse mais estreita (rx 33) e, nos extremos
 * leste/oeste, a âncora do cartão desloca para dentro em vez de centrar —
 * centrado, metade do cartão saía da viewport de 390px.
 */
function posicaoMovel(angulo: number) {
  const rad = ((angulo - 90) * Math.PI) / 180;
  const cos = Math.cos(rad);
  // Oeste quase todo para fora (sem cortar a borda), leste quase todo para
  // dentro do próprio ponto: medido, é o que deixa os cartões do equador fora
  // do disco central E dentro da viewport de 360–390px.
  const tx = cos < -0.35 ? "-72%" : cos > 0.35 ? "-6%" : "-50%";
  return { esquerda: 50 + 33 * cos, topo: 50 + 41 * Math.sin(rad), tx };
}

export function UnifiedTimeline() {
  const secao = useRef<HTMLElement>(null);
  const estatico = useReducedMotion();

  // A cena precisa de curso próprio. Presa à altura natural do mostrador, os
  // quatro estados cabiam em 10% da página — os dois do meio duravam menos de
  // 2% cada e passavam antes de dar para ler. Agora o mostrador fica preso e o
  // curso é explícito, com a mesma fatia de rolagem para cada estado.
  const { ativo } = useCenaSincronizada({
    escopo: secao,
    curso: "[data-curso-agenda]",
    quantidade: ESTADOS.length,
    nome: "agenda",
    start: "top top",
    end: "bottom bottom",
    pesos: PESOS,
  });

  /**
   * Estado de cada slot. Um compromisso muda por vez — é o que torna cada
   * passo reconhecível à primeira vista.
   */
  const estadoDe = (indice: number): EstadoSlot => {
    if (indice === FOCO) {
      if (ativo === 1) return "selecionado";
      if (ativo === 2) return "confirmado";
      if (ativo === 3) return "liberado";
      return "livre";
    }
    if (indice === DESTINO && ativo === 3) return "confirmado";
    return "livre";
  };

  const de = posicao(COMPROMISSOS[FOCO]!.angulo);
  const para = posicao(COMPROMISSOS[DESTINO]!.angulo);

  return (
    <Capitulo compacto tom="claro">
      <section
        ref={secao}
        aria-labelledby="agenda-titulo"
        data-cena="agenda"
        data-estado={ESTADOS[ativo]!.id}
      >
        <div data-curso-agenda className="relative">
          <div
            className={cn(
              estatico
                ? ""
                : "sticky top-[var(--header-height)] z-10 flex min-h-[calc(100svh-var(--header-height))] flex-col justify-center py-5 lg:top-0 lg:min-h-[92svh] lg:py-8",
            )}
          >
            <RotuloCapitulo>Tudo no mesmo lugar</RotuloCapitulo>
            <h2 id="agenda-titulo" className="mt-4 max-w-3xl text-3xl sm:text-4xl">
              Profissionais diferentes. Uma agenda só.
            </h2>
            <p className="mt-3 max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground">
              O que hoje está espalhado em várias conversas passa a caber em uma única agenda.
            </p>

            <div className="mt-5 grid w-full gap-5 lg:mt-8 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-16">
              <div
                data-visual={ESTADOS[ativo]!.id}
                data-visual-ativo
                className="relative mx-auto aspect-square w-[17rem] sm:w-[23rem] 2xl:w-[26rem]"
              >
                <div
                  aria-hidden="true"
                  className="absolute -inset-[12%] rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, color-mix(in srgb, var(--appointment-red) 14%, transparent) 0%, transparent 68%)",
                  }}
                />
                <div className="absolute inset-0 rounded-full border border-marca/25 bg-card/70" />
                <div className="absolute inset-[9%] rounded-full border border-dashed border-border/70" />
                <div className="absolute inset-[26%] rounded-full bg-card shadow-[var(--shadow-card)]" />

                {/* Arco de progresso do dia, no vermelho da marca. Anda pela mesma
                variável CSS que governa o estado — não por um gatilho próprio,
                que era o que fazia ponteiro e rótulo andarem fora de fase. */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 100 100"
                  className="absolute inset-0 h-full w-full -rotate-90"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45.5"
                    pathLength={100}
                    fill="none"
                    stroke="var(--appointment-red)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="100"
                    style={{ strokeDashoffset: "calc(100 - var(--progresso, 0) * 100)" }}
                  />
                  {/* A linha da remarcação: o horário sai de um ponto e vai para
                  outro, e o traço é a própria transferência. */}
                  <path
                    d={`M ${de.esquerda} ${de.topo} Q 50 50 ${para.esquerda} ${para.topo}`}
                    fill="none"
                    stroke="var(--appointment-red)"
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                    className={cn(
                      "transition-opacity duration-300",
                      ativo === 3 ? "opacity-70" : "opacity-0",
                    )}
                  />
                </svg>

                {/* Ponteiro: mesma variável CSS, mesmo instante. */}
                {/* O invólucro com clip existe por causa da caixa girada: um
                    inset-0 rotacionado tem diagonal maior que o mostrador e,
                    em 360px, empurrava 10px de rolagem horizontal. O clip não
                    corta nada visível — o ponteiro vive dentro do círculo. */}
                <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
                  <div
                    className="absolute inset-0 origin-center"
                    style={{ transform: "rotate(calc(-150deg + var(--progresso, 0) * 300deg))" }}
                  >
                    <span className="absolute left-1/2 top-[3%] h-[9%] w-0.5 -translate-x-1/2 rounded-full bg-marca" />
                  </div>
                </div>

                {/* Miolo: o dia e o estado corrente. */}
                <div className="absolute inset-[26%] flex flex-col items-center justify-center rounded-full text-center">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Domingo
                  </p>
                  <p className="font-display text-3xl font-semibold tabular-nums text-foreground">
                    30 ago
                  </p>
                  <p
                    aria-live="polite"
                    className="mt-1 max-w-[9rem] text-[0.72rem] font-semibold leading-snug text-marca"
                  >
                    {ESTADOS[ativo]!.rotulo}
                  </p>
                </div>

                {COMPROMISSOS.map((item, indice) => {
                  const { esquerda, topo } = posicao(item.angulo);
                  const movel = posicaoMovel(item.angulo);
                  const estado = estadoDe(indice);
                  return (
                    <div
                      key={item.hora}
                      data-slot={estado}
                      className="absolute z-10 left-[var(--sl-m)] top-[var(--st-m)] sm:left-[var(--sl)] sm:top-[var(--st)]"
                      style={
                        {
                          "--sl": `${esquerda}%`,
                          "--st": `${topo}%`,
                          "--sl-m": `${movel.esquerda}%`,
                          "--st-m": `${movel.topo}%`,
                          "--tx-m": movel.tx,
                        } as React.CSSProperties
                      }
                    >
                      <div
                        className={cn(
                          "slot-radial flex items-center whitespace-nowrap",
                          "gap-1.5 rounded-[var(--radius-pill)] border py-1 pl-1 pr-2 transition-all duration-300 sm:gap-2 sm:py-1.5 sm:pl-1.5 sm:pr-3",
                          estado === "livre" && "border-border bg-card shadow-[var(--shadow-card)]",
                          estado === "selecionado" &&
                            "scale-105 border-marca bg-marca text-white shadow-[var(--shadow-lift)]",
                          estado === "confirmado" &&
                            "border-marca/40 bg-card shadow-[var(--shadow-lift)]",
                          // Liberado: contorno tracejado, sem preenchimento. Lê como
                          // vaga aberta, que é exatamente o que aconteceu.
                          estado === "liberado" && "border-dashed border-marca/50 bg-transparent",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full text-[0.55rem] font-bold transition-colors duration-300 sm:size-6 sm:text-[0.6rem]",
                            estado === "livre" && "bg-neutral-soft text-muted-foreground",
                            estado === "selecionado" && "bg-white/25 text-white",
                            estado === "confirmado" && "bg-marca-soft text-marca",
                            estado === "liberado" && "bg-transparent text-marca/60",
                          )}
                        >
                          {estado === "liberado" ? "—" : item.pessoa}
                        </span>
                        <span className="flex flex-col leading-tight">
                          <span
                            className={cn(
                              "text-[0.7rem] font-semibold tabular-nums",
                              estado === "selecionado" ? "text-white" : "text-foreground",
                              estado === "liberado" && "text-marca/70",
                            )}
                          >
                            {item.hora}
                          </span>
                          <span
                            className={cn(
                              "text-[0.65rem]",
                              estado === "selecionado" ? "text-white/80" : "text-muted-foreground",
                              // No celular o serviço aparece só onde a narrativa
                              // o usa; nos livres, a hora basta e o cartão cabe.
                              estado === "livre" && "hidden sm:block",
                            )}
                          >
                            {estado === "liberado" ? (
                              <>
                                <span className="sm:hidden">livre</span>
                                <span className="hidden sm:inline">livre de novo</span>
                              </>
                            ) : (
                              item.servico
                            )}
                          </span>
                        </span>
                        {/* O ÚNICO verde do capítulo, e ele significa uma coisa só. */}
                        {estado === "confirmado" ? (
                          <span className="ml-0.5 flex items-center gap-1 rounded-[var(--radius-pill)] bg-success-soft px-1.5 py-0.5 text-[0.58rem] font-bold text-success">
                            <Check aria-hidden="true" className="size-2.5" />
                            <span className="hidden sm:inline">Confirmado</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <ol className="flex flex-wrap gap-2" aria-hidden="true">
                  {ESTADOS.map((estado, indice) => (
                    <li
                      key={estado.id}
                      data-indicador={estado.id}
                      data-indicador-ativo={indice === ativo || undefined}
                      className={cn(
                        "flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 text-[0.72rem] font-semibold transition-colors duration-300",
                        indice === ativo
                          ? "bg-marca text-white"
                          : indice < ativo
                            ? "bg-marca-soft text-marca"
                            : "bg-neutral-soft text-muted-foreground",
                      )}
                    >
                      {estado.rotulo}
                      {indice === ativo && indice === 3 ? (
                        <ArrowRight aria-hidden="true" className="size-3" />
                      ) : null}
                    </li>
                  ))}
                </ol>
                <p
                  data-copy={ESTADOS[ativo]!.id}
                  data-copy-ativo
                  className="mt-4 min-h-[3.5rem] max-w-md text-[0.95rem] leading-relaxed text-foreground"
                >
                  {ESTADOS[ativo]!.texto}
                </p>

                <ul className="mt-8 hidden gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid">
                  {BENEFICIOS.map((beneficio) => (
                    <li key={beneficio} className="flex gap-3 text-[0.92rem] leading-relaxed">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-marca"
                      />
                      <span className="text-muted-foreground">{beneficio}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* O curso da cena: uma fatia igual de rolagem por estado. Com
              movimento reduzido não existe — a altura só serve para dirigir a
              animação, e sem animação seria altura vazia. */}
          {estatico
            ? null
            : ESTADOS.map((e) => <div key={e.id} aria-hidden="true" className="h-[62vh]" />)}
        </div>

        {/* Os benefícios, fora da cena presa — visíveis só onde saíram dela. */}
        <ul className="mt-10 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:hidden">
          {BENEFICIOS.map((beneficio) => (
            <li key={beneficio} className="flex gap-3 text-[0.92rem] leading-relaxed">
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-marca"
              />
              <span className="text-muted-foreground">{beneficio}</span>
            </li>
          ))}
        </ul>
      </section>
    </Capitulo>
  );
}
