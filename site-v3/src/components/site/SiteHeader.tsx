import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteDialog } from "@/components/site/InviteDialog";
import { Logo } from "@/components/site/Logo";

const nav = [
  { to: "/profissionais", label: "Profissionais" },
  { to: "/empresas", label: "Empresas" },
  { to: "/publico", label: "Para quem marca" },
  { to: "/sobre", label: "Sobre" },
  { to: "/investidores", label: "Investidores" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-3 sm:px-8">
        <Link to="/" className="shrink-0" aria-label="Appointment — página inicial">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="ml-auto hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-neutral-soft hover:text-foreground"
              activeProps={{ className: "text-foreground font-semibold bg-neutral-soft" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <InviteDialog
            trigger={
              <Button variant="brand" className="hidden rounded-full sm:inline-flex">
                Pedir convite
              </Button>
            }
          />
          <Button
            variant="quiet"
            size="icon"
            className="rounded-full lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav
          id="menu-mobile"
          aria-label="Principal (mobile)"
          className="border-t border-border bg-background lg:hidden"
        >
          <ul className="mx-auto flex w-full max-w-6xl flex-col px-5 py-2 sm:px-8">
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block border-b border-border/70 py-3 text-base text-foreground"
                  activeProps={{ className: "font-semibold text-primary" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="py-4 sm:hidden">
              <InviteDialog
                trigger={
                  <Button variant="brand" size="lg" className="w-full rounded-full">
                    Pedir convite
                  </Button>
                }
              />
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
