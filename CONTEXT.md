# Contexto do domínio — site institucional (Appointment)

Glossário e decisões de escopo para o redesign da landing page e páginas satélite. Não é spec nem detalhe de implementação — só vocabulário e limites de decisão firmados com o Leandro.

## Glossário

- **Convite** — solicitação de acesso antecipado ao app, feita por alguém que quer usar o Appointment enquanto ele ainda não está aberto ao público. Captura nome, e-mail, WhatsApp, papel desejado (profissional, empresa ou cliente) e **sistema operacional** (iOS/Android) — usado no futuro para mandar o link direto da loja certa. Não dá acesso automático — isso é trabalho futuro.
- **Consulta de Preço** — pedido de orçamento customizado feito por quem tem interesse comercial no plano profissional. Existe porque o site **não expõe mais preço fixo público** — a precificação passou a ser negociada por perfil de cliente.
- **Notificação de lead** — sempre que um Convite ou Consulta de Preço é enviado, o backend dispara um e-mail (via Resend, reaproveitando o domínio `send.lnascimento.com.br` já verificado) para o Gmail pessoal do Leandro, e grava uma cópia local em arquivo como backup silencioso caso o envio falhe.

## Decisões de escopo firmadas

- O redesign cobre o **site inteiro** (home + `sobre`, `investidores`, `profissionais`, `empresas`, `publico`), não só a home — o site é pequeno o suficiente para ir tudo junto.
- A **paleta atual (bordô do logo) é mantida**; o que muda é tipografia, layout, espaçamento e modernização visual.
- Preço fixo (R$39/R$49 + 5%) **sai da home** — vira captação de lead via **Consulta de Preço**, não uma tabela pública.
- App ainda não está aberto ao público — CTA primário da home é **Convite**, não "baixe o app" (isso vem depois, quando houver link de loja).

## Infraestrutura

- Stack alvo: **React + Vite**, buildado e servido por um único serviço **Node/Express** dentro de um container Docker (mesmo container serve os assets estáticos e a API dos formulários).
- Deploy no **mesmo droplet DigitalOcean da produção do Appointment** (`appointment-prod`, `143.110.153.41`, host `appointment-debian-s-1vcpu-2gb-sfo3-01`) — hoje esse droplet serve o site como HTML estático via Apache; troca só o apontamento do proxy pro novo container.
- Notificação de lead por e-mail via Resend — ver [ADR 0001](docs/adr/0001-notificacao-de-leads-por-email-sem-banco.md). Credenciais em `.env` (fora do git, ver `.env.example`).
- `/api/invites` e `/api/pricing-inquiries` são **server routes nativas do TanStack Start** (`createServerFileRoute(...).methods({...})`, `src/routes/api/*.ts`) — mesmo processo Node que serve as páginas, sem container/porta extra. **Não validado por build real** (esta máquina não tem Node/Docker utilizável localmente) — a primeira validação de que a API compila é o `docker build` no droplet, durante o deploy.

## Páginas legais (LGPD)

`public/privacy.html`, `public/politica-de-privacidade.html` e `public/termos-legais.html` **não vieram do Lovable** — são as páginas reais de Política de Privacidade e Termos de Uso (CNPJ, LGPD, menção a Asaas/Firebase/DigitalOcean como operadores de dados), encontradas **não versionadas** direto em `/var/www/html` no droplet de produção (deploy manual antigo, nunca commitado). Muito provavelmente linkadas nas fichas do app nas lojas (App Store/Play Store exigem URL de política de privacidade) — por isso foram preservadas nos mesmos paths (`/privacy.html`, `/politica-de-privacidade.html`, `/termos-legais.html`) em vez de descartadas. `politica-de-privacidade.html` e `termos-legais.html` também dependem de `public/assets/images/a-logo-final.png` (path relativo `assets/images/...`, replicado só pra essas 2 páginas).

Pendência conhecida: o texto de `politica-de-privacidade.html` se autorreferencia como `https://marcaumappointment.com/politica-de-privacidade` (sem `.html`) — não configurei essa rota extensionless, só o `.html` original. Verificar se algo realmente depende dessa URL exata antes de considerar resolvido.

## Tela de carregamento (preloader)

As duas versões abrem com a **mesma tela de carregamento**: fundo no vermelho da própria versão (v1 no bordô `#81000d` do `--primary`; v2 no `#902323` do `--appointment-primary`), logo ao centro, **contador de 0 a 100%** e um anel de progresso em **three.js** girando em volta.

Decisões:

- **O vermelho aparece no primeiro frame, sem JavaScript** — quem pinta é `html.appt-preloading::before` (CSS inline no `<head>`), não o elemento da tela. Assim o site nunca pisca o conteúdo antes de o loader cobrir.
- **A porcentagem é medida, não cronometrada.** Vem de sinais reais: quantos assets declarados pelo documento já apareceram no Resource Timing, mais `DOMContentLoaded`, `document.fonts.ready` e o evento `load`. Chega a 100% só quando os portões fecham. Imagem `loading=lazy` fora da tela fica **de fora da conta** (o loader trava o scroll, então ela nunca carregaria) e há teto de 12 s — ninguém fica preso atrás da tela.
- **three é enfeite, não requisito.** O contador e a barra funcionam sem WebGL e sem o bundle da engine; quando o three chega, o anel entra e a barra some. Sem WebGL, a barra continua.
- **Um código só para as duas versões** (`src/lib/preloader/`): v1 renderiza a marcação no SSR e importa three como chunk separado; v2, que é espelho estático, recebe o mesmo HTML/CSS/JS injetado por `npm run build:v2-preloader`.

## v1 vs v2

O repo hospeda **duas versões** do site, decisão do Leandro em 10/08 (ele gostou de dois designs diferentes gerados no Lovable):

- **v1** (raiz do domínio, `/`) — o design "oficial", com o fluxo de Convite/Consulta de Preço descrito acima. Fonte completa em `src/` (TanStack Start), buildada e servida por Node.
- **v2** (`v2.marcaumappointment.com`) — um design alternativo mais editorial, do projeto Lovable "See My Project!". **Não tem as mesmas regras de negócio do v1** (não tem os formulários de Convite/Consulta de Preço — tem CTA "Baixar o app" com estado "em breve" e um form de contato de investidor via mailto). É um espelho estático pré-buildado, não código-fonte — ver `site-v2/README.md`.
