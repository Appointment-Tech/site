# v2 — static mirror

Este diretório **não é código-fonte** — é um espelho estático (`wget --mirror`) do projeto Lovable "See My Project!" (`a10ca242-59a6-45ee-b92e-d17b1e39c4e0`), publicado em `https://appointment-v2.lovable.app` e baixado em 10/08/2026.

## Por que espelho e não fonte

O v2 usa binários (logo, fotos do time, telas do app) que o Lovable gerencia via seu próprio storage. A API do MCP não expõe download desses binários fora do editor autenticado — mas o **build publicado** é público. Em vez de reconstruir o projeto TanStack Start a partir do zero sem esses arquivos, espelhamos o HTML/CSS/JS/imagens já renderizados. Isso também bate com o que foi pedido: uma v2 mais simples, "em HTML mesmo".

## O que foi limpo no mirror

- Removido `~flock.js` e a tag `<script defer src="~flock.js" data-proxy-url="/~api/analytics">` de todas as páginas — é o beacon de analytics do Lovable (Tinybird), que reportaria dados dos visitantes pra conta deles. Não faz sentido manter isso rodando fora da hospedagem deles.

## Como servir

Arquivos como `empresas.html`, `sobre.html` etc. — mas a SPA (TanStack Router hidratado) navega por URL limpa (`/empresas`, não `/empresas.html`). O nginx precisa de fallback:

```nginx
location / {
    try_files $uri $uri.html $uri/ =404;
}
```

## Como atualizar

Se o design mudar no Lovable, republique o projeto (`deploy_project` no MCP) e rode de novo:

```bash
wget --mirror --page-requisites --convert-links --adjust-extension \
  --no-host-directories --directory-prefix=site-v2 \
  --domains=appointment-v2.lovable.app --no-parent -e robots=off \
  https://appointment-v2.lovable.app/
```

Depois repita a limpeza do `~flock.js` (ver histórico do commit que criou este README) **e rode `npm run build:v2-preloader`** — o mirror novo vem sem a tela de carregamento.

## `preloader/` é gerado, não espelhado

`preloader/scene.js` e `preloader/logo.png`, e os blocos entre `<!--appt-preloader:head-->` e `<!--appt-preloader:body-->` dentro de cada `.html`, **não vêm do Lovable**: são a tela de carregamento, gerada de `src/lib/preloader/` por `scripts/build-v2-preloader.mjs`. Não edite à mão — mexa na fonte e rode:

```bash
npm run build:v2-preloader
```

O script é idempotente: ele remove o bloco anterior antes de injetar o novo, então rodar duas vezes não duplica nada.
