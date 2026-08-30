/**
 * Os momentos da narrativa e o que a cena faz em cada um.
 *
 * A cena não é decoração abstrata: ela encena o produto. Cada partícula é um
 * **bloco de horário** — o objeto que o Appointment move. Os dois lados são a
 * disponibilidade que o profissional publicou e os horários que o cliente
 * procura; quando se encontram, o bloco vira um atendimento confirmado e
 * assume o verde que o app usa nesse status.
 *
 * Um momento é uma `<section data-beat="...">` (ver components/site/Beat.tsx).
 */
export type BeatName =
  | "distancia"
  | "aproximacao"
  | "colisao"
  | "confirmacao"
  | "dispersao";

export type BeatConfig = {
  /** Distância das duas colunas ao centro. 1 = extremos, 0 = encaixadas. */
  separation: number;
  /** 0 = blocos soltos no seu próprio ritmo; 1 = grade alinhada de agenda. */
  grid: number;
  /** Fração dos blocos que já viraram atendimento confirmado (verde). */
  confirmed: number;
  /** Abertura em três colunas — os três públicos — no fim da narrativa. */
  fan: number;
  /** Energia do movimento: velocidade da deriva e amplitude da oscilação. */
  energy: number;
  /** Opacidade geral da cena neste momento. */
  opacity: number;
};

/**
 * A cena reforça o texto, não compete com ele: onde a página pede leitura
 * (`aproximacao`, `confirmacao`) a opacidade cai. Ela sobe onde o argumento é
 * visual — a separação inicial e o encontro.
 */
export const BEATS: Record<BeatName, BeatConfig> = {
  // Duas colunas de horários, longe uma da outra. Nenhum encaixe ainda:
  // é a agenda de um lado e a procura do outro, sem se enxergarem.
  distancia: { separation: 1, grid: 0.15, confirmed: 0, fan: 0, energy: 0.5, opacity: 0.9 },

  // Se aproximam e começam a se alinhar por faixa de horário — mas ainda
  // desencontrados, que é exatamente a dor descrita nesta seção.
  aproximacao: { separation: 0.6, grid: 0.2, confirmed: 0, fan: 0, energy: 0.85, opacity: 0.9 },

  // O encontro: as colunas se fecham, os blocos encaixam par a par e a maioria
  // vira atendimento confirmado.
  colisao: { separation: 0.05, grid: 1, confirmed: 0.8, fan: 0, energy: 1, opacity: 1 },

  // Resolvido: a grade se assenta, o movimento se acalma, tudo confirmado.
  confirmacao: { separation: 0.06, grid: 1, confirmed: 1, fan: 0, energy: 0.22, opacity: 0.3 },

  // A agenda se abre em três colunas — profissionais, empresas e público.
  dispersao: { separation: 0.3, grid: 0.85, confirmed: 1, fan: 1, energy: 0.5, opacity: 0.55 },
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
    grid: lerp(from.grid, to.grid),
    confirmed: lerp(from.confirmed, to.confirmed),
    fan: lerp(from.fan, to.fan),
    energy: lerp(from.energy, to.energy),
    opacity: lerp(from.opacity, to.opacity),
  };
}
