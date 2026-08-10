import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";

export function SiteFooter() {
  return (
    <footer className="surface-ink mt-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm text-ink-foreground/70">
            Qualidade de vida através do tempo bem administrado. Agendamento e pagamento no
            mesmo lugar, para quem atende e para quem é atendido.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-foreground">Para você</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/70">
            <li>
              <Link to="/profissionais" className="hover:text-ink-foreground">
                Profissionais
              </Link>
            </li>
            <li>
              <Link to="/empresas" className="hover:text-ink-foreground">
                Empresas
              </Link>
            </li>
            <li>
              <Link to="/publico" className="hover:text-ink-foreground">
                Clientes e pacientes
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-foreground">Institucional</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/70">
            <li>
              <Link to="/sobre" className="hover:text-ink-foreground">
                Sobre nós
              </Link>
            </li>
            <li>
              <Link to="/investidores" className="hover:text-ink-foreground">
                Investidores
              </Link>
            </li>
            <li>
              <a href="mailto:contato@marcaumappointment.com" className="hover:text-ink-foreground">
                contato@marcaumappointment.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-foreground/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-ink-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Appointment. Todos os direitos reservados.</span>
          <span>Pagamentos processados por ASAAS — cartão e PIX.</span>
        </div>
      </div>
    </footer>
  );
}
