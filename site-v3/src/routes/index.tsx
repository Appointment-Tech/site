import { createFileRoute } from "@tanstack/react-router";
import { Beat, BeatLabel } from "@/components/site/Beat";
import { PhoneFrame } from "@/components/site/PhoneFrame";
import { InviteDialog } from "@/components/site/InviteDialog";
import { PriceDialog } from "@/components/site/PriceDialog";
import { Button } from "@/components/ui/button";
import { telas } from "@/lib/telas";
import {
  Card,
  PainList,
  PathCard,
  ResolvedCard,
  SectionHeading,
  Stat,
} from "@/components/site/blocks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Appointment — agendar e pagar no mesmo lugar" },
      {
        name: "description",
        content:
          "Dois lados se encontram: quem atende e quem marca. Disponibilidade real, confirmação automática, lembrete, pagamento por cartão ou PIX e comprovante — tudo num app só.",
      },
      { property: "og:title", content: "Appointment — agendar e pagar no mesmo lugar" },
      {
        property: "og:description",
        content:
          "Agenda, confirmação, lembrete e pagamento em um único fluxo. Menos no-show, tempo bem administrado.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* 1. distância — os dois lados existem, separados */}
      <Beat beat="distancia" tone="brand" size="lg">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <BeatLabel invert>Dois lados, um horário</BeatLabel>
            <h1 className="text-4xl leading-[1.05] text-primary-foreground sm:text-6xl">
              De um lado, a agenda.
              <br />
              Do outro, quem precisa dela.
            </h1>
            <p className="mt-6 measure text-lg leading-relaxed text-white/85">
              O Appointment coloca os dois no mesmo lugar. Marcar, confirmar e pagar em um único
              gesto — cartão ou PIX.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <InviteDialog
                trigger={
                  <Button variant="onBrand" size="pill">
                    Pedir convite
                  </Button>
                }
              />
              <PriceDialog
                trigger={
                  <Button variant="onBrandGhost" size="pill">
                    Consulta de preço
                  </Button>
                }
              />
            </div>
            <p className="mt-5 text-sm text-white/70">
              Ainda não estamos nas lojas. O acesso é por convite.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <li className="rounded-[var(--radius-xl)] border border-white/25 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-semibold text-primary-foreground">Quem atende</p>
              <p className="mt-1 text-sm text-white/80">
                Publica a disponibilidade real e para de administrar mensagem solta.
              </p>
            </li>
            <li className="rounded-[var(--radius-xl)] border border-white/25 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-semibold text-primary-foreground">Quem marca</p>
              <p className="mt-1 text-sm text-white/80">
                Escolhe o horário às 23h, sem esperar o expediente começar.
              </p>
            </li>
            <li className="rounded-[var(--radius-xl)] bg-card p-5 sm:col-span-2 lg:col-span-1">
              <p className="text-sm font-semibold text-foreground">O encontro</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Horário confirmado, lembrete enviado, pagamento registrado.
              </p>
            </li>
          </ul>
        </div>
      </Beat>

      {/* 2. aproximação — a dor de cada lado */}
      <Beat beat="aproximacao" tone="base">
        <BeatLabel>O que dói hoje</BeatLabel>
        <SectionHeading
          title="As duas correntes se movem sem se ver."
          lead="Cada lado resolve o mesmo horário duas vezes, em ferramentas diferentes."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <PainList
            side="atende"
            title="A agenda vira um segundo emprego"
            items={[
              "Confirmação manual, um a um, todo dia.",
              "No-show sem aviso e sem custo para quem falta.",
              "Cobrança em outro app, comprovante em outro lugar.",
              "Horário vago que ninguém enxergou a tempo.",
            ]}
          />
          <PainList
            side="marca"
            title="Marcar depende de alguém acordado"
            items={[
              "Mensagem enviada à noite, resposta só no dia seguinte.",
              "Vai e volta para descobrir um horário que ainda existe.",
              "Pagamento combinado por fora, sem recibo.",
              "Nenhum histórico do que já foi atendido.",
            ]}
          />
        </div>

        <div className="stream-rule mt-12" aria-hidden="true" />

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Stat value="1 fluxo" label="Marcar, confirmar e pagar sem trocar de app" />
          <Stat value="24 h" label="A agenda continua aberta fora do expediente" />
          <Stat value="0 planilha" label="Histórico e comprovante ficam no mesmo lugar" />
        </div>
      </Beat>

      {/* 3. colisão — o encontro, tela real do app */}
      <Beat beat="colisao" tone="surface" size="lg">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1fr]">
          <div>
            <BeatLabel>O encontro</BeatLabel>
            <SectionHeading
              title="Aqui os dois lados se cristalizam num atendimento."
              lead="A disponibilidade que o profissional publicou é exatamente a que o cliente vê. Escolheu, está marcado."
            />
            <ul className="mt-8 space-y-4">
              {[
                ["Disponibilidade real", "Sem horário fantasma: o que aparece está livre agora."],
                ["Confirmação na hora", "Os dois lados recebem o mesmo aviso, ao mesmo tempo."],
                ["Pagamento junto", "Cartão ou PIX via ASAAS, no mesmo passo do agendamento."],
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

          {/* A tela real do app é o desfecho da narrativa, não uma ilustração:
              o que se materializa na colisão é o atendimento já confirmado. */}
          <PhoneFrame
            screen="confirmado"
            src={telas.confirmado.src}
            alt={telas.confirmado.alt}
            caption="O atendimento confirmado, como ele nasce no app."
          />
        </div>
      </Beat>

      {/* 4. confirmação — o que fica resolvido */}
      <Beat beat="confirmacao" tone="base">
        <BeatLabel>O que fica resolvido</BeatLabel>
        <SectionHeading
          title="Depois do encontro, nada volta para a sua mão."
          lead="Tempo bem administrado é isto: o combinado acontece sozinho."
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ResolvedCard
            step="1"
            tone="primary"
            title="Confirmação"
            text="O horário nasce confirmado para os dois lados. Ninguém precisa perguntar."
          />
          <ResolvedCard
            step="2"
            tone="warning"
            title="Lembrete"
            text="Aviso automático antes da hora. É onde o no-show cai."
          />
          <ResolvedCard
            step="3"
            tone="info"
            title="Pagamento"
            text="Cartão ou PIX via ASAAS, na hora de marcar ou na hora de atender."
          />
          <ResolvedCard
            step="4"
            tone="success"
            title="Comprovante"
            text="Recibo e histórico guardados junto do atendimento, para os dois."
          />
        </ul>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div>
            <h3 className="text-2xl">O dinheiro chega junto com o histórico.</h3>
            <p className="mt-4 measure text-[0.95rem] leading-relaxed text-muted-foreground">
              Cada recebimento fica ligado ao atendimento que o gerou. Nada de conferir extrato de um
              lado e agenda do outro para descobrir quem pagou o quê.
            </p>
          </div>
          <PhoneFrame
            screen="carteira"
            src={telas.carteira.src}
            alt={telas.carteira.alt}
            caption="Saldo, cartões e extrato ligados aos atendimentos."
          />
        </div>

        <Card className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="measure text-lg">
            <strong className="font-semibold">Menos no-show</strong> não é promessa de marketing: é
            o efeito de confirmar, lembrar e cobrar no mesmo fluxo.
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

      {/* 5. dispersão — os três caminhos. A busca entra aqui, do lado de quem
          marca: no momento `aproximacao` ela competiria com as duas listas de
          dor, que é onde o texto precisa da atenção. */}
      <Beat beat="dispersao" tone="surface" size="lg">
        <BeatLabel>Três caminhos</BeatLabel>
        <SectionHeading
          title="Cada lado continua pela sua corrente."
          lead="Escolha por onde você entra no Appointment."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <PathCard
              to="/profissionais"
              eyebrow="Quem atende"
              title="Profissionais"
              text="Você atende sozinho e quer parar de administrar a agenda no intervalo entre um cliente e outro."
              cta="Ver para profissionais"
            />
            <PathCard
              to="/empresas"
              eyebrow="Quem atende"
              title="Empresas"
              text="Clínica, academia, escola ou salão: várias agendas, vários profissionais, uma operação só."
              cta="Ver para empresas"
            />
            <PathCard
              to="/publico"
              eyebrow="Quem marca"
              title="Público"
              text="Você quer marcar quando dá na sua cabeça e ter tudo — horário, pagamento e recibo — no mesmo lugar."
              cta="Ver para quem marca"
            />
          </ul>

          <PhoneFrame
            screen="busca"
            src={telas.busca.src}
            alt={telas.busca.alt}
            caption="A busca, na tela de quem marca: horários livres e a próxima data."
          />
        </div>
      </Beat>
    </>
  );
}
