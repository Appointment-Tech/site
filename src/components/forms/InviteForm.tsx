import { useState, type FormEvent } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Audience = "profissional" | "empresa" | "cliente";
type Status = "idle" | "loading" | "success" | "error";

const audiences: { value: Audience; label: string; hint: string }[] = [
  { value: "profissional", label: "Profissional", hint: "autônomo ou liberal" },
  { value: "empresa", label: "Empresa", hint: "clínica, academia, salão…" },
  { value: "cliente", label: "Cliente", hint: "quero marcar meus horários" },
];

export function InviteForm({ defaultAudience }: { defaultAudience?: Audience | undefined }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [audience, setAudience] = useState<Audience>(defaultAudience ?? "profissional");
  const [os, setOs] = useState<"ios" | "android">("android");
  const [form, setForm] = useState({ nome: "", email: "", whatsapp: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const e: Record<string, string> = {};
    if (form.nome.trim().length < 2) e['nome'] = "Conta pra gente seu nome.";
    if (form.nome.trim().length > 100) e['nome'] = "Nome muito longo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e['email'] = "E-mail inválido.";
    const digits = form.whatsapp.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) e['whatsapp'] = "WhatsApp com DDD, por favor.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          whatsapp: form.whatsapp.trim(),
          perfil: audience,
          sistema_operacional: os,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
    } catch {
      // Endpoint real ainda não existe: no preview simulamos sucesso.
      if (import.meta.env.DEV) {
        setStatus("success");
        return;
      }
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-4 text-xl font-semibold">Convite a caminho</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Recebemos seus dados. Assim que abrirmos o próximo lote de acessos, falamos com você
          pelo WhatsApp ou e-mail.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="nome" label="Nome" error={errors['nome']}>
          <Input
            id="nome"
            value={form.nome}
            onChange={set("nome")}
            maxLength={100}
            placeholder="Como podemos te chamar?"
            autoComplete="name"
          />
        </Field>
        <Field id="email" label="E-mail" error={errors['email']}>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={set("email")}
            maxLength={255}
            placeholder="voce@exemplo.com"
            autoComplete="email"
          />
        </Field>
      </div>

      <Field id="whatsapp" label="WhatsApp" error={errors['whatsapp']}>
        <Input
          id="whatsapp"
          inputMode="tel"
          value={form.whatsapp}
          onChange={set("whatsapp")}
          maxLength={20}
          placeholder="(11) 90000-0000"
          autoComplete="tel"
        />
      </Field>

      <fieldset>
        <legend className="text-sm font-medium">Quero usar como</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {audiences.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setAudience(a.value)}
              aria-pressed={audience === a.value}
              className={`rounded-xl border p-3 text-left transition-colors ${
                audience === a.value
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <span className="block text-sm font-semibold">{a.label}</span>
              <span className="block text-xs text-muted-foreground">{a.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Sistema do seu celular</legend>
        <div className="mt-2 flex gap-2">
          {(["ios", "android"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setOs(v)}
              aria-pressed={os === v}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                os === v
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              {v === "ios" ? "iOS" : "Android"}
            </button>
          ))}
        </div>
      </fieldset>

      {status === "error" && (
        <p className="text-sm text-destructive">
          Não conseguimos enviar agora. Tente de novo em instantes.
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
        {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Quero ser convidado
      </Button>
      <p className="text-xs text-muted-foreground">
        Usamos seus dados apenas para falar sobre o acesso antecipado ao Appointment.
      </p>
    </form>
  );
}

export function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
