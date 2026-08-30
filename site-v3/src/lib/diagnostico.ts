/**
 * Registro de diagnóstico das cenas por scroll.
 *
 * Existe para tornar VISÍVEL um defeito que só aparecia entre os percentuais
 * medidos: conferir a cena em 0, 25, 50, 75 e 100% não pega um indicador que
 * troca meio segundo antes do texto, porque o desencontro vive na transição,
 * não nos pontos estáveis.
 *
 * Fora do modo de depuração nada disto é lido — o custo é uma escrita em Map
 * por frame, sem render de React. O painel só é montado quando a URL pede.
 */

export type LeituraCena = {
  nome: string;
  /** Progresso cru do ScrollTrigger, 0 a 1. */
  progresso: number;
  /** Índice do estado ativo — a fonte única de texto, indicador e visual. */
  ativo: number;
  /** Progresso dentro do estado atual. */
  progressoNoEstado: number;
  /** 1 descendo, -1 subindo. */
  direcao: number;
};

const leituras = new Map<string, LeituraCena>();

export function registrarDiagnostico(nome: string, leitura: LeituraCena): void {
  leituras.set(nome, leitura);
}

export function removerDiagnostico(nome: string): void {
  leituras.delete(nome);
}

export function lerDiagnosticos(): LeituraCena[] {
  return [...leituras.values()];
}

/**
 * O painel é pedido pela URL (`?debugScroll=1`).
 *
 * Só pode ser consultado no cliente: no servidor não existe `location`, e
 * responder `true` lá produziria um painel no HTML entregue a todo mundo.
 */
export function diagnosticoPedido(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debugScroll") === "1";
}
