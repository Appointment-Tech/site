import type { ReactNode } from "react";
import { Bell, CalendarCheck, CreditCard, Search, Clock, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Peças de interface do Appointment, reconstruídas a partir das telas reais.
 *
 * São os mesmos elementos que aparecem nas capturas do app (cartão de
 * horário, chip de serviço, linha de agenda, aviso de status) redesenhados em
 * HTML para poderem ser animados. Nada aqui inventa funcionalidade: cada peça
 * corresponde a algo que existe no produto e que já se vê nos screenshots.
 */

/** Cartão de horário, como aparece na busca e na agenda do app. */
export function ChipHorario({
  hora,
  estado = "livre",
  className,
}: {
  hora: string;
  estado?: "livre" | "selecionado" | "confirmado" | "ocupado";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] px-2.5 py-1 text-[0.78rem] font-semibold tabular-nums transition-colors duration-300",
        estado === "livre" && "bg-neutral-soft text-foreground",
        estado === "selecionado" && "bg-primary text-primary-foreground",
        estado === "confirmado" && "bg-success-soft text-success",
        // Ocupado não é sucesso — é ausência de vaga. Riscado e apagado.
        estado === "ocupado" && "bg-neutral-soft text-muted-foreground line-through opacity-70",
        className,
      )}
    >
      {hora}
    </span>
  );
}

/** Selo de status: a mesma semântica de cor que o app usa. */
export function SeloStatus({
  status,
  className,
}: {
  status: "confirmado" | "reservado" | "pendente";
  className?: string;
}) {
  const rotulo = { confirmado: "Confirmado", reservado: "Reservado", pendente: "Pendente" }[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-[0.7rem] font-semibold",
        status === "confirmado" && "bg-success-soft text-success",
        status === "reservado" && "bg-info-soft text-info",
        status === "pendente" && "bg-warning-soft text-warning",
        className,
      )}
    >
      <CalendarCheck aria-hidden="true" className="size-3.5" />
      {rotulo}
    </span>
  );
}

/** Linha de atendimento, como no cartão da agenda do dia. */
export function LinhaAgenda({
  hora,
  titulo,
  pessoa,
  iniciais,
  status,
  duracao,
  className,
}: {
  hora: string;
  titulo: string;
  pessoa: string;
  iniciais: string;
  status: "confirmado" | "reservado" | "pendente";
  duracao: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[0.9rem] font-semibold text-foreground">{titulo}</p>
          <p className="truncate text-[0.8rem] text-muted-foreground">{pessoa}</p>
        </div>
        <SeloStatus status={status} />
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-marca-soft text-[0.7rem] font-bold text-marca">
          {iniciais}
        </span>
        <p className="text-[0.85rem] font-semibold tabular-nums text-foreground">
          {hora} <span className="font-normal text-muted-foreground">· {duracao}</span>
        </p>
      </div>
    </article>
  );
}

/** Chip de serviço com valor, como no perfil do profissional. */
export function ChipServico({
  nome,
  valor,
  ativo = false,
  className,
}: {
  nome: string;
  valor: string;
  ativo?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center justify-between gap-4 rounded-[var(--radius-md)] border px-3 py-2 text-[0.85rem] transition-colors duration-300",
        ativo ? "border-primary bg-primary-soft" : "border-border bg-card",
        className,
      )}
    >
      <span className={cn("font-medium", ativo ? "text-primary" : "text-foreground")}>{nome}</span>
      <span className="tabular-nums text-muted-foreground">{valor}</span>
    </span>
  );
}

const ICONES = {
  busca: Search,
  lembrete: Bell,
  pagamento: CreditCard,
  horario: Clock,
  remarcacao: RefreshCw,
  confirmacao: CalendarCheck,
} as const;

/** Peça pequena que nomeia um recurso do app, com o ícone correspondente. */
export function PecaRecurso({
  tipo,
  children,
  className,
}: {
  tipo: keyof typeof ICONES;
  children: ReactNode;
  className?: string;
}) {
  const Icone = ICONES[tipo];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-card px-3 py-2 text-[0.85rem] font-medium text-foreground",
        className,
      )}
    >
      <Icone aria-hidden="true" className="size-4 shrink-0 text-marca" />
      {children}
    </span>
  );
}
