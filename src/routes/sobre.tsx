import { createFileRoute } from "@tanstack/react-router";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/Section";
import { CtaPair } from "@/components/site/Cta";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre nós — Appointment" },
      {
        name: "description",
        content:
          "Seis anos de pesquisa antes da primeira linha de código. Conheça a história, o time, o compromisso e o roadmap do Appointment.",
      },
      { property: "og:title", content: "Sobre nós — Appointment" },
      {
        property: "og:description",
        content:
          "A história do Appointment: fundado em 2023 após seis anos de pesquisa sobre o tempo que as pessoas perdem marcando compromissos.",
      },
    ],
  }),
  component: Sobre,
});

const timeline = [
  {
    year: "2017",
    title: "A pergunta",
    text: "Começamos observando uma cena banal: quanto tempo se perde para marcar meia hora de atendimento. A resposta, somada, era absurda — dos dois lados do balcão.",
  },
  {
    year: "2018 — 2022",
    title: "Seis anos de maturação",
    text: "Pesquisa de campo com profissionais liberais, clínicas, salões e academias. Protótipos descartados, hipóteses derrubadas, e uma convicção que sobreviveu: agendamento e pagamento precisam viver no mesmo lugar.",
  },
  {
    year: "2023",
    title: "Fundação",
    text: "O Appointment nasce como empresa, com o produto já amadurecido e uma tese clara: qualidade de vida através do tempo bem administrado.",
  },
  {
    year: "Hoje",
    title: "Acesso antecipado",
    text: "Convites liberados por lotes, com acompanhamento próximo de cada operação que entra — para o produto crescer junto com quem usa.",
  },
];

const compromissos = [
  {
    title: "Tempo é o produto",
    text: "Cada decisão de produto passa por uma pergunta: isso devolve tempo para alguém? Se a resposta é não, não entra.",
  },
  {
    title: "Simples de verdade",
    text: "Simplicidade não é tela bonita, é menos passos. Marcar tem que custar o mesmo esforço de mandar uma mensagem.",
  },
  {
    title: "Confiança no básico",
    text: "Lidamos com agenda e dinheiro. Segurança, previsibilidade e transparência não são recursos: são o mínimo.",
  },
  {
    title: "Sem nicho, com profundidade",
    text: "Atendemos qualquer área que dependa de agenda, mas ouvimos cada uma delas antes de generalizar.",
  },
];

const roadmap = [
  { fase: "Agora", items: ["Lotes de convite", "Agenda e pagamento no app", "Cartão e PIX via ASAAS"] },
  { fase: "Próximo", items: ["Múltiplas agendas por empresa", "Relatórios de ocupação", "Lembretes personalizáveis"] },
  { fase: "Depois", items: ["Integrações com sistemas de gestão", "Pacotes e recorrência", "Abertura pública nas lojas"] },
];

function Sobre() {
  return (
    <>
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Sobre nós</Eyebrow>
          <SectionTitle>
            Uma empresa construída em cima de uma conta simples: quanto tempo você perde?
          </SectionTitle>
          <Lead>
            O Appointment foi fundado em 2023, depois de seis anos de pesquisa e maturação do
            produto. Não começamos com uma tecnologia procurando problema — começamos com um
            problema teimoso e demoramos o tempo necessário para entendê-lo.
          </Lead>
        </div>
      </Section>

      <Section tone="sand" className="!pt-0">
        <div className="grid gap-10 lg:grid-cols-2">
          {timeline.map((t) => (
            <article key={t.year} className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <span className="font-display text-sm font-bold uppercase tracking-widest text-primary">
                {t.year}
              </span>
              <h3 className="mt-3 text-xl font-semibold">{t.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Nosso compromisso</Eyebrow>
        <SectionTitle>O que não negociamos</SectionTitle>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {compromissos.map((c) => (
            <div key={c.title} className="border-l-2 border-primary/30 pl-6">
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="ink">
        <Eyebrow inverted>Time</Eyebrow>
        <SectionTitle inverted>Gente que gosta de resolver o chato</SectionTitle>
        <Lead inverted>
          Um time enxuto de produto, engenharia e operação, com experiência em saúde, bem-estar
          e serviços. Trabalhamos perto de quem atende: boa parte do que existe hoje no app
          nasceu de conversa com profissionais reais, não de reunião interna.
        </Lead>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { area: "Produto & pesquisa", text: "Escuta contínua de profissionais e clientes para transformar rotina em fluxo." },
            { area: "Engenharia", text: "Base sólida de agenda, notificações e integração de pagamentos." },
            { area: "Operação & suporte", text: "Acompanhamento próximo de cada conta em acesso antecipado." },
          ].map((t) => (
            <div key={t.area} className="rounded-2xl border border-ink-foreground/15 p-6">
              <h3 className="text-base font-semibold text-ink-foreground">{t.area}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-foreground/70">{t.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Roadmap</Eyebrow>
        <SectionTitle>Para onde estamos indo</SectionTitle>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {roadmap.map((r) => (
            <div key={r.fase} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                {r.fase}
              </span>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {r.items.map((i) => (
                  <li key={i} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <CtaPair />
        </div>
      </Section>
    </>
  );
}
