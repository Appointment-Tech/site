import { useEffect, useState } from "react";

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
/**
 * O véu pertence exclusivamente ao PRIMEIRO carregamento do documento. A flag
 * vive no módulo: se o React remontar este componente por qualquer motivo
 * (reconciliação após navegação, HMR), o véu não volta no meio da sessão.
 */
let veuJaConcluido = false;

export function Preloader() {
  const [ativo, setAtivo] = useState(!veuJaConcluido);

  useEffect(() => {
    if (veuJaConcluido) return;
    const handle = mountPreloader({
      theme: V3_THEME,
      loadThree: () => import("three"),
      // Os nós do véu (overlay e <style>) são desta árvore React: o teardown
      // imperativo os removia por fora e a PRIMEIRA navegação SPA fazia o
      // React reconciliar uma árvore mutilada — o markup voltava sem CSS,
      // como um logo solto e um "0% Carregando" no topo da página.
      managedByReact: true,
    });
    void handle.done.then(() => {
      veuJaConcluido = true;
      // Agora é o React quem tira os nós do documento, pelo caminho normal.
      setAtivo(false);
    });
    return () => handle.dispose();
  }, []);

  if (!ativo) return null;

  return (
    <div
      style={{ display: "contents" }}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: preloaderHtml(V3_THEME) }}
    />
  );
}
