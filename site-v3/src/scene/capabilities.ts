/**
 * Decide se a cena deve rodar, e com qual orçamento.
 *
 * A regra do projeto é dura: o site tem que ficar completo sem a cena. Ela é
 * enfeite, não requisito — mesmo princípio que já vale para a tela de
 * carregamento da v1. Então tudo aqui responde a uma pergunta só: "posso não
 * rodar?" Na dúvida, não roda.
 */

export type SceneBudget = {
  /** Partículas por corrente. */
  perStream: number;
  /** Teto de devicePixelRatio: acima disso o custo por frame não compensa. */
  maxPixelRatio: number;
};

/** Nunca fixo no código: um celular modesto não aguenta o mesmo que um desktop. */
const BUDGETS: Record<"low" | "medium" | "high", SceneBudget> = {
  low: { perStream: 120, maxPixelRatio: 1 },
  medium: { perStream: 320, maxPixelRatio: 1.5 },
  high: { perStream: 700, maxPixelRatio: 2 },
};

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * WebGL de verdade, não `!!window.WebGLRenderingContext`: existe navegador que
 * expõe o construtor e falha ao criar o contexto (GPU bloqueada, driver na
 * lista negra). O teste honesto é tentar criar.
 */
export function hasWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    if (!gl) return false;
    // Libera imediatamente: este canvas é só a sonda.
    const lose = (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Sinais grosseiros de máquina modesta. Nenhum deles sozinho decide. */
export function pickBudget(): SceneBudget {
  if (typeof navigator === "undefined") return BUDGETS.low;

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse =
    typeof window !== "undefined" &&
    window.matchMedia?.("(pointer: coarse)").matches === true;

  if (cores <= 4 || memory <= 4) return BUDGETS.low;
  if (coarse || cores <= 8) return BUDGETS.medium;
  return BUDGETS.high;
}

/**
 * A cena só roda quando há WebGL, o visitante não pediu menos movimento e a
 * aba está visível. Qualquer "não" aqui devolve uma página perfeitamente boa.
 */
export function shouldRunScene(): boolean {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion()) return false;
  return hasWebGL();
}
