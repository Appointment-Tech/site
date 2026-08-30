import { createFileRoute } from "@tanstack/react-router";
import { Beat, BeatLabel } from "@/components/site/Beat";
import { PhoneFrame } from "@/components/site/PhoneFrame";
import { InviteDialog } from "@/components/site/InviteDialog";
import { Button } from "@/components/ui/button";
import { telas } from "@/lib/telas";
import { Card, PainList, PathCard, ResolvedCard, SectionHeading } from "@/components/site/blocks";

export const Route = createFileRoute("/profissionais")({
  head: () => ({
    meta: [
      { title: "Para profissionais autônomos — Appointment" },
      {
        name: "description",
        content:
          "Publique sua disponibilidade real, receba confirmação e pagamento automáticos e reduza o no-show. Agenda e cobrança no mesmo app.",
      },
      { property: "og:title", content: "Para profissionais autônomos — Appointment" },
      {
        property: "og:description",
        content:
          "Sua agenda deixa de ser um segundo emprego: confirmação, lembrete e pagamento acontecem sozinhos.",
      },
    ],
  }),
  component: Profissionais,
});

function Profissionais() {
  return (
    <>
      <Beat beat="distancia" tone="brand" size="lg">
        <BeatLabel invert>Lado de quem atende</BeatLabel>
        <h1 className="max-w-3xl text-4xl leading-[1.05] text-primary-foreground sm:text-6xl">
          Sua hora vale. Sua agenda devia trabalhar por você.
        </h1>
        <p className="mt-6 measure text-lg leading-relaxed text-white/85">
          Você foi treinado para atender, não para confirmar horário no intervalo do almoço.
        </p>
        <InviteDialog
          defaultRole="profissional"
          trigger={
            <Button variant="onBrand" size="pill" className="mt-9">
              Pedir convite
            </Button>
          }
        />
      </Beat>

      <Beat beat="aproximacao">
        <BeatLabel>O que dói hoje</BeatLabel>
        <SectionHeading
          title="Atender é o trabalho. O resto virou trabalho também."
          lead="Cada horário passa por três aplicativos antes de virar atendimento."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <PainList
            side="atende"
            title="O dia inteiro administrando agenda"
            items={[
              "Responder mensagem entre um cliente e outro.",
              "Remarcar por telefone e anotar em outro lugar.",
              "Descobrir a falta só quando o horário chega.",
              "Cobrar depois, lembrar de cobrar, cobrar de novo.",
            ]}
          />
          <PainList
            side="marca"
            title="E do outro lado, o seu cliente"
            items={[
              "Manda mensagem à noite e fica sem resposta.",
              "Não sabe quais horários ainda existem.",
              "Não tem recibo do que pagou.",
              "Esquece o horário porque nada avisou.",
            ]}
          />
        </div>
      </Beat>

      <Beat beat="colisao" tone="surface" size="lg">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <BeatLabel>O encontro</BeatLabel>
            <SectionHeading
              title="Você publica a disponibilidade. O cliente escolhe. Acabou."
              lead="Sem vai e volta, sem horário fantasma, sem confirmação manual."
            />
            <ul className="mt-8 space-y-4">
              {[
                ["Blocos e intervalos", "Você define duração, folga entre atendimentos e pausas."],
                ["Serviços com preço", "Cada serviço leva seu valor e seu tempo."],
                ["Cobrança no ato", "Cartão ou PIX via ASAAS, no momento do agendamento."],
                ["Regra de falta", "Política de cancelamento e sinal para segurar o horário."],
              ].map(([title, text]) => (
                <li key={title} className="flex gap-4">
                  <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
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
            caption="Sua agenda do dia, como ela aparece no app."
          />
        </div>
      </Beat>

      <Beat beat="confirmacao">
        <BeatLabel>O que fica resolvido</BeatLabel>
        <SectionHeading title="O combinado acontece sem você." />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ResolvedCard step="1" tone="primary" title="Confirmação" text="Marcou, está confirmado para os dois. Nada pendente." />
          <ResolvedCard step="2" tone="warning" title="Lembrete" text="Aviso antes da hora. É aqui que a falta cai." />
          <ResolvedCard step="3" tone="info" title="Pagamento" text="Recebimento por cartão ou PIX, ligado ao atendimento." />
          <ResolvedCard step="4" tone="success" title="Histórico" text="Quem veio, quem faltou, quanto entrou. Sem planilha." />
        </ul>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div>
            <h3 className="text-2xl">O que entrou, e de qual atendimento.</h3>
            <p className="mt-4 measure text-[0.95rem] leading-relaxed text-muted-foreground">
              Saldo, cartões e extrato no mesmo app da agenda. Cada recebimento carrega o nome do
              cliente e o horário que o gerou — sem planilha para reconciliar no fim do mês.
            </p>
          </div>
          <PhoneFrame
            screen="carteira"
            src={telas.carteira.src}
            alt={telas.carteira.alt}
            caption="Sua carteira: saldo e extrato por atendimento."
          />
        </div>

        <Card className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="measure text-lg">
            Comece pelo convite: liberamos por leva e ajudamos a montar sua primeira agenda.
          </p>
          <InviteDialog
            defaultRole="profissional"
            trigger={
              <Button variant="brand" size="lg" className="shrink-0">
                Pedir convite
              </Button>
            }
          />
        </Card>
      </Beat>

      <Beat beat="dispersao" tone="surface">
        <BeatLabel>Outros caminhos</BeatLabel>
        <ul className="mt-8 grid gap-5 lg:grid-cols-2">
          <PathCard
            to="/empresas"
            eyebrow="Quem atende"
            title="Tem equipe?"
            text="Várias agendas, vários profissionais e uma visão só da operação."
            cta="Ver para empresas"
          />
          <PathCard
            to="/publico"
            eyebrow="Quem marca"
            title="Você é cliente?"
            text="Marque, pague e guarde o comprovante no mesmo lugar."
            cta="Ver para quem marca"
          />
        </ul>
      </Beat>
    </>
  );
}
