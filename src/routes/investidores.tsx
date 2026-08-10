import { createFileRoute } from "@tanstack/react-router";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { InviteDialog } from "@/components/site/Cta";

export const Route = createFileRoute("/investidores")({
  head: () => ({
    meta: [
      { title: "Investidores — Appointment" },
      {
        name: "description",
        content:
          "Tese, oportunidade de mercado, relatórios e canal direto de relações com investidores do Appointment.",
      },
      { property: "og:title", content: "Investidores — Appointment" },
      {
        property: "og:description",
        content:
          "Oportunidade, relatórios periódicos e contato direto com a área de relações com investidores do Appointment.",
      },
    ],
  }),
  component: Investidores,
});

const numeros = [
  { k: "2023", v: "Ano de fundação" },
  { k: "6 anos", v: "De pesquisa antes do lançamento" },
  { k: "Horizontal", v: "Qualquer setor com agenda" },
  { k: "ASAAS", v: "Parceiro de pagamentos" },
];

const tese = [
  {
    title: "Mercado horizontal, dor universal",
    text: "Agendamento não é um problema de um setor: é de todo negócio que vende tempo. Saúde, estética, educação, fitness e serviços profissionais compartilham a mesma fricção — e hoje resolvem com telefone, mensagem e caderno.",
  },
  {
    title: "Receita ligada à transação",
    text: "Com pagamento por cartão e PIX dentro do app via ASAAS, o produto acompanha o fluxo financeiro do cliente, e não apenas o cadastro da agenda.",
  },
  {
    title: "Preço por perfil",
    text: "Não trabalhamos com tabela pública. A comercialização é ajustada ao porte e ao perfil de cada operação, o que preserva margem em contas maiores sem barrar o autônomo.",
  },
  {
    title: "Entrada por convite",
    text: "A abertura em lotes controla custo de suporte, aumenta a qualidade dos dados de uso e reduz o risco de escalar um produto antes da hora.",
  },
];

function Investidores() {
  return (
    <>
      <Section tone="ink">
        <div className="max-w-3xl">
          <Eyebrow inverted>Relações com investidores</Eyebrow>
          <SectionTitle inverted>
            Investir em tempo é investir na economia de serviços
          </SectionTitle>
          <Lead inverted>
            O Appointment digitaliza o encontro entre quem oferece tempo e quem precisa dele,
            unindo agendamento e pagamento em um só fluxo. Esta página reúne o essencial para
            quem avalia uma conversa conosco.
          </Lead>
        </div>
        <dl className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {numeros.map((n) => (
            <div key={n.k} className="border-t border-ink-foreground/15 pt-5">
              <dt className="font-display text-2xl font-bold text-ink-foreground">{n.k}</dt>
              <dd className="mt-1 text-sm text-ink-foreground/65">{n.v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section>
        <Eyebrow>Oportunidade</Eyebrow>
        <SectionTitle>Onde vemos valor</SectionTitle>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {tese.map((t) => (
            <article key={t.title} className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <h3 className="text-lg font-semibold">{t.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="sand">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <Eyebrow>Relatórios</Eyebrow>
            <SectionTitle>Transparência periódica</SectionTitle>
            <Lead>
              Enviamos atualizações estruturadas a investidores e interessados qualificados,
              com evolução de produto, indicadores de uso do acesso antecipado e leitura de
              mercado. Materiais detalhados são compartilhados mediante solicitação.
            </Lead>
            <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
              {[
                "Carta trimestral de progresso",
                "Indicadores de adoção e retenção do acesso antecipado",
                "Deck institucional e materiais complementares sob solicitação",
              ].map((i) => (
                <li key={i} className="rounded-xl border border-border bg-card px-5 py-4">
                  {i}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-lift">
            <h3 className="font-display text-2xl font-bold">Fale com a gente</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Para acesso a materiais, agendamento de conversa ou dúvidas societárias, escreva
              diretamente para a nossa área de relações com investidores.
            </p>
            <div className="mt-8 space-y-4 text-sm">
              <div>
                <p className="font-semibold">E-mail</p>
                <a
                  className="text-primary underline underline-offset-4"
                  href="mailto:investidores@marcaumappointment.com"
                >
                  investidores@marcaumappointment.com
                </a>
              </div>
              <div>
                <p className="font-semibold">Assuntos institucionais</p>
                <a
                  className="text-primary underline underline-offset-4"
                  href="mailto:contato@marcaumappointment.com"
                >
                  contato@marcaumappointment.com
                </a>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="mailto:investidores@marcaumappointment.com">Solicitar materiais</a>
              </Button>
              <InviteDialog>
                <Button size="lg" variant="outline">
                  Conhecer o produto
                </Button>
              </InviteDialog>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
