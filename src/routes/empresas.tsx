import { createFileRoute } from "@tanstack/react-router";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/Section";
import { CtaPair, InviteDialog } from "@/components/site/Cta";
import { Button } from "@/components/ui/button";
import { PricingForm } from "@/components/forms/PricingForm";

export const Route = createFileRoute("/empresas")({
  head: () => ({
    meta: [
      { title: "Para empresas — Appointment" },
      {
        name: "description",
        content:
          "Clínicas, academias, escolas e salões: várias agendas, vários profissionais e um só jeito de marcar, confirmar e receber.",
      },
      { property: "og:title", content: "Para empresas — Appointment" },
      {
        property: "og:description",
        content:
          "Operação de agendamento sob controle: menos no-show, menos vacância e pagamento por cartão e PIX dentro do app.",
      },
    ],
  }),
  component: Empresas,
});

const segmentos = [
  "Clínicas e consultórios",
  "Academias e estúdios",
  "Salões e barbearias",
  "Escolas e cursos",
  "Centros de estética",
  "Serviços técnicos",
];

const blocos = [
  {
    title: "Uma recepção que não para de tocar",
    text: "Boa parte do telefone da sua empresa é agendamento e confirmação. Quando isso migra para o app, a equipe volta a cuidar de quem já está na sua frente.",
  },
  {
    title: "Agenda cheia é agenda bem preenchida",
    text: "Cancelamentos liberam o horário automaticamente para outros clientes. Vacância deixa de ser prejuízo silencioso.",
  },
  {
    title: "Profissionais com o tempo respeitado",
    text: "Cada profissional da casa enxerga sua própria agenda, com regras de disponibilidade próprias — sem planilha compartilhada e sem conflito de horário.",
  },
  {
    title: "Financeiro no mesmo fluxo",
    text: "Cartão e PIX processados pela ASAAS, com o recebimento ligado ao atendimento que o gerou. Menos conciliação manual.",
  },
];

function Empresas() {
  return (
    <>
      <Section className="bg-warm-gradient">
        <div className="max-w-3xl">
          <Eyebrow>Empresas</Eyebrow>
          <SectionTitle>
            A sua operação vive de horários. Ela merece um sistema à altura.
          </SectionTitle>
          <Lead>
            Se o seu negócio tem mais de uma agenda para coordenar, o custo do agendamento
            manual aparece em todo lugar: telefone ocupado, cliente esperando resposta,
            profissional parado, horário vago que ninguém preencheu. O Appointment organiza
            esse fluxo inteiro em um só app.
          </Lead>
          <div className="mt-8">
            <CtaPair audience="empresa" />
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {segmentos.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>Por dentro</Eyebrow>
        <SectionTitle>O que a sua equipe ganha</SectionTitle>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {blocos.map((b) => (
            <article key={b.title} className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <h3 className="text-lg font-semibold">{b.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="ink">
        <div className="max-w-3xl">
          <Eyebrow inverted>Preço</Eyebrow>
          <SectionTitle inverted>Não temos tabela pública — e isso é de propósito</SectionTitle>
          <Lead inverted>
            Uma clínica com vinte profissionais e um estúdio com duas agendas não têm a mesma
            operação, então não faz sentido terem o mesmo contrato. Conte como o seu negócio
            funciona e desenhamos uma proposta a partir disso.
          </Lead>
        </div>
        <div className="mt-10">
          <InviteDialog defaultAudience="empresa">
            <Button size="lg" variant="secondary">
              Quero ser convidado
            </Button>
          </InviteDialog>
        </div>
      </Section>

      <Section tone="sand">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <Eyebrow>Consulta de preço</Eyebrow>
            <SectionTitle>Uma proposta feita para o seu porte</SectionTitle>
            <Lead>
              Responda em um minuto e retornamos com valores e formato de implantação
              adequados ao tamanho da sua operação.
            </Lead>
          </div>
          <div className="rounded-3xl border border-border bg-card p-7 shadow-lift sm:p-9">
            <PricingForm />
          </div>
        </div>
      </Section>
    </>
  );
}
