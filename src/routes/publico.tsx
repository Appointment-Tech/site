import { createFileRoute } from "@tanstack/react-router";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/Section";
import { InviteForm } from "@/components/forms/InviteForm";
import { InviteDialog } from "@/components/site/Cta";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/publico")({
  head: () => ({
    meta: [
      { title: "Para você — Appointment" },
      {
        name: "description",
        content:
          "Marque consultas, sessões e horários quando quiser, 24/7, e pague por cartão ou PIX dentro do app. Sem ligação, sem espera.",
      },
      { property: "og:title", content: "Para você — Appointment" },
      {
        property: "og:description",
        content:
          "Escolher um horário deveria ser simples: veja o que está livre, marque em dois toques e pague pelo app.",
      },
    ],
  }),
  component: Publico,
});

const momentos = [
  {
    t: "Domingo, 22h40",
    d: "Você lembra que precisa marcar o dentista. Ninguém atende telefone a essa hora — mas a agenda dele está aberta no app.",
  },
  {
    t: "Terça, no intervalo",
    d: "Cinco minutos livres bastam: escolhe o horário, confirma e volta ao trabalho. Sem ficar esperando resposta.",
  },
  {
    t: "Sexta, depois da sessão",
    d: "O pagamento sai no cartão ou no PIX pelo próprio app, com comprovante guardado junto do atendimento.",
  },
];

const beneficios = [
  { t: "24/7", d: "Marque a qualquer hora, sem depender de horário comercial." },
  { t: "Sem ligação", d: "Nada de telefone ocupado nem “te retorno depois”." },
  { t: "Tudo junto", d: "Seus compromissos, comprovantes e histórico em um só lugar." },
  { t: "Pagamento fácil", d: "Cartão ou PIX pela ASAAS, direto no app." },
];

function Publico() {
  return (
    <>
      <Section className="bg-warm-gradient">
        <div className="max-w-3xl">
          <Eyebrow>Para você</Eyebrow>
          <SectionTitle>
            Seu tempo livre não deveria ser gasto marcando horário
          </SectionTitle>
          <Lead>
            Consulta, sessão, corte de cabelo, aula, avaliação: qualquer compromisso marcado em
            dois toques, na hora que der na sua cabeça. Você vê o que está realmente livre,
            escolhe, paga e segue a vida.
          </Lead>
          <div className="mt-8">
            <InviteDialog defaultAudience="cliente">
              <Button size="lg">Quero ser convidado</Button>
            </InviteDialog>
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>Como entra na sua rotina</Eyebrow>
        <SectionTitle>Três momentos bem comuns</SectionTitle>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {momentos.map((m) => (
            <article key={m.t} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
              <span className="font-display text-sm font-bold text-primary">{m.t}</span>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.d}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="ink">
        <Eyebrow inverted>Vantagens</Eyebrow>
        <SectionTitle inverted>Simples porque tem que ser</SectionTitle>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {beneficios.map((b) => (
            <div key={b.t} className="border-t border-ink-foreground/15 pt-5">
              <h3 className="font-display text-xl font-bold text-ink-foreground">{b.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-foreground/70">{b.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="sand">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <Eyebrow>Acesso antecipado</Eyebrow>
            <SectionTitle>Entre na lista</SectionTitle>
            <Lead>
              O app ainda não está nas lojas: estamos convidando pessoas por lotes. Deixe seus
              dados e avisamos assim que for a sua vez.
            </Lead>
          </div>
          <div className="rounded-3xl border border-border bg-card p-7 shadow-lift sm:p-9">
            <InviteForm defaultAudience="cliente" />
          </div>
        </div>
      </Section>
    </>
  );
}
