# 0004 — A v3 herda o design system do app, não o bordô do site

- **Status:** aceita
- **Data:** 2026-08-29

## Contexto

O pedido da v3 é um site que "faça jus ao app". Ao ler o design system do app Flutter
(`Appointment-Tech/app-r2d2`, `lib/app/styles/`) ficou claro que **o app e o site não
compartilham paleta**:

| | site (v1 / v2) | app (`AppDesignTokens`) |
|---|---|---|
| primária | bordô `#81000d` / `#902323` | **`#E8153F`** (`reddishPink`) |
| gradiente | — | `#DD002C` → `#C10027` |
| fundo | claro neutro | `#FDFBF9` (branco quente) |

A divergência deixou de ser cosmética quando a v3 decidiu usar **telas reais do app como
conteúdo central** (ADR 0003): os screenshots entram na página já pintados de `#E8153F`, e
sobre um fundo bordô eles leem como corpo estranho — dois vermelhos próximos o bastante para
brigar e distantes o bastante para parecer erro.

O `CONTEXT.md` registra "a paleta atual (bordô do logo) é mantida", mas essa decisão foi
firmada para o **redesign da v1**, quando o site não exibia telas do app.

## Decisão

A v3 adota o design system do app como fonte da verdade visual: `primary #E8153F`,
`primarySoft #FFE9E9`, fundo `#FDFBF9`, superfície `#F4F2F0`, texto `#1C1515` e
`#776E6C`, borda `#E6E3E1`, semânticas (`success #1E7C50`, `warning #B07A20`,
`info #4077A3`, `destructive #76382E`), além da escala de raio (12 / 16 / 24 / pill) e das
sombras de card e de navegação.

O bordô fica restrito ao **logo**. Quem sai do site e abre o app vê a mesma marca.

Vale só para a v3 — v1 e v2 seguem como estão, e nada aqui as altera.

## Alternativas descartadas

- **Manter o bordô do site** — continuidade com v1, v2 e a tela de carregamento que já está em
  produção. Descartada porque obrigaria a tratar cada tela de vitrine com moldura ou filtro
  para não brigar com o fundo, ou seja: gastar esforço para esconder o app dentro do site que
  existe para mostrar o app.
- **Ponte entre as duas paletas** (bordô nas superfícies profundas, vermelho do app nas ações)
  — descartada por risco de virar duas marcas na mesma página, sem regra objetiva para
  arbitrar os casos de fronteira.
- **Decidir depois de ver as telas capturadas** — descartada por ser adiamento sem ganho: a
  incompatibilidade dos dois vermelhos é verificável nos tokens, não depende da imagem.

## Consequências

Fica mais fácil: compor as telas de vitrine na página; manter site e app coerentes quando um
dos dois mudar (os tokens têm origem única, o app).

Fica mais difícil: a v3 passa a destoar de v1 e v2, que continuam bordô — comparação lado a
lado vai parecer troca de marca, e é bom que pareça, porque é a proposta.

Passa a ser proibido: introduzir na v3 cor de marca que não exista em `AppDesignTokens` /
`AppColorScheme`. Cor nova entra no app primeiro.

Pendência conhecida: a tela de carregamento em produção usa o bordô de cada versão. Quando a
v3 ganhar a sua, ela deve nascer no vermelho do app — não no bordô.
