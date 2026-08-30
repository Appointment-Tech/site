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

## v3 — o site dinâmico (em desenho, 29/08/2026)

Terceira versão do site, decidida em 29/08 numa entrevista de refinamento. Coexiste com as
outras duas em `v3.marcaumappointment.com` — **não substitui a v1 na raiz**. A decisão de
qual versão fica sendo a oficial é posterior e não faz parte deste trabalho.

### Glossário

- **Corrente** — cada um dos dois fluxos de partículas que atravessam a cena 3D em direções
  opostas: a corrente de **quem atende** (profissional autônomo ou empresa) e a de **quem
  marca** (cliente final). São a tradução visual dos dois lados que o Appointment junta.
  _Evitar_: "lado", "grupo", "público" para se referir ao objeto na cena — `public` continua
  significando o segmento de audiência das páginas (`/profissionais`, `/empresas`, `/publico`).
- **Colisão** (`collision`) — o ponto central da cena onde as duas correntes se encontram e se
  cristalizam no atendimento confirmado. É o momento de clímax da narrativa de scroll, e o que
  materializa ali é **uma tela real do app**, não uma ilustração.
  _Evitar_: "encontro", "match", "junção".
- **Cena** (`scene`) — a composição three.js persistente que vive por trás de todas as páginas
  da v3. Persistente é o ponto: ela **não é remontada** a cada navegação; a troca de rota move
  a câmera e reconfigura as correntes.
  _Evitar_: "canvas", "animação", "background".
- **Momento** (`beat`) — cada estado nomeado da cena ao qual um trecho da página está ancorado
  (correntes distantes → aproximação → colisão → confirmação → dispersão). O texto é escrito
  para os momentos, não o contrário.
  _Evitar_: "seção", "step", "frame".
- **Tela de vitrine** (`showcase screen`) — captura de uma tela **real** do app Flutter
  (`Appointment-Tech/app-r2d2`), gerada com dados fictícios e usada como textura na cena e nas
  páginas. Nunca é mockup desenhado, e nunca contém dado de cliente real.
  _Evitar_: "mockup", "print", "screenshot de marketing".
- **Modo de captura** (`screenshot mode`) — modo de execução do app que injeta dados fictícios
  determinísticos sem tocar em rede, existindo só para gerar as telas de vitrine.
  _Evitar_: "modo demo", "mock", "flavor de teste".

### Decisões de escopo firmadas

- **Coexiste, não substitui.** v3 sobe em `v3.marcaumappointment.com`, ao lado de v1 (raiz) e
  v2. Custo aceito: um terceiro container no droplet de 1 vCPU / 2 GB.
- **Fonte no repo, não espelho.** O Lovable gera a base visual e ela entra em `src/` como
  código-fonte via GitHub sync. A camada three.js, o scroll e as transições são escritos aqui.
  Isso existe explicitamente para **não repetir o v2**, que virou espelho estático e por isso
  não pode ser evoluído (ver `site-v2/README.md`).
- **Cobre as 6 páginas** — home, `sobre`, `profissionais`, `empresas`, `publico`, `investidores`.
- **Metáfora: os dois lados se encontram.** Descartadas a grade de horários que se preenche, o
  dia que passa com o scroll e a órbita de horas — ver ADR 0002.
- **Copy reescrito** para caber nos momentos da animação. A mensagem e os argumentos da v1
  continuam valendo; o que muda é o recorte e o ritmo das frases.
- **CTA primário continua Convite.** O app ainda não está nas lojas, então não há botão de
  loja. A Consulta de Preço segue sendo o caminho das empresas.
- **A vitrine é o app de verdade.** As telas vêm de captura do Flutter rodando em emulador,
  com dados fictícios — ver ADR 0003.
