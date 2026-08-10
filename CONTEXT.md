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
