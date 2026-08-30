/**
 * Os momentos da narrativa e o que a cena faz em cada um.
 *
 * Um momento é uma `<section data-beat="...">` (ver components/site/Beat.tsx).
 * A cena é única e persistente: trocar de página não a remonta, só reconfigura
 * as correntes e move a câmera. Ver ADR 0002.
 */
export type BeatName =
  | "distancia"
  | "aproximacao"
  | "colisao"
  | "confirmacao"
  | "dispersao";

export type BeatConfig = {
  /** Distância das duas correntes ao centro. 1 = extremos, 0 = colididas. */
  separation: number;
  /** Quanto as partículas convergem para a linha do centro (0..1). */
  focus: number;
  /** Energia do movimento — vira velocidade e amplitude do ruído. */
  energy: number;
  /** Opacidade geral da cena neste momento. */
  opacity: number;
};

/**
 * A cena existe para reforçar o texto, não para competir com ele: nos momentos
 * em que a página pede leitura (`aproximacao`, `confirmacao`), a opacidade cai.
 * Ela sobe onde o argumento é visual — a separação inicial e o encontro.
 */
export const BEATS: Record<BeatName, BeatConfig> = {
  // Os dois lados existem, longe um do outro, cada um no seu ritmo.
  distancia: { separation: 1, focus: 0.05, energy: 0.5, opacity: 0.85 },
  // Começam a se aproximar, mas ainda sem se ver. Texto manda aqui.
  aproximacao: { separation: 0.62, focus: 0.25, energy: 0.7, opacity: 0.35 },
  // O encontro: as correntes colidem e se cristalizam no centro.
  colisao: { separation: 0.04, focus: 1, energy: 1, opacity: 0.9 },
  // Resolvido: o movimento se acalma, o que sobrou é ordem.
  confirmacao: { separation: 0.18, focus: 0.8, energy: 0.28, opacity: 0.3 },
  // Os caminhos se abrem de novo, agora com os dois lados já ligados.
  dispersao: { separation: 0.75, focus: 0.4, energy: 0.55, opacity: 0.5 },
};

export const DEFAULT_BEAT: BeatName = "distancia";

export function isBeatName(value: string): value is BeatName {
  return value in BEATS;
}

/** Interpola entre dois momentos — usado enquanto o scroll está no meio. */
export function mixBeats(from: BeatConfig, to: BeatConfig, t: number): BeatConfig {
  const lerp = (a: number, b: number) => a + (b - a) * t;
  return {
    separation: lerp(from.separation, to.separation),
    focus: lerp(from.focus, to.focus),
    energy: lerp(from.energy, to.energy),
    opacity: lerp(from.opacity, to.opacity),
  };
}
