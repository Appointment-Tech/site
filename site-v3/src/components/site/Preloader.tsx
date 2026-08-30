import { useEffect } from "react";

import { preloaderHtml } from "@/lib/preloader/markup";
import { mountPreloader } from "@/lib/preloader/mount";
import { V3_THEME } from "@/lib/preloader/theme";

/**
 * Tela de carregamento da v3.
 *
 * Mesmo mecanismo já em produção na v1 e na v2, com o tema da v3: a marcação
 * é renderizada no servidor, então o campo vermelho, o logo e um `0%` são
 * pintados antes de qualquer JavaScript rodar. Depois o efeito assume, conta o
 * progresso real e puxa o three como chunk separado para o anel.
 *
 * A diferença da v3 é a cor: ela abre no vermelho do app (ADR 0004), não no
 * bordô — a tela de carregamento é a primeira coisa que alguém vê, e abrir
 * numa marca para continuar em outra seria anunciar uma coisa e entregar outra.
 */
export function Preloader() {
  useEffect(() => {
    const handle = mountPreloader({
      theme: V3_THEME,
      loadThree: () => import("three"),
    });
    return () => handle.dispose();
  }, []);

  return (
    <div
      style={{ display: "contents" }}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: preloaderHtml(V3_THEME) }}
    />
  );
}
