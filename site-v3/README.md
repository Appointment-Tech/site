# site-v3 — a terceira versão do site

Terceira versão do site institucional do Appointment, servida em
`v3.marcaumappointment.com`. **Coexiste** com a v1 (raiz, em `../src`) e a v2
(`../site-v2`) — não substitui nenhuma das duas. Ver `../docs/adr/0002` e `0004`.

## Como esta pasta nasceu

A base visual foi gerada no Lovable (projeto `72a8153c-297f-43de-88c8-b35222bb32d4`,
"Appointment: Encontro Marcado") e **portada para cá como código-fonte**, não
espelhada. Isso é deliberado: a v2 virou espelho estático de um projeto Lovable e
por isso não pode ser evoluída — cada republicação apaga o que se injeta depois
(ver `../site-v2/README.md`). Aqui o código é nosso e o Lovable não é uma
dependência de runtime.

O que mudou no port, e por quê:

- **Removido o `lovable-error-reporting`** — telemetria da hospedagem deles.
- **404 e página de erro traduzidos** — vinham em inglês num site em português.
- **Os formulários passaram a enviar de verdade.** O `InviteDialog` e o
  `PriceDialog` gerados apenas mostravam um toast de sucesso sem chamar nada.
  Agora fazem `POST` em `/api/invites` e `/api/pricing-inquiries` (as mesmas
  server routes da v1, copiadas para cá), com estado de envio e de erro.
- **`PriceDialog` ganhou o campo "Ramo de atividade"**: a API exige `atividade`,
  que o formulário não coletava, e não tem campo para o nome da empresa — este
  entra rotulado no início da mensagem em vez de ser descartado.
- **`PhoneFrame` passou a exibir a imagem**, em `aspect-[9/20]` (era `9/19.5`)
  com `object-contain`: as capturas são 1080x2400 e `object-cover` cortaria o
  cabeçalho da tela, que é justamente o que prova o produto.
- **Links de Política de Privacidade e Termos** foram adicionados ao rodapé.
  São obrigatórios e as fichas das lojas apontam para esses caminhos exatos.
- **`vite.config.ts` veio da v1**, não do Lovable: é o que está provado em
  produção e traz o `compressPublicAssets` — o servidor Node do nitro não
  comprime nada sozinho.
- **`publico`, `sobre` e `investidores` foram escritas à mão** — o agente parou
  antes de gerá-las (os créditos do workspace acabaram).

## A estrutura de momentos

Todo conteúdo vive dentro de `<Beat>`, que rende uma
`<section data-beat="...">` com uma `<div data-scene-slot>` vazia por baixo e o
conteúdo em `z-10` por cima. Os momentos, na ordem da narrativa:

`distancia` → `aproximacao` → `colisao` → `confirmacao` → `dispersao`

É aí que a camada three.js pluga: as duas correntes (quem atende × quem marca)
colidem no momento `colisao`, onde se materializa uma tela real do app.

**Regra que a cena precisa respeitar:** o site tem que ficar completo e legível
sem nenhum JavaScript de animação. A cena é sempre uma camada por cima — nunca
um requisito para ler a página.

## Telas de vitrine

`public/telas/` guarda capturas do app real (`Appointment-Tech/app-r2d2`)
rodando em emulador no **modo de captura**, com dados fictícios e sem rede
(ver ADR 0003 e `lib/screenshot_mode/` no repo do app). Nunca são mockups, e
nunca contêm dado de cliente real. Para regenerá-las, recapture no emulador.

O mapa de telas, com os textos alternativos, fica em `src/lib/telas.ts`.
