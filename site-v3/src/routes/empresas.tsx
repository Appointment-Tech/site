import { createFileRoute } from "@tanstack/react-router";
import { Beat, BeatLabel } from "@/components/site/Beat";
import { PhoneFrame } from "@/components/site/PhoneFrame";
import { PriceDialog } from "@/components/site/PriceDialog";
import { InviteDialog } from "@/components/site/InviteDialog";
import { Button } from "@/components/ui/button";
import { telas } from "@/lib/telas";
import { Card, PainList, PathCard, ResolvedCard, SectionHeading } from "@/components/site/blocks";

export const Route = createFileRoute("/empresas")({
  head: () => ({
    meta: [
      { title: "Para empresas e equipes — Appointment" },
      {
        name: "description",
        content:
          "Clínicas, academias, escolas e salões: várias agendas, vários profissionais, confirmação e pagamento centralizados. Peça uma consulta de preço.",
      },
      { property: "og:title", content: "Para empresas e equipes — Appointment" },
      {
        property: "og:description",
        content:
          "Uma operação, várias agendas. Confirmação, lembrete e recebimento no mesmo fluxo.",
      },
    ],
  }),
  component: Empresas,
});

function Empresas() {
  return (
    <>
      <Beat beat="distancia" tone="brand" size="lg">
        <BeatLabel invert>Lado de quem atende</BeatLabel>
        <h1 className="max-w-3xl text-4xl leading-[1.05] text-primary-foreground sm:text-6xl">
          Várias agendas. Uma operação só.
        </h1>
        <p className="mt-6 measure text-lg leading-relaxed text-white/85">
          Clínica, academia, escola, salão. Cada profissional com a sua agenda — e a recepção
          enxergando tudo.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <PriceDialog
            trigger={
              <Button variant="onBrand" size="pill">
                Consulta de preço
              </Button>
            }
          />
          <InviteDialog
            defaultRole="empresa"
            trigger={
              <Button variant="onBrandGhost" size="pill">
                Pedir convite
              </Button>
            }
          />
        </div>
      </Beat>

      <Beat beat="aproximacao">
        <BeatLabel>O que dói hoje</BeatLabel>
        <SectionHeading
          title="A recepção virou o gargalo da casa."
          lead="Quanto mais profissionais, mais o horário depende de alguém para existir."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <PainList
            side="atende"
            title="Operação espalhada"
            items={[
              "Cada profissional com um caderno, um app, um jeito.",
              "Encaixe feito no grito, sem ninguém ver o vago.",
              "No-show que ninguém mede — e por isso ninguém corrige.",
              "Conciliação de recebimento no fim do mês, na mão.",
            ]}
          />
          <PainList
            side="marca"
            title="Do lado de quem procura"
            items={[
              "Liga, não atende, desiste.",
              "Não sabe com qual profissional dá para marcar.",
              "Paga na recepção e sai sem comprovante.",
              "Remarcar exige começar tudo de novo.",
            ]}
          />
        </div>
      </Beat>

      <Beat beat="colisao" tone="surface" size="lg">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <BeatLabel>O encontro</BeatLabel>
            <SectionHeading
              title="Uma agenda por profissional, uma visão para a casa."
              lead="O cliente escolhe serviço, profissional e horário. A operação vê tudo no mesmo painel."
            />
            <ul className="mt-8 space-y-4">
              {[
                ["Multiagenda", "Equipe inteira em uma visão, por unidade ou por sala."],
                ["Papéis e permissões", "Recepção, profissional e gestão veem o que precisam."],
                ["Recebimento central", "Cartão e PIX via ASAAS, com repasse por profissional."],
                ["Indicadores", "Ocupação, faltas e receita por agenda, sem exportar nada."],
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
            caption="A agenda da equipe, no app."
          />
        </div>
      </Beat>

      <Beat beat="confirmacao">
        <BeatLabel>O que fica resolvido</BeatLabel>
        <SectionHeading title="Menos telefone, mais atendimento." />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ResolvedCard
            step="1"
            tone="primary"
            title="Confirmação"
            text="Automática para cliente e profissional, em toda agenda."
          />
          <ResolvedCard
            step="2"
            tone="warning"
            title="Lembrete"
            text="Regra única para a casa inteira, sem depender da recepção."
          />
          <ResolvedCard
            step="3"
            tone="info"
            title="Pagamento"
            text="Cartão e PIX, com registro por profissional e por unidade."
          />
          <ResolvedCard
            step="4"
            tone="success"
            title="Relatórios"
            text="Ocupação, faltas e receita para decidir a próxima escala."
          />
        </ul>

        <Card className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="measure text-lg">
            O preço depende do tamanho da sua operação. Conte quantas agendas você opera e
            devolvemos uma proposta.
          </p>
          <PriceDialog
            trigger={
              <Button variant="brand" size="lg" className="shrink-0">
                Consulta de preço
              </Button>
            }
          />
        </Card>
      </Beat>

      <Beat beat="dispersao" tone="surface">
        <BeatLabel>Outros caminhos</BeatLabel>
        <ul className="mt-8 grid gap-5 lg:grid-cols-2">
          <PathCard
            to="/profissionais"
            eyebrow="Quem atende"
            title="Atende sozinho?"
            text="A versão para quem administra a própria agenda."
            cta="Ver para profissionais"
          />
          <PathCard
            to="/publico"
            eyebrow="Quem marca"
            title="É cliente da casa?"
            text="Marque e pague direto pelo app, a qualquer hora."
            cta="Ver para quem marca"
          />
        </ul>
      </Beat>
    </>
  );
}
