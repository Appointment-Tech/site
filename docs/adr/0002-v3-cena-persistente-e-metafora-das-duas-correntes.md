# 0002 — v3: cena three.js persistente com a metáfora das duas correntes

- **Status:** aceita
- **Data:** 2026-08-29

## Contexto

O site tem duas versões vivas (v1 na raiz, v2 em subdomínio) e ambas são páginas
essencialmente estáticas: rolam, mas não se movem. O pedido para a v3 é um site de
apresentação **dinâmico**, que "faça jus ao app" e cujo layout remeta ao core business.

O core business do Appointment é tempo administrado: agendamento e pagamento no mesmo app,
ligando três públicos — profissional autônomo, empresa com várias agendas e cliente final.
Uma linguagem visual precisava traduzir isso sem virar enfeite genérico.

Restrições reais que limitam a resposta:

- O droplet de produção tem **1 vCPU e 2 GB**, já serve v1 e v2, e os builds precisam ser
  feitos um por vez por causa de RAM. A v3 será um terceiro container ali.
- O público-alvo entra majoritariamente por celular, onde WebGL contínuo custa bateria.
- A v2 provou que design gerado e espelhado estaticamente **não pode ser evoluído**: um novo
  `wget --mirror` apaga qualquer coisa injetada depois (foi o que aconteceu com o preloader).
- Já existe uma cena three.js em produção — o anel de progresso do preloader (ADR do
  preloader documentado em `CONTEXT.md`), com o princípio "three é enfeite, não requisito".

## Decisão

A v3 é conduzida pela metáfora das **duas correntes que se encontram**: um fluxo de partículas
representando quem atende e outro representando quem marca atravessam a cena em direções
opostas e se cristalizam, no centro, no atendimento confirmado — que é materializado por uma
**tela real do app** (ver ADR 0003).

A cena three.js é **persistente e única**: vive acima do roteador, não é remontada a cada
navegação. Trocar de rota não recarrega a cena — move a câmera e reconfigura as correntes.
Cada página de público entra pela corrente que lhe corresponde: `/profissionais` e `/empresas`
pelo lado de quem atende, `/publico` pelo lado de quem marca.

O conteúdo é ancorado em **momentos** nomeados da cena (correntes distantes → aproximação →
colisão → confirmação → dispersão), e o texto é reescrito para caber neles.

A v3 sobe em `v3.marcaumappointment.com`, coexistindo com v1 e v2, e nasce como código-fonte
em `src/` — o Lovable gera a base visual via GitHub sync, e a camada de movimento é escrita
no repo.

### O que a decisão obriga

- **A cena degrada, nunca bloqueia.** Sem WebGL, o site inteiro continua funcionando: o
  conteúdo é HTML real e a cena é uma camada por cima. Mesmo princípio já validado no
  preloader.
- **`prefers-reduced-motion` corta o movimento**, não o conteúdo: a cena congela num quadro
  composto e as transições viram corte seco.
- **Orçamento de bundle e de frame.** three entra como chunk separado, servido comprimido
  (o servidor Node do nitro não comprime sozinho — `compressPublicAssets` é obrigatório, como
  já foi preciso no preloader). A cena pausa quando fora da viewport ou com a aba oculta.
- **Contagem de partículas é configurável por perfil de dispositivo**, não fixa no código.

## Alternativas descartadas

- **A grade de horários que respira** — blocos 3D de slots preenchendo os buracos vagos.
  Descartada apesar de ser a leitura mais literal do produto: entrega bem a dor de quem
  atende (vacância, no-show) e mal a de quem marca, e o site precisa falar com os três
  públicos com o mesmo peso.
- **O dia que passa com o scroll** — a luz da cena indo de manhã a noite conforme se desce,
  entregando o argumento do 24/7. Descartada porque exigiria abrir mão do bordô da marca em
  boa parte da página: a paleta é premissa firmada desde o redesign da v1, e uma faixa de luz
  quente→noturna conflita com ela.
- **A órbita das horas** — anel de horas girando, dando continuidade direta ao anel do
  preloader. Descartada por ser a mais decorativa das quatro: bonita, mas não conta o que o
  produto faz. A continuidade com o preloader se resolve na transição de entrada, não
  reciclando a forma.
- **Espelhar o Lovable como o v2 fez** — descartada explicitamente: barata para começar e
  impossível de manter, com o agravante de que o three.js gerado pelo Lovable é fraco e cada
  republicação apagaria a camada de movimento.
- **Substituir a v1 na raiz** — descartada por ora: a v3 precisa ser comparada com as outras
  antes de virar a versão oficial. Consequência aceita: três containers no droplet.

## Consequências

Fica mais fácil: evoluir o design (é código, não espelho); reaproveitar as server routes de
lead (`/api/invites`, `/api/pricing-inquiries`) já existentes; manter as páginas LGPD.

Fica mais difícil: o custo de RAM do droplet passa a ter três sites; e a narrativa de scroll
amarra texto e animação — mudar um exige revisar o outro.

Passa a ser proibido: remontar a cena por navegação; publicar uma página da v3 cujo conteúdo
só exista dentro do WebGL; e injetar código na v3 por script de build sobre artefato gerado
(o erro estrutural da v2).
