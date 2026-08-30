import { createFileRoute } from "@tanstack/react-router";
import { Beat, BeatLabel } from "@/components/site/Beat";
import { InviteDialog } from "@/components/site/InviteDialog";
import { Button } from "@/components/ui/button";
import { Card, PathCard, SectionHeading, Stat } from "@/components/site/blocks";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o Appointment" },
      {
        name: "description",
        content:
          "Por que o Appointment existe: agendamento e pagamento no mesmo lugar, para que o tempo de quem atende e de quem marca pare de ser gasto na negociação de um horário.",
      },
      { property: "og:title", content: "Sobre o Appointment" },
      {
        property: "og:description",
        content: "Qualidade de vida através do tempo bem administrado.",
      },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <>
      <Beat beat="distancia" tone="brand" size="lg">
        <BeatLabel invert>Sobre</BeatLabel>
        <h1 className="max-w-3xl text-4xl leading-[1.05] text-primary-foreground sm:text-6xl">
          Qualidade de vida através do tempo bem administrado.
        </h1>
        <p className="mt-6 measure text-lg leading-relaxed text-white/85">
          O Appointment nasceu de uma constatação simples: marcar um horário consome tempo dos dois
          lados, e nenhum dos dois é pago por isso.
        </p>
      </Beat>

      <Beat beat="aproximacao">
        <BeatLabel>Por que existimos</BeatLabel>
        <SectionHeading
          title="Um horário passa por gente demais antes de existir."
          lead="Mensagem, ligação, retorno, confirmação, cobrança, comprovante. Seis passos para uma coisa só."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-5 text-[1.02rem] leading-relaxed text-muted-foreground">
            <p>
              Quem atende foi treinado para atender — não para administrar agenda no intervalo entre
              um cliente e outro, nem para cobrar duas vezes a mesma pessoa.
            </p>
            <p>
              Quem marca não quer negociar: quer ver o que está livre, escolher e seguir a vida.
              Normalmente às 23h, quando lembra que precisa marcar e não há ninguém do outro lado.
            </p>
            <p>
              O Appointment coloca os dois no mesmo lugar. A disponibilidade que o profissional
              publica é exatamente a que o cliente vê, e o pagamento acontece no mesmo passo do
              agendamento — cartão ou PIX, processados pela ASAAS.
            </p>
          </div>

          <div className="grid gap-6">
            <Stat value="1 fluxo" label="Marcar, confirmar e pagar sem trocar de aplicativo" />
            <Stat value="24 h" label="A agenda continua aberta fora do expediente" />
            <Stat value="2 lados" label="A mesma informação para quem atende e para quem marca" />
          </div>
        </div>
      </Beat>

      <Beat beat="colisao" tone="surface">
        <BeatLabel>No que acreditamos</BeatLabel>
        <SectionHeading title="Três decisões que orientam o produto." />
        <ul className="mt-12 grid gap-5 lg:grid-cols-3">
          <Card as="li">
            <h3 className="text-lg">Disponibilidade é verdade, não vitrine</h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
              Horário que aparece é horário que existe. Sem lista de espera disfarçada de agenda.
            </p>
          </Card>
          <Card as="li">
            <h3 className="text-lg">O combinado se resolve sozinho</h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
              Confirmação, lembrete e cobrança são do sistema. Não deveriam ser tarefa de ninguém.
            </p>
          </Card>
          <Card as="li">
            <h3 className="text-lg">Os dois lados veem o mesmo</h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
              Histórico, valores e comprovantes ficam no mesmo lugar, para quem atende e para quem
              marca.
            </p>
          </Card>
        </ul>
      </Beat>

      <Beat beat="confirmacao">
        <Card className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="measure text-lg">
            O app ainda não está nas lojas. O acesso é por convite, liberado em levas.
          </p>
          <InviteDialog
            trigger={
              <Button variant="brand" size="lg" className="shrink-0">
                Pedir convite
              </Button>
            }
          />
        </Card>
      </Beat>

      <Beat beat="dispersao" tone="surface">
        <BeatLabel>Três caminhos</BeatLabel>
        <ul className="mt-8 grid gap-5 lg:grid-cols-3">
          <PathCard
            to="/profissionais"
            eyebrow="Quem atende"
            title="Profissionais"
            text="Para quem administra a própria agenda."
            cta="Ver para profissionais"
          />
          <PathCard
            to="/empresas"
            eyebrow="Quem atende"
            title="Empresas"
            text="Para quem opera várias agendas."
            cta="Ver para empresas"
          />
          <PathCard
            to="/publico"
            eyebrow="Quem marca"
            title="Público"
            text="Para quem quer marcar a qualquer hora."
            cta="Ver para quem marca"
          />
        </ul>
      </Beat>
    </>
  );
}
