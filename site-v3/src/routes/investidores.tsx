import { createFileRoute } from "@tanstack/react-router";
import { Beat, BeatLabel } from "@/components/site/Beat";
import { PhoneFrame } from "@/components/site/PhoneFrame";
import { Button } from "@/components/ui/button";
import { telas } from "@/lib/telas";
import { Card, SectionHeading, Stat } from "@/components/site/blocks";

export const Route = createFileRoute("/investidores")({
  head: () => ({
    meta: [
      { title: "Investidores — Appointment" },
      {
        name: "description",
        content:
          "O Appointment une agendamento e pagamento num fluxo só, para profissionais autônomos, empresas de múltiplas agendas e clientes finais. Fale com a gente.",
      },
      { property: "og:title", content: "Investidores — Appointment" },
      {
        property: "og:description",
        content:
          "Agendamento e pagamento no mesmo fluxo, para três públicos que hoje se resolvem por mensagem.",
      },
    ],
  }),
  component: Investidores,
});

/**
 * Não há números de tração aqui de propósito: o produto ainda não está aberto
 * ao público, e inventar métrica em página de investidor é o tipo de coisa que
 * cobra caro depois. O que a página faz é enquadrar o problema e abrir conversa.
 */
function Investidores() {
  return (
    <>
      <Beat beat="distancia" tone="brand" size="lg">
        <BeatLabel invert>Investidores</BeatLabel>
        <h1 className="max-w-3xl text-4xl leading-[1.05] text-primary-foreground sm:text-6xl">
          O horário é o produto. Hoje ele se resolve por mensagem.
        </h1>
        <p className="mt-6 measure text-lg leading-relaxed text-white/85">
          Agendamento e pagamento ainda vivem em ferramentas separadas — e a conta desse
          descasamento é paga em no-show, vacância e tempo administrativo.
        </p>
        <Button variant="onBrand" size="pill" className="mt-9" asChild>
          <a href="mailto:contato@marcaumappointment.com?subject=Investidores%20%E2%80%94%20Appointment">
            Falar com a gente
          </a>
        </Button>
      </Beat>

      <Beat beat="aproximacao">
        <BeatLabel>O problema</BeatLabel>
        <SectionHeading
          title="Duas pontas, nenhuma ferramenta comum."
          lead="Quem atende administra a agenda à mão. Quem marca depende de alguém acordado do outro lado."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <Stat
            value="3 públicos"
            label="Profissional autônomo, empresa com várias agendas e cliente final"
          />
          <Stat
            value="2 sistemas"
            label="Agenda num lugar, cobrança em outro — conciliação manual no fim do mês"
          />
          <Stat value="1 fluxo" label="A tese: marcar, confirmar e pagar no mesmo passo" />
        </div>
      </Beat>

      <Beat beat="colisao" tone="surface" size="lg">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <BeatLabel>O produto</BeatLabel>
            <SectionHeading
              title="Um app, os dois lados, o pagamento junto."
              lead="A disponibilidade publicada pelo profissional é a mesma que o cliente vê, e o pagamento acontece no ato do agendamento."
            />
            <ul className="mt-8 space-y-4">
              {[
                ["Multiagenda", "Do autônomo à operação com várias unidades, no mesmo modelo."],
                [
                  "Pagamento integrado",
                  "Cartão e PIX via ASAAS, ligados ao atendimento que os gerou.",
                ],
                [
                  "App em produção",
                  "Flutter, publicado internamente; abertura ao público por levas de convite.",
                ],
              ].map(([title, text]) => (
                <li key={title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
                  />
                  <p className="text-[0.95rem] leading-relaxed">
                    <strong className="font-semibold">{title}.</strong>{" "}
                    <span className="text-muted-foreground">{text}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <PhoneFrame
            screen="agenda"
            src={telas.agenda.src}
            alt={telas.agenda.alt}
            caption="O app em funcionamento: agenda do dia com confirmação e status."
          />
        </div>
      </Beat>

      <Beat beat="confirmacao">
        <Card className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="measure text-lg">
            Quer conversar sobre o Appointment? Escreva e retornamos com o material completo.
          </p>
          <Button variant="brand" size="lg" className="shrink-0" asChild>
            <a href="mailto:contato@marcaumappointment.com?subject=Investidores%20%E2%80%94%20Appointment">
              contato@marcaumappointment.com
            </a>
          </Button>
        </Card>
      </Beat>
    </>
  );
}
