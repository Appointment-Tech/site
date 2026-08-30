import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type InviteRole = "profissional" | "empresa" | "cliente";

const roles: { value: InviteRole; label: string; hint: string }[] = [
  { value: "profissional", label: "Profissional", hint: "atendo por conta própria" },
  { value: "empresa", label: "Empresa", hint: "temos uma equipe" },
  { value: "cliente", label: "Cliente", hint: "quero marcar horário" },
];

export function InviteDialog({
  trigger,
  defaultRole = "profissional",
}: {
  trigger: ReactNode;
  defaultRole?: InviteRole;
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<InviteRole>(defaultRole);
  const [os, setOs] = useState<"ios" | "android">("android");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Envia de verdade para POST /api/invites. Um formulário que apenas mostra
   * "enviado" sem enviar é pior que nenhum formulário: a pessoa fica esperando
   * um convite que ninguém pediu.
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = new FormData(event.currentTarget);
    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.get("nome"),
          email: form.get("email"),
          whatsapp: form.get("whatsapp"),
          perfil: role,
          sistema_operacional: os,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "não foi possível enviar agora");
      }

      setOpen(false);
      toast.success("Acesso solicitado", {
        description: "Assim que abrirmos sua leva, você recebe o acesso.",
      });
    } catch (cause) {
      // O diálogo continua aberto com o que já foi digitado: fechar aqui
      // obrigaria a pessoa a preencher tudo de novo para tentar outra vez.
      setError(cause instanceof Error ? cause.message : "não foi possível enviar agora");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-[var(--radius-xl)] border-border bg-card sm:max-w-[30rem]">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl">Solicitar acesso</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            O Appointment ainda não está nas lojas: o acesso é liberado por convite, em levas, por
            ordem de entrada.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-2 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="invite-nome">Nome</Label>
            <Input
              id="invite-nome"
              name="nome"
              required
              autoComplete="name"
              placeholder="Como te chamamos"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email">E-mail</Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="voce@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-whats">WhatsApp</Label>
            <Input
              id="invite-whats"
              name="whatsapp"
              type="tel"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="(11) 90000-0000"
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Papel desejado</legend>
            <RadioGroup
              value={role}
              onValueChange={(value) => setRole(value as InviteRole)}
              className="grid gap-2"
            >
              {roles.map((item) => (
                <Label
                  key={item.value}
                  htmlFor={`role-${item.value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-border bg-background p-3 has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
                >
                  <RadioGroupItem id={`role-${item.value}`} value={item.value} />
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className="text-xs font-normal text-muted-foreground">{item.hint}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Sistema operacional</legend>
            <RadioGroup
              value={os}
              onValueChange={(value) => setOs(value as "ios" | "android")}
              className="grid grid-cols-2 gap-2"
            >
              {[
                { value: "ios", label: "iOS" },
                { value: "android", label: "Android" },
              ].map((item) => (
                <Label
                  key={item.value}
                  htmlFor={`os-${item.value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-border bg-background p-3 text-sm font-semibold has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
                >
                  <RadioGroupItem id={`os-${item.value}`} value={item.value} />
                  {item.label}
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          {error ? (
            <p
              role="alert"
              className="rounded-[var(--radius-md)] bg-primary-soft px-3 py-2 text-sm text-primary"
            >
              Não deu para enviar: {error}. Tente de novo em instantes.
            </p>
          ) : null}

          <Button type="submit" variant="brand" size="lg" className="w-full" disabled={sending}>
            {sending ? "Enviando…" : "Quero meu acesso"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Sem cobrança agora. Usamos seus dados só para liberar o acesso.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
