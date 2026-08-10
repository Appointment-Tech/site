import { useState, type FormEvent } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/forms/InviteForm";

type Status = "idle" | "loading" | "success" | "error";

const portes = [
  "Só eu",
  "2 a 5 agendas",
  "6 a 20 agendas",
  "Mais de 20 agendas",
];

export function PricingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [porte, setPorte] = useState<string>("Só eu");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    atividade: "",
    mensagem: "",
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const e: Record<string, string> = {};
    if (form.nome.trim().length < 2) e['nome'] = "Conta pra gente seu nome.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e['email'] = "E-mail inválido.";
    const digits = form.whatsapp.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) e['whatsapp'] = "WhatsApp com DDD, por favor.";
    if (form.atividade.trim().length < 2) e['atividade'] = "Qual é o seu tipo de negócio?";
    if (form.mensagem.length > 1000) e['mensagem'] = "Máximo de 1000 caracteres.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/pricing-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          whatsapp: form.whatsapp.trim(),
          atividade: form.atividade.trim(),
          porte,
          mensagem: form.mensagem.trim(),
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
    } catch {
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
        <h3 className="mt-4 text-xl font-semibold">Recebemos sua consulta</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Vamos analisar seu perfil e voltar com uma proposta desenhada para o seu porte de
          operação.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="p-nome" label="Nome" error={errors['nome']}>
          <Input id="p-nome" value={form.nome} onChange={set("nome")} maxLength={100} />
        </Field>
        <Field id="p-email" label="E-mail" error={errors['email']}>
          <Input
            id="p-email"
            type="email"
            value={form.email}
            onChange={set("email")}
            maxLength={255}
          />
        </Field>
        <Field id="p-whatsapp" label="WhatsApp" error={errors['whatsapp']}>
          <Input
            id="p-whatsapp"
            inputMode="tel"
            value={form.whatsapp}
            onChange={set("whatsapp")}
            maxLength={20}
            placeholder="(11) 90000-0000"
          />
        </Field>
        <Field id="p-atividade" label="Tipo de negócio ou atividade" error={errors['atividade']}>
          <Input
            id="p-atividade"
            value={form.atividade}
            onChange={set("atividade")}
            maxLength={120}
            placeholder="Clínica odontológica, personal trainer…"
          />
        </Field>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Porte (profissionais ou agendas)</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {portes.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPorte(p)}
              aria-pressed={porte === p}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                porte === p
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </fieldset>

      <Field id="p-mensagem" label="Mensagem (opcional)" error={errors['mensagem']}>
        <Textarea
          id="p-mensagem"
          value={form.mensagem}
          onChange={set("mensagem")}
          maxLength={1000}
          rows={4}
          placeholder="Como funciona sua agenda hoje? O que mais te incomoda?"
        />
      </Field>

      {status === "error" && (
        <p className="text-sm text-destructive">
          Não conseguimos enviar agora. Tente de novo em instantes.
        </p>
      )}

      <Button type="submit" size="lg" variant="secondary" className="w-full" disabled={status === "loading"}>
        {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enviar consulta de preço
      </Button>
      <p className="text-xs text-muted-foreground">
        Não publicamos tabela de preços: cada proposta é construída a partir do seu perfil e do
        tamanho da sua operação.
      </p>
    </form>
  );
}
