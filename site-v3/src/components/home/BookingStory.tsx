import { useRef, useState } from "react";
import { Check } from "lucide-react";

import { PhoneFrame } from "@/components/site/PhoneFrame";
import { telas } from "@/lib/telas";
import { useScrollScene } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Capítulo 2 — marcar não deveria ser complicado.
 *
 * Seção sticky: o celular fica preso enquanto os passos passam ao lado, e cada
 * passo troca a tela exibida. As telas são capturas do app real rodando com
 * dados fictícios (ver ADR 0003) — não uma interface inventada, que é o tipo
 * de coisa que promete o que o produto não faz.
 */
const PASSOS = [
  {
    id: "encontrar",
    titulo: "Encontre quem você precisa",
    texto:
      "Busque pela profissão, pelo serviço ou pelo nome. A disponibilidade que aparece é a que existe agora.",
    tela: "busca",
  },
  {
    id: "servico",
    titulo: "Escolha o serviço",
    texto: "Cada serviço leva seu valor e sua duração. Você sabe quanto custa antes de marcar.",
    tela: "perfil",
  },
  {
    id: "horario",
    titulo: "Escolha o horário",
    texto: "Os horários livres do dia estão no próprio cartão. Dois toques e o compromisso existe.",
    tela: "agenda",
  },
  {
    id: "confirmar",
    titulo: "Confirme e pague",
    texto: "Confirmação na hora para os dois lados, com cartão ou PIX pela ASAAS no mesmo passo.",
    tela: "confirmado",
  },
] as const;

export function BookingStory() {
  const secao = useRef<HTMLElement>(null);
  const [ativo, setAtivo] = useState(0);

  useScrollScene(secao, ({ gsap }) => {
    const passos = gsap.utils.toArray<HTMLElement>("[data-passo]");

    passos.forEach((passo, indice) => {
      // Um gatilho por passo, sem listener de scroll próprio: o ScrollTrigger
      // já agrupa a leitura de posição de todos eles num único ciclo.
      gsap.timeline({
        scrollTrigger: {
          trigger: passo,
          start: "top 62%",
          end: "bottom 62%",
          onEnter: () => setAtivo(indice),
          onEnterBack: () => setAtivo(indice),
        },
      });
    });

    gsap.from("[data-passo]", {
      y: 24,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      scrollTrigger: { trigger: secao.current, start: "top 70%" },
    });
  });

  const telaAtual = telas[PASSOS[ativo]!.tela];

  return (
    <section
      ref={secao}
      id="como-funciona"
      data-beat="aproximacao"
      aria-labelledby="passos-titulo"
      className="relative bg-background py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <span aria-hidden="true" className="inline-block h-px w-8 bg-primary" />
          Três passos, nenhuma ligação
        </p>
        <h2 id="passos-titulo" className="mt-5 max-w-2xl text-3xl sm:text-4xl">
          Marcar um Appointment é tão fácil quanto mandar uma mensagem.
        </h2>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-20">
          <ol className="space-y-24 lg:space-y-40">
            {PASSOS.map((passo, indice) => (
              <li
                key={passo.id}
                data-passo
                className={cn(
                  "transition-opacity duration-500",
                  indice === ativo ? "opacity-100" : "opacity-45",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
                      indice < ativo
                        ? "bg-success-soft text-success"
                        : indice === ativo
                          ? "bg-primary text-primary-foreground"
                          : "bg-neutral-soft text-muted-foreground",
                    )}
                  >
                    {indice < ativo ? <Check aria-hidden="true" className="size-4" /> : indice + 1}
                  </span>
                  <h3 className="text-xl">{passo.titulo}</h3>
                </div>
                <p className="mt-3 measure text-[0.95rem] leading-relaxed text-muted-foreground">
                  {passo.texto}
                </p>
              </li>
            ))}
          </ol>

          {/* Sticky só neste contêiner: prender a seção inteira empilharia um
              sticky sobre outro e trava o scroll no celular. */}
          <div className="hidden lg:sticky lg:top-24 lg:block">
            <PhoneFrame
              screen={PASSOS[ativo]!.tela}
              src={telaAtual.src}
              alt={telaAtual.alt}
              caption={PASSOS[ativo]!.titulo}
            />
          </div>
        </div>

        {/* Abaixo de lg o celular não fica preso: aparece uma vez, no fim. */}
        <div className="mt-16 lg:hidden">
          <PhoneFrame
            screen={PASSOS[ativo]!.tela}
            src={telaAtual.src}
            alt={telaAtual.alt}
            caption={PASSOS[ativo]!.titulo}
          />
        </div>
      </div>
    </section>
  );
}
