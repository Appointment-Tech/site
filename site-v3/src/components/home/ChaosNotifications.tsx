import type React from "react";

import { cn } from "@/lib/utils";

/**
 * As interrupções que hoje disputam a agenda de quem atende.
 *
 * Cada cartão é uma coisa real do dia: a mensagem à noite, a ligação perdida,
 * o horário que já foi. São poucos e posicionados à mão, em profundidades
 * diferentes — a sensação buscada é de pressão controlada, não de caos: caos
 * aleatório vira poluição e o visitante para de ler.
 *
 * `data-depth` diz ao parallax a que velocidade cada cartão se move.
 */
/**
 * As posições evitam a coluna de texto do hero (à esquerda em telas grandes):
 * cartão sobre título não lê como interrupção, lê como defeito de layout.
 */
const INTERRUPCOES = [
  // `sempre` marca os que também aparecem no celular. Lá o espaço é curto: com
  // seis cartões eles saem da tela e ficam cortados, o que lê como bug e não
  // como interrupção. Três bastam para dar a sensação de pressão.
  {
    texto: "“Tem horário amanhã?”",
    hora: "23:41",
    tipo: "mensagem",
    x: "54%",
    y: "12%",
    mx: "38%",
    my: "9%",
    depth: 0.5,
    sempre: true,
  },
  {
    texto: "Chamada perdida",
    hora: "09:02",
    tipo: "ligacao",
    x: "78%",
    y: "22%",
    mx: "6%",
    my: "22%",
    depth: 0.9,
    sempre: false,
  },
  {
    texto: "“Preciso remarcar”",
    hora: "07:15",
    tipo: "mensagem",
    x: "84%",
    y: "58%",
    mx: "8%",
    my: "58%",
    depth: 0.35,
    sempre: false,
  },
  {
    texto: "Não compareceu",
    hora: "14:00",
    tipo: "falta",
    x: "58%",
    y: "74%",
    mx: "10%",
    my: "80%",
    depth: 0.75,
    sempre: true,
  },
  {
    texto: "“Quanto custa?”",
    hora: "22:08",
    tipo: "mensagem",
    x: "72%",
    y: "86%",
    mx: "30%",
    my: "90%",
    depth: 0.55,
    sempre: false,
  },
  {
    texto: "Horário já ocupado",
    hora: "16:30",
    tipo: "conflito",
    x: "62%",
    y: "44%",
    mx: "34%",
    my: "70%",
    depth: 1,
    sempre: true,
  },
] as const;

const ESTILO_POR_TIPO = {
  mensagem: "border-border bg-card",
  ligacao: "border-warning/30 bg-warning-soft",
  falta: "border-destructive/25 bg-destructive-soft",
  conflito: "border-primary/25 bg-primary-soft",
} as const;

export function ChaosNotifications({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {INTERRUPCOES.map((item) => (
        <article
          key={item.texto}
          data-chaos-card
          data-depth={item.depth}
          style={
            {
              "--pos-x": item.mx,
              "--pos-y": item.my,
              "--pos-x-sm": item.x,
              "--pos-y-sm": item.y,
            } as React.CSSProperties
          }
          className={cn(
            "absolute left-[var(--pos-x)] top-[var(--pos-y)]",
            "sm:left-[var(--pos-x-sm)] sm:top-[var(--pos-y-sm)]",
            "max-w-[12rem] rounded-[var(--radius-lg)] border px-3 py-2 sm:w-max sm:max-w-[15rem] sm:px-4 sm:py-3",
            "shadow-[var(--shadow-card)] backdrop-blur-[2px]",
            item.sempre ? "" : "hidden sm:block",
            ESTILO_POR_TIPO[item.tipo],
          )}
        >
          <p className="text-[0.8rem] font-medium leading-snug text-foreground">{item.texto}</p>
          <p className="mt-1 text-[0.68rem] tabular-nums text-muted-foreground">{item.hora}</p>
        </article>
      ))}
    </div>
  );
}
