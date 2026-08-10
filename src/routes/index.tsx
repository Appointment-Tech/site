import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  CreditCard,
  FolderOpen,
  Clock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/Section";
import { CtaPair, InviteDialog, PricingDialog } from "@/components/site/Cta";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InviteForm } from "@/components/forms/InviteForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Appointment — marque um horário tão fácil quanto mandar uma mensagem" },
      {
        name: "description",
        content:
          "Agendamento e pagamento (cartão e PIX via ASAAS) no mesmo app. Menos no-show para quem atende, menos tempo perdido para quem marca.",
      },
      {
        property: "og:title",
        content: "Appointment — marque um horário tão fácil quanto mandar uma mensagem",
      },
      {
        property: "og:description",
        content:
          "Agendamento e pagamento no mesmo app, para profissionais, empresas e clientes. Qualidade de vida através do tempo bem administrado.",
      },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: MessageCircle,
    title: "Marcação fácil",
    text: "Escolher horário no Appointment tem o mesmo esforço de mandar uma mensagem: abre, toca, confirmou. Sem ligação, sem espera, sem “me manda os horários?”.",
  },
  {
    icon: CreditCard,
    title: "Pagamento dentro do app",
    text: "Cartão ou PIX na hora de marcar ou depois do atendimento, com a ASAAS como parceira de pagamentos. Nada de maquininha esquecida nem cobrança constrangedora.",
  },
  {
    icon: FolderOpen,
    title: "Informações centralizadas",
    text: "Histórico, dados de contato, valores, observações do atendimento e comprovantes ficam no mesmo lugar — dos dois lados da conversa.",
  },
  {
    icon: CalendarCheck,
    title: "Agenda organizada",
    text: "Disponibilidade real, confirmações e lembretes automáticos. Menos no-show, menos buraco vago na agenda, mais previsibilidade no fim do mês.",
  },
];

const audiences = [
  {
    tag: "Profissional",
    title: "Você foi treinado para atender, não para administrar agenda",
    text: "Autônomo ou liberal de qualquer área: o Appointment assume a parte chata — responder horários, confirmar, cobrar — e devolve seu tempo para o que você faz de melhor.",
    to: "/profissionais",
  },
  {
    tag: "Empresa",
    title: "Uma operação inteira funcionando no mesmo ritmo",
    text: "Clínicas, academias, escolas e salões: várias agendas, vários profissionais, uma só forma de marcar, confirmar e receber.",
    to: "/empresas",
  },
  {
    tag: "Cliente / paciente",
    title: "Marque quando der na sua cabeça, inclusive às 23h",
    text: "Sem horário comercial para conseguir um horário. Veja o que está livre, escolha, pague e siga sua vida.",
    to: "/publico",
  },
] as const;

const steps = [
  {
    n: "01",
    title: "Encontre quem você precisa",
    text: "Busque o profissional ou o negócio e veja a disponibilidade real da agenda dele, atualizada na hora.",
  },
  {
    n: "02",
    title: "Escolha o horário",
    text: "Dois toques e o compromisso está marcado. Os dois lados recebem confirmação e lembrete.",
  },
  {
    n: "03",
    title: "Pague pelo app",
    text: "Cartão ou PIX processados pela ASAAS. O comprovante fica registrado no histórico do atendimento.",
  },
];

const faq = [
  {
    q: "O Appointment já está disponível para baixar?",
    a: "Ainda não. Estamos em acesso antecipado, liberando convites por lotes para acompanhar de perto cada operação que entra. Deixe seus dados em “Quero ser convidado” e avisamos assim que abrir o próximo lote.",
  },
  {
    q: "Serve para a minha área?",
    a: "Se existe agenda, serve. O Appointment não é vertical de nicho: clínicas, salões, academias, estúdios, escolas, consultórios e profissionais liberais de qualquer área usam a mesma base — o que muda é como você configura seus serviços e horários.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Nossa parceira de pagamentos é a ASAAS. O cliente paga por cartão ou PIX dentro do app, e o profissional acompanha os recebimentos junto do histórico do atendimento.",
  },
  {
    q: "Quanto custa?",
    a: "Não publicamos tabela de preços de propósito: o valor é conversado a partir do perfil e do porte da operação — não faz sentido cobrar o mesmo de um autônomo e de uma clínica com trinta agendas. Use a consulta de preço e voltamos com uma proposta.",
  },
  {
    q: "E o no-show?",
    a: "Confirmações, lembretes e pagamento antecipado opcional reduzem bastante a falta. E quando um horário é cancelado, ele volta a aparecer como disponível para outros clientes, diminuindo a vacância na agenda.",
  },
  {
    q: "Meus dados e os dos meus clientes ficam seguros?",
    a: "Sim. Lidamos com agenda e pagamento, então tratamos segurança como requisito básico: dados trafegam criptografados e as informações financeiras são processadas pela ASAAS, instituição de pagamento regulada.",
  },
];

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-warm-gradient relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="rise-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Acesso antecipado por convite
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] text-balance-pretty sm:text-6xl">
              Marcar um <span className="text-primary">Appointment</span> é tão fácil quanto
              mandar uma mensagem
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Agendamento e pagamento no mesmo app, para quem atende e para quem é atendido.
              Nascemos com uma obsessão: devolver às pessoas o tempo que elas gastam
              organizando compromissos.
            </p>
            <div className="mt-8">
              <CtaPair />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Pagamentos por cartão e PIX com a ASAAS · Sem tabela de preço engessada
            </p>
          </div>

          <div className="rise-in">
            <MockApp />
          </div>
        </div>
      </section>

      {/* Proposta de valor */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Por que existimos</Eyebrow>
          <SectionTitle>
            Qualidade de vida através do tempo bem administrado
          </SectionTitle>
          <Lead>
            Todo mundo perde tempo com agendamento. O cliente que manda mensagem e espera
            resposta. O profissional que para o atendimento para responder. A recepção que
            liga confirmando um a um. O Appointment tira esse atrito do caminho e devolve as
            horas que ele consumia — de todo mundo, ao mesmo tempo.
          </Lead>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <article
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-7 shadow-soft transition-shadow hover:shadow-lift"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* Como funciona */}
      <Section tone="ink">
        <div className="max-w-3xl">
          <Eyebrow inverted>Como funciona</Eyebrow>
          <SectionTitle inverted>Três passos, nenhuma ligação</SectionTitle>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="border-t border-ink-foreground/15 pt-6">
              <span className="font-display text-sm font-bold text-ink-foreground/45">
                {s.n}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-ink-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-foreground/70">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-3 rounded-2xl border border-ink-foreground/15 p-6">
          <ShieldCheck className="h-5 w-5 text-ink-foreground/70" />
          <p className="text-sm text-ink-foreground/70">
            Pagamentos processados pela <strong className="text-ink-foreground">ASAAS</strong>,
            instituição de pagamento regulada. Cartão e PIX, com comprovante ligado ao
            atendimento.
          </p>
        </div>
      </Section>

      {/* Públicos */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Para quem é</Eyebrow>
          <SectionTitle>Três ângulos do mesmo problema: tempo</SectionTitle>
          <Lead>
            O Appointment atende qualquer atividade que dependa de agenda. O que muda é o que
            cada um ganha de volta.
          </Lead>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {audiences.map((a) => (
            <Link
              key={a.tag}
              to={a.to}
              className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {a.tag}
              </span>
              <h3 className="mt-4 text-xl font-semibold leading-snug">{a.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {a.text}
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Ver detalhes <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="sand">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Perguntas frequentes</Eyebrow>
            <SectionTitle>Antes que você pergunte</SectionTitle>
            <Lead>
              Se ficou alguma dúvida, escreva para{" "}
              <a
                className="font-medium text-primary underline underline-offset-4"
                href="mailto:contato@marcaumappointment.com"
              >
                contato@marcaumappointment.com
              </a>
              .
            </Lead>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faq.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* CTA final */}
      <Section id="convite">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <Eyebrow>Acesso antecipado</Eyebrow>
            <SectionTitle>Quero ser convidado</SectionTitle>
            <Lead>
              Estamos abrindo o Appointment por lotes para acompanhar de perto cada
              profissional, empresa e cliente que entra. Deixe seus dados e chamamos você.
            </Lead>
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                Quer entender valores antes?{" "}
                <PricingDialog>
                  <button className="font-semibold text-primary underline underline-offset-4">
                    Faça uma consulta de preço
                  </button>
                </PricingDialog>{" "}
                — a proposta é montada a partir do seu perfil.
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-7 shadow-lift sm:p-9">
            <InviteForm />
          </div>
        </div>
      </Section>
    </>
  );
}

function MockApp() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/5 blur-2xl" />
      <div className="rounded-[2rem] border border-border bg-card p-5 shadow-lift">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Terça</p>
            <p className="font-display text-xl font-bold">14 de maio</p>
          </div>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            4 horários livres
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {[
            { h: "09:00", t: "Consulta de retorno", s: "Confirmado" },
            { h: "10:30", t: "Avaliação inicial", s: "Pago no app" },
            { h: "14:00", t: "Sessão semanal", s: "Aguardando" },
          ].map((r) => (
            <div
              key={r.h}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
            >
              <span className="font-display text-sm font-bold text-primary">{r.h}</span>
              <span className="flex-1 text-sm font-medium">{r.t}</span>
              <span className="text-xs text-muted-foreground">{r.s}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-brand-gradient p-4">
          <p className="text-xs text-primary-foreground/80">Recebido este mês</p>
          <p className="font-display text-2xl font-bold text-primary-foreground">
            R$ 8.420,00
          </p>
          <p className="mt-1 text-xs text-primary-foreground/70">Cartão e PIX via ASAAS</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl border border-border p-3">
            <p className="font-display text-lg font-bold">-38%</p>
            <p className="text-xs text-muted-foreground">no-show</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="font-display text-lg font-bold">+6h</p>
            <p className="text-xs text-muted-foreground">livres por semana</p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <InviteDialog>
          <Button variant="ghost" className="text-primary">
            Quero testar no meu celular
          </Button>
        </InviteDialog>
      </div>
    </div>
  );
}
