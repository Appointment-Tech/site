import { createFileRoute } from "@tanstack/react-router";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/Section";
import { CtaPair, PricingDialog } from "@/components/site/Cta";
import { Button } from "@/components/ui/button";
import { InviteForm } from "@/components/forms/InviteForm";

export const Route = createFileRoute("/profissionais")({
  head: () => ({
    meta: [
      { title: "Para profissionais — Appointment" },
      {
        name: "description",
        content:
          "Autônomo ou liberal: deixe a agenda, as confirmações e a cobrança com o Appointment e volte a gastar seu tempo no que você faz de melhor.",
      },
      { property: "og:title", content: "Para profissionais — Appointment" },
      {
        property: "og:description",
        content:
          "Menos no-show, menos vacância e menos tempo administrando agenda. O Appointment cuida da marcação e do pagamento por você.",
      },
    ],
  }),
  component: Profissionais,
});

const dores = [
  {
    d: "Responder mensagem no meio do atendimento",
    s: "Sua disponibilidade fica pública e atualizada. O cliente escolhe sozinho, você só recebe a confirmação.",
  },
  {
    d: "Cliente que some no dia",
    s: "Confirmação e lembretes automáticos, com opção de pagamento antecipado. O no-show cai e o horário cancelado volta a circular.",
  },
  {
    d: "Cobrar é constrangedor",
    s: "O pagamento acontece no app, por cartão ou PIX, com a ASAAS. Você atende; a cobrança se resolve sozinha.",
  },
  {
    d: "Anotação espalhada em três lugares",
    s: "Histórico, contatos, valores e observações ficam juntos, ligados a cada atendimento.",
  },
];

function Profissionais() {
  return (
    <>
      <Section className="bg-warm-gradient">
        <div className="max-w-3xl">
          <Eyebrow>Profissionais</Eyebrow>
          <SectionTitle>
            Você estudou anos para atender. Não para administrar agenda.
          </SectionTitle>
          <Lead>
            Psicólogo, fisioterapeuta, personal, cabeleireiro, professor particular, advogado,
            tatuador — se sua rotina é feita de horários, o Appointment tira de você a parte
            que ninguém escolheu fazer: combinar horário, confirmar, lembrar e cobrar.
          </Lead>
          <div className="mt-8">
            <CtaPair audience="profissional" />
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>Na prática</Eyebrow>
        <SectionTitle>O que muda no seu dia</SectionTitle>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {dores.map((i) => (
            <article key={i.d} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
              <p className="text-sm font-semibold text-muted-foreground line-through decoration-primary/40">
                {i.d}
              </p>
              <p className="mt-3 text-base leading-relaxed">{i.s}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="ink">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <Eyebrow inverted>O ganho real</Eyebrow>
            <SectionTitle inverted>Horas de volta, toda semana</SectionTitle>
            <Lead inverted>
              A conta é simples: cada agendamento resolvido por mensagem custa alguns minutos
              seus — vezes dezenas por semana. Quando esse fluxo vira dois toques no app, o
              tempo que sobra é seu para atender mais, estudar, descansar ou simplesmente
              chegar em casa mais cedo.
            </Lead>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { k: "Agenda", v: "Disponibilidade sempre atualizada, sem retrabalho." },
              { k: "Financeiro", v: "Recebimentos por cartão e PIX organizados por atendimento." },
              { k: "Relacionamento", v: "Histórico do cliente na mão antes de cada sessão." },
              { k: "Previsibilidade", v: "Menos furos na agenda, menos surpresa no fim do mês." },
            ].map((c) => (
              <div key={c.k} className="rounded-2xl border border-ink-foreground/15 p-6">
                <h3 className="text-base font-semibold text-ink-foreground">{c.k}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-foreground/70">{c.v}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <Eyebrow>Vamos começar</Eyebrow>
            <SectionTitle>Peça seu convite</SectionTitle>
            <Lead>
              O acesso ainda é por convite, liberado em lotes. Deixe seus dados e falamos com
              você — é rápido e sem compromisso.
            </Lead>
            <p className="mt-6 text-sm text-muted-foreground">
              Quer saber quanto custa para o seu caso?
            </p>
            <PricingDialog>
              <Button variant="outline" className="mt-3">
                Consulta de preço
              </Button>
            </PricingDialog>
          </div>
          <div className="rounded-3xl border border-border bg-card p-7 shadow-lift sm:p-9">
            <InviteForm defaultAudience="profissional" />
          </div>
        </div>
      </Section>
    </>
  );
}
