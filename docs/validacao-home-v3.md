# Home v3 — relatório de validação

Estado do código no momento desta medição: 3ª rodada de refinamento concluída.
Todos os números abaixo foram **medidos** neste build, não estimados.

---

## 1. Arquitetura de sincronização

Quatro causas de dessincronia foram identificadas e corrigidas:

1. **`scrub` numérico separava dois relógios.** Com `scrub: 0.4`, o `onUpdate` do
   ScrollTrigger recebe o progresso **cru** — que ia para o `setState` do React —
   enquanto a animação do GSAP é suavizada em direção a esse valor. Texto e
   indicador trocavam no instante do scroll; o visual chegava até 0,4 s depois.
2. **Dois ScrollTriggers na mesma cena.** Na agenda, o estado vinha de
   `top 65%`→`bottom 75%` (scrub 0.5) e o ponteiro de `top 70%`→`bottom 70%`
   (scrub 0.6). Início, fim e suavização diferentes: nunca estiveram em fase.
3. **Durações de transição CSS diferentes** no mesmo conjunto semântico
   (chip 300 ms, texto 500 ms).
4. **Troca de `src` de `<img loading="lazy">`** como visual de um estado: a
   captura seguinte só começava a baixar no instante da troca.

**Correção** — `src/lib/cena.ts`: **um** ScrollTrigger, **sem `scrub`**. No mesmo
`onUpdate`, o progresso contínuo vai para a custom property CSS `--progresso`
(sem render de React; move ponteiro e arco) e o índice discreto é derivado do
**mesmo** `self.progress`. Histerese de 0,012 evita oscilação sobre o limiar.

### Preload e decodificação das telas — CONFIRMADO

`loading="lazy"` foi **removido**. As três capturas do capítulo 2 são baixadas e
passam por `img.decode()` na montagem do componente (`CAPTURAS`, no escopo do
módulo, consumidas por um `useEffect` em `PalcoTelas`). As telas ficam todas
montadas e trocam por **opacidade** — nenhuma troca de `src` acontece durante a
cena, então o aparelho nunca fica vazio.

---

## 2. Invariante de sincronia

`data-estado`, `data-copy-ativo`, `data-visual-ativo` e `data-indicador-ativo`
são expostos no DOM. Varredura a **1% (100 amostras)**, **descendo e subindo**:

| Resolução | Resultado |
|---|---|
| 1440 × 900 | ✓ invariante mantido em todas as amostras, nos 2 sentidos |
| 1920 × 1080 | ✓ |
| 820 × 1180 | ✓ |
| 390 × 844 | ✓ |

Zero erro de console e zero falha de rede em todas as varreduras.

---

## 3. Intervalos e permanência dos estados

Medido em 1440 × 900. Altura da página: **11876 px** (10976 px roláveis; 1% ≈ 110 px).

| Cena | Estado | Início | Permanência | Rolagem |
|---|---|---|---|---|
| passos | encontre | 1% | 6% | ~658 px |
| passos | escolha | 7% | 3% | ~329 px |
| passos | agende | 10% | 3% | ~329 px |
| passos | confirme | 13% | 4% | ~439 px |
| passos | confirmado | 17% | 5% | ~548 px |
| agenda | livres | 22% | 12% | ~1317 px |
| agenda | escolhido | 34% | 5% | ~549 px |
| agenda | confirmado | 39% | 5% | ~549 px |
| agenda | remarcado | 44% | 7% | ~768 px |
| publicos | profissional | 51% | 14% | ~1536 px |
| publicos | empresa | 65% | 7% | ~768 px |
| publicos | cliente | 72% | 13% | ~1427 px |

As fatias têm **peso por estado** (`pesos` em `useCenaSincronizada`): os estados
finais carregam mais informação e, com fatias iguais, duravam menos de um
segundo. Razão entre o primeiro estado e os demais: **2:1** em `passos` e
`publicos`, **2,4:1** em `agenda` (era 4:1, 2,5:1 e 3,25:1).

O primeiro estado de cada cena é maior porque acumula a **aproximação** — o
período em que a cena já está na tela e ainda não prendeu. É o estado de
repouso legítimo (a agenda começa, de fato, com horários livres).

---

## 4. Auditoria de cor

Medida por **croma** (`max − min`), amostra 240 × 150. A primeira versão usava
saturação HSL e classificava `#fff6f7` — que o olho lê como branco — como
vermelho, porque a saturação HSL dispara perto do branco (0,87).

| Capítulo | Vermelho saturado | Verde | Lavagem suave |
|---|---|---|---|
| Hero | 1,4% | 0% | 4,9% |
| Quatro passos | 0,9 – 1,9% | 0 – 0,2% | 3,5 – 11,9% |
| Agenda | 1 – 2,3% | 0 – 0,1% | 9,2 – 9,5% |
| Públicos | 1,7 – 8,5% | 0,2 – 0,3% | 33,1 – 39,5% |
| **O ruído vira interface** | **92,5%** | 0,1% | 6,4% |
| Encerramento | 2,3% | 0,2% | 46,1% |

O capítulo "Quatro passos" tinha 59 – 74% de lavagem rosa e lia como "página
rosa". O fundo voltou ao branco quente e o vermelho ficou **concentrado num
halo atrás do aparelho** — a lavagem caiu para 3,5 – 11,9%.

O verde está restrito ao selo "Confirmado". A regra anterior
(`passo do item < passo atual → verde`) deixava quase todos os seis cartões da
agenda verdes. O chip de horário ganhou o estado `ocupado` (riscado, neutro):
pintar horário ocupado de verde invertia o sentido.

---

## 5. Contraste da seção "O ruído vira interface"

Medido por pixel, sobre a captura real, com luminância relativa WCAG.

| Elemento | Contraste | AA (4,5:1) |
|---|---|---|
| Texto do ruído | 5,9:1 | ✓ |
| Horários (07:15, 14:00, 22:08) | 5,3 – 5,9:1 | ✓ |
| Rótulos das peças resolvidas | 6,2:1 | ✓ |

A causa da falha anterior (2,3 – 2,7:1) era o GSAP apagar o **contêiner
inteiro** para `opacity: 0.62`, o que derrubava texto e fundo juntos sobre o
vinho escuro. O ruído agora recua por **posição** (`xPercent`), não por
apagamento do texto. Nenhum elemento da seção é focável.

---

## 6. Acessibilidade e movimento reduzido

| Verificação | Resultado |
|---|---|
| `prefers-reduced-motion: reduce` | 7066 px vs 11876 px — **redução de 41%** |
| GSAP sob movimento reduzido | **não é baixado** |
| Elementos interativos | 24, **0 sem rótulo acessível** |
| Rolagem horizontal | ausente nas 4 resoluções |
| Painel `?debugScroll=1` | ausente sem a query, presente com ela |

---

## 7. Portão de qualidade

| Comando | Resultado |
|---|---|
| `npm run lint` | **exit 0** — 1 warning pré-existente (`ui/button.tsx`, react-refresh) |
| `npm run typecheck` | **0 erros** nos arquivos desta rodada |
| `npm run build` | **exit 0** |

🚨 Dois erros de tipo **pré-existentes** permanecem em `src/routes/api/invites.ts`
e `src/routes/api/pricing-inquiries.ts` (índice de assinatura em `Record<string,
unknown>`). São de código de captação de leads, anterior a esta rodada e fora do
escopo dela — não foram tocados.

O script `typecheck` foi adicionado ao projeto nesta rodada: o `vite build` não
faz checagem de tipo, e um erro que ele deixava passar chegou a derrubar a
página inteira em runtime.

---

## 8. Evidências

Todas geradas a partir deste mesmo build. Os binários **não são versionados**
(ficam em `site-v3/.validacao/`, que está no `.gitignore`): são regeneráveis
pelos harnesses e pesam ~6 MB.

| Arquivo | Conteúdo |
|---|---|
| `home-v3-scroll.webm` | **40 s**, 400 quadros a 10 fps, **16 paradas** com ~1,1 s de permanência em cada estado |
| `contact-sheet.png` | 80 quadros, um a cada **0,5 s**, com o horário e o estado de cada cena visíveis |
| `01-hero-inicial.png` … `16-encerramento.png` | os 16 estados, cada um com texto ativo e visual correspondente |

`03-encontre`, `05-agende` e `16-encerramento` foram reenquadrados: o critério
passou a ser o **título do estado inteiramente visível abaixo do header**, e a
posição é escolhida no **miolo** da faixa do estado. Escolher pela borda da
faixa caía dentro da banda de histerese — chegando de cima, o estado assentava
no seguinte e a evidência mostrava outro passo.

---

## 9. Aberto, aguardando decisão comercial

- **ASAAS** como processador de pagamento citado no site.
- As outras cinco páginas (`/profissionais`, `/empresas`, `/publico`, `/sobre`,
  `/investidores`) ainda não seguem esta linguagem visual.
- Linguagem de pagamento: condicionada nesta rodada ("Pagamento disponível
  neste serviço", "Opção de receber no ato do agendamento") por não haver
  evidência de que o pagamento seja universal em todo agendamento.
