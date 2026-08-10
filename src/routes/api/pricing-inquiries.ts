import { createServerFileRoute } from "@tanstack/react-start/server";
import { escapeHtml, notifyLead } from "@/lib/leads.server";

interface PricingInquiryPayload {
  nome: string;
  email: string;
  whatsapp: string;
  atividade: string;
  porte: string;
  mensagem: string;
}

// Mirrors the client-side validation in PricingForm.tsx.
function validate(body: unknown): { data: PricingInquiryPayload } | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "corpo invalido" };
  const b = body as Record<string, unknown>;

  const nome = typeof b["nome"] === "string" ? b["nome"].trim() : "";
  if (nome.length < 2 || nome.length > 100) return { error: "nome invalido" };

  const email = typeof b["email"] === "string" ? b["email"].trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "email invalido" };

  const whatsapp = typeof b["whatsapp"] === "string" ? b["whatsapp"].trim() : "";
  const digits = whatsapp.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) return { error: "whatsapp invalido" };

  const atividade = typeof b["atividade"] === "string" ? b["atividade"].trim() : "";
  if (atividade.length < 2 || atividade.length > 120) return { error: "atividade invalida" };

  const porte = typeof b["porte"] === "string" ? b["porte"].trim() : "";
  if (porte.length < 1 || porte.length > 60) return { error: "porte invalido" };

  const mensagemRaw = typeof b["mensagem"] === "string" ? b["mensagem"].trim() : "";
  if (mensagemRaw.length > 1000) return { error: "mensagem invalida" };

  return { data: { nome, email, whatsapp, atividade, porte, mensagem: mensagemRaw } };
}

export const ServerRoute = createServerFileRoute("/api/pricing-inquiries").methods({
  POST: async ({ request }) => {
    const body = await request.json().catch(() => null);
    const result = validate(body);
    if ("error" in result) {
      return Response.json({ ok: false, error: result.error }, { status: 400 });
    }

    const { data } = result;
    await notifyLead({
      kind: "pricing-inquiries",
      subject: `Nova consulta de preço — ${data.nome} (${data.atividade})`,
      html: `
        <p><strong>Nome:</strong> ${escapeHtml(data.nome)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>WhatsApp:</strong> ${escapeHtml(data.whatsapp)}</p>
        <p><strong>Atividade:</strong> ${escapeHtml(data.atividade)}</p>
        <p><strong>Porte:</strong> ${escapeHtml(data.porte)}</p>
        <p><strong>Mensagem:</strong> ${data.mensagem ? escapeHtml(data.mensagem) : "<em>(vazia)</em>"}</p>
      `.trim(),
      payload: data,
    });

    return Response.json({ ok: true });
  },
});
