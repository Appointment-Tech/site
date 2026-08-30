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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PriceDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [porte, setPorte] = useState("2-5");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Envia para POST /api/pricing-inquiries.
   *
   * O contrato da API pede `atividade` (o ramo) e não tem campo para o nome da
   * empresa — por isso o formulário coleta o ramo explicitamente e o nome do
   * negócio entra rotulado no começo da mensagem, em vez de ser descartado.
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = new FormData(event.currentTarget);
    const empresa = String(form.get("empresa") ?? "").trim();
    const observacao = String(form.get("observacao") ?? "").trim();

    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/pricing-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.get("nome"),
          email: form.get("email"),
          whatsapp: form.get("whatsapp"),
          atividade: form.get("atividade"),
          porte,
          mensagem: [empresa && `Empresa: ${empresa}`, observacao].filter(Boolean).join("\n"),
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "não foi possível enviar agora");
      }

      setOpen(false);
      toast.success("Pedido enviado", {
        description: "Retornamos com a proposta pelo e-mail informado.",
      });
    } catch (cause) {
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
          <DialogTitle className="text-2xl">Consulta de preço</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            O valor depende de quantas agendas você opera. Respondemos com uma proposta.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-2 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="price-empresa">Empresa</Label>
            <Input id="price-empresa" name="empresa" required placeholder="Nome do negócio" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price-atividade">Ramo de atividade</Label>
            <Input
              id="price-atividade"
              name="atividade"
              required
              placeholder="Ex.: clínica de fisioterapia, academia, salão"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price-nome">Responsável</Label>
            <Input id="price-nome" name="nome" required autoComplete="name" placeholder="Quem fala com a gente" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price-email">E-mail</Label>
            <Input
              id="price-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="contato@empresa.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price-whats">WhatsApp</Label>
            <Input id="price-whats" name="whatsapp" type="tel" required inputMode="tel" placeholder="(11) 90000-0000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price-porte">Profissionais em agenda</Label>
            <Select value={porte} onValueChange={setPorte}>
              <SelectTrigger id="price-porte" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 profissional</SelectItem>
                <SelectItem value="2-5">2 a 5</SelectItem>
                <SelectItem value="6-20">6 a 20</SelectItem>
                <SelectItem value="20+">Mais de 20</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price-obs">O que você precisa resolver</Label>
            <Textarea
              id="price-obs"
              name="observacao"
              rows={3}
              placeholder="Ex.: três unidades, recepção sobrecarregada, muito no-show."
            />
          </div>

          {error ? (
            <p role="alert" className="rounded-[var(--radius-md)] bg-primary-soft px-3 py-2 text-sm text-primary">
              Não deu para enviar: {error}. Tente de novo em instantes.
            </p>
          ) : null}

          <Button type="submit" variant="brand" size="lg" className="w-full" disabled={sending}>
            {sending ? "Enviando…" : "Pedir proposta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
