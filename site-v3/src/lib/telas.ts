/**
 * As telas de vitrine: capturas do app real (Appointment-Tech/app-r2d2)
 * rodando em emulador no modo de captura, com dados fictícios e sem rede.
 * Ver ADR 0003. Regeneráveis — quando a UI do app mudar, recaptura-se.
 *
 * O `alt` descreve o que a tela mostra, não o fato de ser um screenshot:
 * quem usa leitor de tela precisa do conteúdo, não do formato.
 */
export const telas = {
  agenda: {
    src: "/telas/01-agenda-do-dia.png",
    alt:
      "Tela de agenda do Appointment mostrando quatro agendamentos no dia: " +
      "consulta de avaliação às 9h e sessão de acompanhamento às 10h30, ambas confirmadas, " +
      "e avaliação física às 14h, reservada.",
  },
  busca: {
    src: "/telas/02-busca-disponibilidade.png",
    alt:
      "Tela de busca do Appointment com categorias populares e cards de profissionais " +
      "exibindo a próxima data livre e os horários disponíveis — 9h, 10h30 e 14h — " +
      "com o botão de agendar ao lado.",
  },
} as const;
