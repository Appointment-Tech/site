import { useEffect, useRef } from "react";

/**
 * Trilho de progressão dos capítulos.
 *
 * Uma barra fina na borda esquerda que se preenche com o vermelho da marca
 * conforme a página avança, com uma marca por capítulo.
 *
 * Existe por uma razão de direção de arte: fora do capítulo de fundo cheio, o
 * vermelho aparecia só em botão e em detalhe pequeno — medido, 1 a 2% dos
 * pixels. O trilho dá presença CONSTANTE à marca sem pintar superfície, que é
 * o que manteria as áreas de descanso visual.
 *
 * O preenchimento anda por variável CSS: escrever uma custom property não
 * dispara render, então a barra acompanha o scroll a 60 fps sem custo de
 * React.
 */
const CAPITULOS = [
  "O tempo está correndo",
  "Quatro passos",
  "Uma agenda só",
  "Três perspectivas",
  "O ruído vira interface",
  "Seu tempo volta",
];

export function TrilhoCapitulos() {
  const trilho = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elemento = trilho.current;
    if (!elemento) return;

    let frame = 0;
    const medir = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const p = total > 0 ? window.scrollY / total : 0;
      elemento.style.setProperty("--pagina", p.toFixed(4));
      frame = 0;
    };
    const aoRolar = () => {
      if (!frame) frame = requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  return (
    <div
      ref={trilho}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-40 hidden h-full w-[3px] bg-marca/10 md:block"
    >
      <div
        className="w-full origin-top bg-marca"
        style={{ height: "100%", transform: "scaleY(var(--pagina, 0))" }}
      />
      {CAPITULOS.map((nome, i) => (
        <span
          key={nome}
          className="absolute left-0 h-[3px] w-[9px] rounded-r-full bg-marca/35"
          style={{ top: `${(i / (CAPITULOS.length - 1)) * 100}%` }}
        />
      ))}
    </div>
  );
}
