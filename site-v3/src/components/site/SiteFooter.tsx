import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
import { InviteDialog } from "@/components/site/InviteDialog";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 measure text-sm text-muted-foreground">
              Agendamento e pagamento no mesmo lugar. Cartão e PIX via ASAAS.
            </p>
            <InviteDialog
              trigger={
                <Button variant="brand" className="mt-5 rounded-full">
                  Solicitar acesso
                </Button>
              }
            />
          </div>

          <nav aria-label="Quem atende">
            <h2 className="text-sm font-semibold">Quem atende</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/profissionais" className="hover:text-foreground">
                  Profissionais autônomos
                </Link>
              </li>
              <li>
                <Link to="/empresas" className="hover:text-foreground">
                  Empresas e equipes
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Quem marca">
            <h2 className="text-sm font-semibold">Quem marca</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/publico" className="hover:text-foreground">
                  Marcar um horário
                </Link>
              </li>
              <li>
                <Link to="/publico" hash="pagamento" className="hover:text-foreground">
                  Pagamento e comprovante
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Appointment">
            <h2 className="text-sm font-semibold">Appointment</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/sobre" className="hover:text-foreground">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/investidores" className="hover:text-foreground">
                  Investidores
                </Link>
              </li>
              {/*
                As páginas legais são HTML estático herdado da produção, servido
                fora do roteador — por isso <a>, não <Link>. Elas existem nesses
                caminhos exatos porque as fichas das lojas apontam para eles
                (ver CONTEXT.md), então mudar a URL quebraria o app nas lojas.
              */}
              <li>
                <a href="/politica-de-privacidade.html" className="hover:text-foreground">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="/termos-legais.html" className="hover:text-foreground">
                  Termos de Uso
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Appointment. Todos os direitos reservados.</p>
          <p>Ainda não estamos nas lojas. O acesso é por convite.</p>
        </div>
      </div>
    </footer>
  );
}
