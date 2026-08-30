/**
 * Atlas de horários: um canvas com os rótulos de hora desenhados em coluna,
 * usado como textura dos blocos da cena.
 *
 * Por que rótulo de verdade, e não uma forma abstrata: o site é sobre horário.
 * Um bloco que diz "09:00" nomeia o que está sendo movido; um retângulo sem
 * texto poderia estar em qualquer página de qualquer produto.
 *
 * O atlas é gerado em runtime em vez de vir como imagem: são poucos kB de
 * canvas contra um PNG a mais na primeira tela, e assim os rótulos acompanham
 * a fonte e a cor que o CSS já define.
 */

/** As faixas que uma agenda de atendimento realmente tem. */
export const SLOT_LABELS = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30",
  "13:30", "14:00", "14:30", "15:00",
  "16:00", "16:30", "17:00", "18:00",
] as const;

export type SlotAtlas = {
  canvas: HTMLCanvasElement;
  /** Quantas linhas o atlas tem — cada bloco escolhe uma pelo seu índice. */
  rows: number;
  cellWidth: number;
  cellHeight: number;
};

/**
 * Desenha os rótulos empilhados numa única coluna. Cada bloco da cena recorta
 * uma linha via offset de UV, então uma textura serve todas as instâncias.
 */
export function buildSlotAtlas(color: string): SlotAtlas {
  const cellWidth = 256;
  const cellHeight = 128;
  const rows = SLOT_LABELS.length;

  const canvas = document.createElement("canvas");
  canvas.width = cellWidth;
  canvas.height = cellHeight * rows;

  const ctx = canvas.getContext("2d");
  if (!ctx) return { canvas, rows, cellWidth, cellHeight };

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  // A mesma família do site; se não tiver carregado ainda, o fallback do
  // sistema desenha igual de legível neste tamanho.
  ctx.font = `600 ${Math.round(cellHeight * 0.42)}px Manrope, ui-sans-serif, system-ui, sans-serif`;

  SLOT_LABELS.forEach((label, index) => {
    ctx.fillText(label, cellWidth / 2, cellHeight * index + cellHeight / 2);
  });

  return { canvas, rows, cellWidth, cellHeight };
}
