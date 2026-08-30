# 0003 — Telas de vitrine capturadas do app real, com modo de captura

- **Status:** aceita
- **Data:** 2026-08-29

## Contexto

A v3 usa telas do app como conteúdo central — na colisão da cena 3D, o que se cristaliza é
uma tela de verdade (ver ADR 0002). Isso exige gerar imagens do app Flutter
(`Appointment-Tech/app-r2d2`, versão 3.14.0+119) rodando de fato, não mockups desenhados.

Duas restrições moldam a solução:

- **Screenshot de app real com agenda vazia não vende nada.** A tela precisa mostrar uma
  agenda povoada, com nomes, horários e valores plausíveis.
- **Dado de cliente real não pode aparecer num site público.** E o risco é concreto: o
  `docker-compose.yml` do app-r2d2 traz `extra_hosts` apontando `marcaumappointment.com` para
  `143.110.153.41` — ou seja, o ambiente de desenvolvimento fala com a **produção**. Capturar
  "logado no app como sempre" produziria imagens com dado real de gente real.

Levantamento do ambiente desta máquina (WSL2), feito em 29/08:

- `/dev/kvm` presente, 12 vCPU e 21 GB — emulador acelerado é viável.
- SDK Android em `~/Android/Sdk` com `platforms/android-36` (bate com o `compileSdk 36` do
  app), **mas sem `system-images/` e com `emulator/` vazio**.
- Existe `~/Android/Sdk/platforms/android-37.0`, pasta sintetizada que já quebrou o
  `avdmanager` em trabalho anterior com outro app Flutter.
- O `docker-compose.yml` do app-r2d2 não roda aqui como está: monta
  `/Users/leandro/Documents/upload-keystore.jks` (macOS) e `/var/www/app-r2d2`.

## Decisão

As telas de vitrine são geradas por um **modo de captura** dentro do próprio app: um modo de
execução que injeta um conjunto fixo de dados fictícios **sem tocar em rede** e navega até as
telas escolhidas, capturando cada uma.

Consequências diretas dessa escolha:

- A captura **não depende de backend nenhum** — nem produção, nem os três microserviços
  Laravel locais, nem homologação. Nada de rede significa nada de dado real, por construção e
  não por cuidado.
- As imagens são **determinísticas e regeneráveis**: quando a UI do app mudar, roda-se de novo
  e as telas do site acompanham, em vez de envelhecerem em silêncio.
- O trabalho atravessa **dois repositórios**: o modo de captura vive em `app-r2d2`; o site
  consome as imagens resultantes como assets versionados aqui.

As imagens entram no repo do site como **assets versionados**, não são buscadas em tempo de
build — o build do site não pode depender de um emulador de pé.

## Alternativas descartadas

- **Conta de demonstração na produção** — criar um profissional e um cliente fictícios na base
  real e capturar logado neles. Descartada porque planta dado fictício permanente na produção,
  contaminando métrica de negócio, e porque um deslize de navegação durante a captura pega
  tela com dado real.
- **Ambiente local com os `ms-*` no Docker e um seed de vitrine** — isolado e controlável, mas
  é a opção mais cara: exige subir três aplicações Laravel e escrever um seed que hoje não
  existe, só para tirar fotos.
- **Homologação** — descartada por não haver evidência de que exista um ambiente de
  homologação com dado fictício; o app roteia ambiente por Remote Config (`baseUrl`), não por
  header.
- **Mockups desenhados** — descartada pelo pedido explícito: o site precisa de telas do app
  real. Além disso, mockup desenhado envelhece sem ninguém perceber.
- **Buscar as imagens em tempo de build** — descartada: acoplaria o `docker build` do site,
  feito num droplet de 1 vCPU, a um emulador Android.

## Consequências

Fica mais fácil: atualizar a vitrine quando o app mudar; provar que o produto existe, num
momento em que ele ainda não está nas lojas e o CTA é Convite.

Fica mais difícil: o app passa a carregar um modo que só serve ao marketing, e ele precisa ser
mantido vivo conforme as telas evoluem. O modo é inerte em build de release.

Passa a ser proibido: publicar no site qualquer captura feita contra a produção, e apontar o
app para `143.110.153.41` durante uma sessão de captura.
