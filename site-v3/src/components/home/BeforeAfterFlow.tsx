import { useRef } from "react";
import { ArrowRight } from "lucide-react";

import { Capitulo, RotuloCapitulo } from "@/components/home/Capitulo";
import { ChipHorario, ChipServico, PecaRecurso, SeloStatus } from "@/components/home/pecas";
import { useScrollScene, useReducedMotion } from "@/lib/motion";

/**
 * Capítulo 5 — do problema à confirmação.
 *
 * Cada interrupção do hero reaparece aqui e se converte no componente do app
 * que a resolve. São as MESMAS mensagens do capítulo 1, propositalmente: o
 * visitante reconhece o ruído que viu no começo e o vê virar interface.
 *
 * A transformação é o elemento principal; a comparação textual é apoio.
 */
const CONVERSOES = [
  {
    ruido: "“Tem horário amanhã?”",
    hora: "23:41",
    virou: "Busca de disponibilidade",
    peca: (
      <div className="flex flex-wrap gap-2">
        <ChipHorario hora="09:00" />
        <ChipHorario hora="10:30" />
        <ChipHorario hora="14:00" />
      </div>
    ),
  },
  {
    ruido: "Chamada perdida",
    hora: "09:02",
    virou: "Confirmação automática",
    peca: <SeloStatus status="confirmado" />,
  },
  {
    ruido: "Horário já ocupado",
    hora: "16:30",
    virou: "Sugestão de outro horário",
    peca: (
      <div className="flex flex-wrap gap-2">
        {/* Ocupado, não confirmado: o 16:30 não é um sucesso, é uma vaga que
            não existe. Pintá-lo de verde invertia o sentido da cena. */}
        <ChipHorario hora="16:30" estado="ocupado" />
        <ChipHorario hora="17:00" estado="selecionado" />
      </div>
    ),
  },
  {
    ruido: "“Preciso remarcar”",
    hora: "07:15",
    virou: "Remarcação dentro do app",
    peca: <PecaRecurso tipo="remarcacao">Horário liberado volta a circular</PecaRecurso>,
  },
  {
    ruido: "Não compareceu",
    hora: "14:00",
    virou: "Lembrete e regra de cancelamento",
    peca: <PecaRecurso tipo="lembrete">Aviso antes da hora</PecaRecurso>,
  },
  {
    ruido: "“Quanto custa?”",
    hora: "22:08",
    virou: "Serviço com preço e pagamento",
    peca: <ChipServico nome="Consulta de avaliação" valor="R$ 180,00" ativo />,
  },
] as const;

export function BeforeAfterFlow() {
  const secao = useRef<HTMLElement>(null);
  const estatico = useReducedMotion();

  useScrollScene(secao, ({ gsap }) => {
    gsap.utils.toArray<HTMLElement>("[data-conversao]").forEach((linha) => {
      gsap
        .timeline({
          scrollTrigger: { trigger: linha, start: "top 82%", end: "top 45%", scrub: 0.5 },
        })
        // O ruído recua e perde força; o componente do app entra no lugar.
        .to(linha.querySelector("[data-ruido]"), { xPercent: 10, opacity: 0.94, ease: "none" }, 0)
        .fromTo(
          linha.querySelector("[data-virou]"),
          { xPercent: -6, opacity: 0 },
          { xPercent: 0, opacity: 1, ease: "none" },
          0,
        )
        .fromTo(
          linha.querySelector("[data-seta]"),
          { scaleX: 0.2, opacity: 0.2 },
          { scaleX: 1, opacity: 1, ease: "none" },
          0,
        );
    });
  });

  return (
    /*
     * O único capítulo de fundo cheio da página.
     *
     * A home era branca de ponta a ponta depois do hero, e o vermelho da marca
     * só aparecia em botão. Aqui ele vira o ambiente: fundo escuro derivado do
     * --gradient-brand, texto branco, e as peças do app entrando como
     * superfícies claras — a interface literalmente acendendo sobre o ruído.
     * Um pico só; repetido, deixaria de ser pico.
     */
    <Capitulo tom="brasa">
      <section ref={secao} aria-labelledby="conversao-titulo">
        <RotuloCapitulo invertido>Do problema à confirmação</RotuloCapitulo>
        <h2 id="conversao-titulo" className="mt-5 max-w-3xl text-3xl text-white sm:text-4xl">
          O ruído do começo vira interface.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
          As mesmas interrupções que abriram esta página, agora resolvidas dentro do app.
        </p>

        <ul className="mt-14 space-y-4">
          {CONVERSOES.map((item) => (
            <li
              key={item.ruido}
              data-conversao
              className="grid items-center gap-4 rounded-[var(--radius-xl)] border border-white/20 bg-white/10 p-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)] sm:gap-6 sm:p-5"
            >
              {/* O ruído: o mesmo cartão do hero. */}
              <div
                data-ruido
                className="rounded-[var(--radius-lg)] border border-white/30 bg-white/14 px-4 py-3"
                style={estatico ? { opacity: 0.94 } : undefined}
              >
                <p className="text-[0.88rem] font-medium text-white">{item.ruido}</p>
                <p className="mt-0.5 text-[0.76rem] tabular-nums text-white">{item.hora}</p>
              </div>

              <ArrowRight
                data-seta
                aria-hidden="true"
                className="hidden size-5 origin-left text-white sm:block"
              />

              {/* O que ele virou: componente real do produto. */}
              <div data-virou className="min-w-0">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/80">
                  {item.virou}
                </p>
                <div className="mt-2">{item.peca}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Capitulo>
  );
}
