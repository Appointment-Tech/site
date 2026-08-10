import { createServerFileRoute } from "@tanstack/react-start/server";
import { escapeHtml, notifyLead } from "@/lib/leads.server";

type Perfil = "profissional" | "empresa" | "cliente";
type SistemaOperacional = "ios" | "android";

interface InvitePayload {
  nome: string;
  email: string;
  whatsapp: string;
  perfil: Perfil;
  sistema_operacional: SistemaOperacional;
}

// Mirrors the client-side validation in InviteForm.tsx — never trust the
// client, the fetch could come from anywhere.
function validate(body: unknown): { data: InvitePayload } | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "corpo invalido" };
  const b = body as Record<string, unknown>;

  const nome = typeof b["nome"] === "string" ? b["nome"].trim() : "";
  if (nome.length < 2 || nome.length > 100) return { error: "nome invalido" };

  const email = typeof b["email"] === "string" ? b["email"].trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "email invalido" };

  const whatsapp = typeof b["whatsapp"] === "string" ? b["whatsapp"].trim() : "";
  const digits = whatsapp.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) return { error: "whatsapp invalido" };

  const perfil = b["perfil"];
  if (perfil !== "profissional" && perfil !== "empresa" && perfil !== "cliente") {
    return { error: "perfil invalido" };
  }

  const os = b["sistema_operacional"];
  if (os !== "ios" && os !== "android") return { error: "sistema_operacional invalido" };

  return { data: { nome, email, whatsapp, perfil, sistema_operacional: os } };
}

export const ServerRoute = createServerFileRoute("/api/invites").methods({
  POST: async ({ request }) => {
    const body = await request.json().catch(() => null);
    const result = validate(body);
    if ("error" in result) {
      return Response.json({ ok: false, error: result.error }, { status: 400 });
    }

    const { data } = result;
    await notifyLead({
      kind: "invites",
      subject: `Novo convite — ${data.nome} (${data.perfil})`,
      html: `
        <p><strong>Nome:</strong> ${escapeHtml(data.nome)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>WhatsApp:</strong> ${escapeHtml(data.whatsapp)}</p>
        <p><strong>Quero usar como:</strong> ${escapeHtml(data.perfil)}</p>
        <p><strong>Sistema operacional:</strong> ${escapeHtml(data.sistema_operacional)}</p>
      `.trim(),
      payload: data,
    });

    return Response.json({ ok: true });
  },
});
