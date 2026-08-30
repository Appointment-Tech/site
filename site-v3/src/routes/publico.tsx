import { createFileRoute } from "@tanstack/react-router";
import { Beat, BeatLabel } from "@/components/site/Beat";
import { PhoneFrame } from "@/components/site/PhoneFrame";
import { InviteDialog } from "@/components/site/InviteDialog";
import { Button } from "@/components/ui/button";
import { telas } from "@/lib/telas";
import { Card, PainList, PathCard, ResolvedCard, SectionHeading } from "@/components/site/blocks";

export const Route = createFileRoute("/publico")({
  head: () => ({
    meta: [
      { title: "Para quem marca horário — Appointment" },
      {
        name: "description",
        content:
          "Veja a disponibilidade real, marque a qualquer hora e pague por cartão ou PIX dentro do app. Sem ligação, sem espera, com comprovante guardado.",
      },
      { property: "og:title", content: "Para quem marca horário — Appointment" },
      {
        property: "og:description",
        content: "Marque às 23h se quiser. O horário que aparece está livre agora.",
      },
    ],
  }),
  component: Publico,
});

function Publico() {
  return (
    <>
      <Beat beat="distancia" tone="brand" size="lg">
        <BeatLabel invert>Lado de quem marca</BeatLabel>
        <h1 className="max-w-3xl text-4xl leading-[1.05] text-primary-foreground sm:text-6xl">
          Marque quando der na sua cabeça. Inclusive às 23h.
        </h1>
        <p className="mt-6 measure text-lg leading-relaxed text-white/85">
          Sem horário comercial para conseguir um horário. Veja o que está livre, escolha, pague e
          siga sua vida.
        </p>
        <InviteDialog
          defaultRole="cliente"
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
          title="Marcar um horário não deveria ser uma negociação."
          lead="Você lembra que precisa marcar justamente quando ninguém está atendendo telefone."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <PainList
            side="marca"
            title="A espera é sempre sua"
            items={[
              "Mensagem às 22h, resposta no dia seguinte — se vier.",
              "Três trocas de mensagem para descobrir um horário que já foi.",
              "Pagamento combinado por fora, sem recibo nenhum.",
              "Esquecer o compromisso porque nada avisou.",
            ]}
          />
          <PainList
            side="atende"
            title="E do outro lado, quem atende"
            items={[
              "Responde mensagem no meio do atendimento.",
              "Perde o horário vago porque ninguém viu a tempo.",
              "Cobra depois, e às vezes não cobra.",
              "Não sabe quem vem amanhã até olhar o caderno.",
            ]}
          />
        </div>
      </Beat>

      <Beat beat="colisao" tone="surface" size="lg">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <BeatLabel>O encontro</BeatLabel>
            <SectionHeading
              title="O horário que aparece está livre agora."
              lead="A agenda que você vê é a mesma que o profissional publicou. Escolheu, está marcado."
            />
            <ul className="mt-8 space-y-4">
              {[
                [
                  "Busque por profissão ou nome",
                  "Fisioterapia, odontologia, personal — ou a pessoa direto.",
                ],
                ["Veja a próxima data livre", "Os horários do dia aparecem no próprio card."],
                ["Dois toques e pronto", "Confirmação na hora, para você e para quem atende."],
                ["Lembrete antes da hora", "Você não precisa lembrar sozinho."],
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
            screen="busca"
            src={telas.busca.src}
            alt={telas.busca.alt}
            caption="A busca no app: profissionais, próxima data e horários livres."
          />
        </div>
      </Beat>

      <Beat beat="confirmacao" id="pagamento">
        <BeatLabel>O que fica resolvido</BeatLabel>
        <SectionHeading
          title="Marcou, pagou, guardou."
          lead="O pagamento e o comprovante ficam junto do atendimento — não em três aplicativos diferentes."
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ResolvedCard
            step="1"
            tone="primary"
            title="Confirmação"
            text="Sai na hora, sem esperar alguém responder."
          />
          <ResolvedCard
            step="2"
            tone="warning"
            title="Lembrete"
            text="Aviso antes do compromisso, automático."
          />
          <ResolvedCard
            step="3"
            tone="info"
            title="Pagamento"
            text="Cartão ou PIX processados pela ASAAS, dentro do app."
          />
          <ResolvedCard
            step="4"
            tone="success"
            title="Comprovante"
            text="Recibo e histórico guardados junto do atendimento."
          />
        </ul>

        <Card className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="measure text-lg">
            O app ainda não está nas lojas. Peça um convite e avisamos assim que abrir sua leva.
          </p>
          <InviteDialog
            defaultRole="cliente"
            trigger={
              <Button variant="brand" size="lg" className="shrink-0">
                Pedir convite
              </Button>
            }
          />
        </Card>
      </Beat>

      <Beat beat="dispersao" tone="surface">
        <BeatLabel>Antes de marcar</BeatLabel>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-3xl sm:text-4xl">Você vê o preço antes de escolher o horário.</h2>
            <p className="mt-4 measure text-lg leading-relaxed text-muted-foreground">
              Cada serviço leva seu valor e sua duração. Nada de perguntar quanto custa por mensagem
              e esperar a resposta para decidir.
            </p>
          </div>
          <PhoneFrame
            screen="perfil"
            src={telas.perfil.src}
            alt={telas.perfil.alt}
            caption="O perfil do profissional, com serviços e preços."
          />
        </div>

        <h2 className="mt-16 text-2xl">Outros caminhos</h2>
        <ul className="mt-8 grid gap-5 lg:grid-cols-2">
          <PathCard
            to="/profissionais"
            eyebrow="Quem atende"
            title="Você também atende?"
            text="A versão para quem administra a própria agenda."
            cta="Ver para profissionais"
          />
          <PathCard
            to="/empresas"
            eyebrow="Quem atende"
            title="Tem um negócio?"
            text="Várias agendas, vários profissionais e uma operação só."
            cta="Ver para empresas"
          />
        </ul>
      </Beat>
    </>
  );
}
