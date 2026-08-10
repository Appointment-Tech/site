import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InviteForm } from "@/components/forms/InviteForm";
import { PricingForm } from "@/components/forms/PricingForm";

type Audience = "profissional" | "empresa" | "cliente";

export function InviteDialog({
  children,
  defaultAudience,
}: {
  children: ReactNode;
  defaultAudience?: Audience | undefined;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Quero ser convidado</DialogTitle>
          <DialogDescription>
            O Appointment está em acesso antecipado. Deixe seus dados e entramos em contato
            quando abrirmos o próximo lote.
          </DialogDescription>
        </DialogHeader>
        <InviteForm defaultAudience={defaultAudience} />
      </DialogContent>
    </Dialog>
  );
}

export function PricingDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Consulta de preço</DialogTitle>
          <DialogDescription>
            Preço no Appointment é conversado, não é tabela. Conte sobre sua operação e voltamos
            com uma proposta sob medida.
          </DialogDescription>
        </DialogHeader>
        <PricingForm />
      </DialogContent>
    </Dialog>
  );
}

export function CtaPair({
  audience,
  align = "start",
  showPricing = true,
}: {
  audience?: Audience | undefined;
  align?: "start" | "center";
  showPricing?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap gap-3 ${align === "center" ? "justify-center" : ""}`}
    >
      <InviteDialog defaultAudience={audience}>
        <Button size="lg">Quero ser convidado</Button>
      </InviteDialog>
      {showPricing && (
        <PricingDialog>
          <Button size="lg" variant="outline">
            Consulta de preço
          </Button>
        </PricingDialog>
      )}
    </div>
  );
}
