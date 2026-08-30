import { useEffect, useState } from "react";

import { diagnosticoPedido, lerDiagnosticos, type LeituraCena } from "@/lib/diagnostico";

/**
 * Sobreposição de conferência das cenas, ligada por `?debugScroll=1`.
 *
 * Mostra, por cena, o progresso cru e o estado que texto, indicador e visual
 * estão usando. Como os quatro saem da mesma fonte (ver `lib/cena.ts`), uma
 * divergência aqui é prova de regressão na arquitetura de sincronia.
 *
 * Nunca aparece para o visitante comum: a decisão é tomada num efeito, depois
 * da hidratação, então o HTML servido a todos sai sem o painel.
 */
export function PainelDiagnostico() {
  const [ligado, setLigado] = useState(false);
  const [linhas, setLinhas] = useState<LeituraCena[]>([]);

  useEffect(() => {
    if (!diagnosticoPedido()) return;
    setLigado(true);

    let frame = 0;
    const ler = () => {
      setLinhas(lerDiagnosticos());
      frame = requestAnimationFrame(ler);
    };
    frame = requestAnimationFrame(ler);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!ligado) return null;

  return (
    <aside
      data-painel-diagnostico
      className="pointer-events-none fixed bottom-3 left-3 z-[90] max-w-[22rem] rounded-lg bg-black/85 p-3 font-mono text-[10px] leading-tight text-white shadow-lg"
    >
      <p className="mb-1.5 font-bold uppercase tracking-wider text-white/60">
        debugScroll · página {Math.round(porcentagemDaPagina())}%
      </p>
      {linhas.length === 0 ? (
        <p className="text-white/50">nenhuma cena registrada</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-white/50">
              <th className="pr-2 text-left font-normal">cena</th>
              <th className="pr-2 text-right font-normal">bruto</th>
              <th className="pr-2 text-right font-normal">local</th>
              <th className="pr-2 text-right font-normal">estado</th>
              <th className="text-right font-normal">dir</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.nome} data-cena={l.nome}>
                <td className="pr-2">{l.nome}</td>
                <td className="pr-2 text-right tabular-nums">{l.progresso.toFixed(3)}</td>
                <td className="pr-2 text-right tabular-nums">{l.progressoNoEstado.toFixed(2)}</td>
                {/* Um número só para os quatro papéis: se estado, cópia,
                    visual e indicador divergirem, é bug de arquitetura. */}
                <td className="pr-2 text-right font-bold text-[#ff6b8a]">
                  {l.ativo} <span className="font-normal text-white/40">= txt = vis = ind</span>
                </td>
                <td className="text-right">{l.direcao > 0 ? "↓" : l.direcao < 0 ? "↑" : "·"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </aside>
  );
}

function porcentagemDaPagina(): number {
  if (typeof window === "undefined") return 0;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  return total > 0 ? (window.scrollY / total) * 100 : 0;
}
