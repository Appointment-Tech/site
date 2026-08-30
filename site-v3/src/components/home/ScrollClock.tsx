import { forwardRef } from "react";

import { cn } from "@/lib/utils";

/**
 * O relógio da narrativa.
 *
 * Não é um relógio corporativo genérico nem um enfeite: é o fio que atravessa
 * a página. Os ponteiros respondem ao scroll, o miolo se abre para receber os
 * compromissos e, no fim, o conjunto se assenta.
 *
 * Feito em SVG por três razões: fica nítido em qualquer densidade de tela,
 * cada parte é um nó que o GSAP anima por `transform` (sem custo de layout), e
 * não exige WebGL — quem não puder animar continua vendo um relógio desenhado.
 *
 * As partes recebem `data-clock-*` para a timeline encontrá-las sem depender de
 * classes de estilo, que mudam por motivos de design.
 */
export const ScrollClock = forwardRef<SVGSVGElement, { className?: string }>(function ScrollClock(
  { className },
  ref,
) {
  // 60 marcações: as de hora são mais longas e opacas que as de minuto.
  const marcacoes = Array.from({ length: 60 }, (_, i) => {
    const hora = i % 5 === 0;
    const angulo = (i * 360) / 60;
    return { i, hora, angulo };
  });

  return (
    <svg
      ref={ref}
      viewBox="0 0 400 400"
      aria-hidden="true"
      focusable="false"
      className={cn("h-full w-full", className)}
    >
      <defs>
        {/* Luz suave vinda de cima: dá profundidade sem depender de blur,
              que é caro para animar. */}
        <radialGradient id="clock-luz" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="var(--color-card)" stopOpacity="0.95" />
          <stop offset="70%" stopColor="var(--color-surface)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-surface)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="clock-marca" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Camada de fundo: o disco iluminado. */}
      <circle data-clock-disco cx="200" cy="200" r="176" fill="url(#clock-luz)" />

      {/* Aros concêntricos — a "profundidade" vem daqui, não de sombras. */}
      <circle
        data-clock-aro-externo
        cx="200"
        cy="200"
        r="176"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="1"
      />
      <circle
        data-clock-aro-medio
        cx="200"
        cy="200"
        r="140"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="1"
        strokeDasharray="2 6"
        opacity="0.8"
      />

      {/* Arco de progresso: preenche conforme a página avança. */}
      <circle
        data-clock-progresso
        cx="200"
        cy="200"
        r="158"
        fill="none"
        stroke="url(#clock-marca)"
        strokeWidth="3.5"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1}
        transform="rotate(-90 200 200)"
      />

      <g data-clock-marcacoes>
        {marcacoes.map(({ i, hora, angulo }) => (
          <line
            key={i}
            x1="200"
            y1={hora ? 36 : 42}
            x2="200"
            y2={hora ? 52 : 48}
            stroke={hora ? "var(--appointment-red)" : "var(--color-foreground)"}
            strokeWidth={hora ? 2.5 : 1}
            strokeLinecap="round"
            opacity={hora ? 0.55 : 0.18}
            transform={`rotate(${angulo} 200 200)`}
          />
        ))}
      </g>

      {/* Ponteiros: a origem fica no centro para o GSAP girar por rotate. */}
      <g data-clock-ponteiro-hora style={{ transformOrigin: "200px 200px" }}>
        <line
          x1="200"
          y1="200"
          x2="200"
          y2="112"
          stroke="var(--appointment-red-dark)"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.85"
        />
      </g>
      <g data-clock-ponteiro-minuto style={{ transformOrigin: "200px 200px" }}>
        <line
          x1="200"
          y1="200"
          x2="200"
          y2="70"
          stroke="var(--color-foreground)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.45"
        />
      </g>
      <g data-clock-ponteiro-segundo style={{ transformOrigin: "200px 200px" }}>
        <line
          x1="200"
          y1="216"
          x2="200"
          y2="56"
          stroke="var(--appointment-red)"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>

      {/* Miolo: cresce e vira o halo do capítulo final. */}
      <circle data-clock-miolo cx="200" cy="200" r="9" fill="var(--color-primary)" />
      <circle
        data-clock-halo
        cx="200"
        cy="200"
        r="9"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1"
        opacity="0"
      />
    </svg>
  );
});
