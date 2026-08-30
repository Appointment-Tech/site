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
  carteira: {
    src: "/telas/03-carteira-extrato.png",
    alt:
      "Tela de carteira do Appointment com saldo disponível de R$ 1.284,50, " +
      "um cartão de crédito e uma chave Pix cadastrados, e o extrato listando " +
      "recebimentos de atendimentos com data e horário.",
  },
  confirmado: {
    src: "/telas/04-atendimento-confirmado.png",
    alt:
      "Tela de detalhes de um atendimento confirmado no Appointment: consulta de " +
      "avaliação em 30/08 das 9h às 9h50, com aviso de que cancelamento e " +
      "reagendamento estão sem multa, o participante e o chat do agendamento.",
  },
  perfil: {
    src: "/telas/05-perfil-servicos.png",
    alt:
      "Perfil de uma profissional no Appointment, com cidade, endereços e a lista " +
      "de serviços com seus preços: consulta de avaliação R$ 180,00, sessão de " +
      "acompanhamento R$ 150,00 e avaliação física R$ 220,00.",
  },
} as const;
