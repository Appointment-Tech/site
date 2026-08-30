import { createFileRoute } from "@tanstack/react-router";

import { HeroTimeScene } from "@/components/home/HeroTimeScene";
import { BookingStory } from "@/components/home/BookingStory";
import { UnifiedTimeline } from "@/components/home/UnifiedTimeline";
import { AudienceJourney } from "@/components/home/AudienceJourney";
import { BeforeAfterFlow } from "@/components/home/BeforeAfterFlow";
import { FinalCTA } from "@/components/home/FinalCTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Appointment — seu tempo vale mais" },
      {
        name: "description",
        content:
          "Organize compromissos, conecte pessoas e dedique seu tempo ao que realmente importa. Agendamento e pagamento por cartão ou PIX no mesmo app, para profissionais, empresas e clientes.",
      },
      { property: "og:title", content: "Appointment — seu tempo vale mais" },
      {
        property: "og:description",
        content:
          "Marcar um Appointment é tão fácil quanto mandar uma mensagem. Agenda, confirmação, lembrete e pagamento num fluxo só.",
      },
    ],
  }),
  component: Home,
});

/**
 * A home é uma narrativa em seis capítulos, contada pelo scroll.
 *
 * O fio é um relógio: começa acelerado e cercado de interrupções, abre as
 * folhas da agenda, vira o mostrador onde os compromissos se encaixam, gira
 * para mostrar os três públicos e termina como um halo — de pressão a espaço.
 *
 * Cada capítulo é um componente com a sua própria timeline de scroll, e todos
 * seguem a mesma regra: **o conteúdo é HTML real e completo sem animação
 * nenhuma**. Com `prefers-reduced-motion`, ou sem JavaScript, nada se perde —
 * o movimento reforça a leitura, nunca a substitui.
 */
function Home() {
  return (
    <>
      {/* 1. O tempo está correndo — e a agenda se abre. */}
      <HeroTimeScene />

      {/* 2. Marcar não deveria ser complicado. */}
      <BookingStory />

      {/* 3. Tudo no mesmo lugar. */}
      <UnifiedTimeline />

      {/* 4. Um produto, três perspectivas. */}
      <AudienceJourney />

      {/* 5. Do problema à confirmação. */}
      <BeforeAfterFlow />

      {/* 6. Seu tempo volta para você. */}
      <FinalCTA />
    </>
  );
}
