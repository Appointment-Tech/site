// Server-only module (suffix enforced by eslint's no-restricted-imports rule,
// see eslint.config.js). Handles the two things a captured lead needs:
// a durable local copy, and a best-effort email notification.
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const BACKUP_DIR = process.env["LEADS_BACKUP_DIR"] || "/data/leads";

type LeadKind = "invites" | "pricing-inquiries";

// Always write the backup file first — it's local, fast, and near-impossible
// to fail. The email is the primary channel a human actually sees, but if
// Resend hiccups the data is never lost, just delayed until someone checks
// the file. Never let a backup failure break the caller: log it and move on.
async function backupToFile(kind: LeadKind, payload: Record<string, unknown>) {
  const file = path.join(BACKUP_DIR, `${kind}.jsonl`);
  try {
    await mkdir(BACKUP_DIR, { recursive: true });
    const line = JSON.stringify({ at: new Date().toISOString(), ...payload });
    await appendFile(file, line + "\n", "utf8");
  } catch (error) {
    console.error(`[leads] failed to write backup file ${file}:`, error);
  }
}

// No presence check on RESEND_API_KEY here on purpose — pass it straight
// through and let a missing/wrong key surface as a 401 from Resend, logged
// below. That failure is caught by the caller and never breaks the response
// to the visitor (their data is already in the backup file by then).
async function sendEmail(subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env["RESEND_API_KEY"]}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env["RESEND_FROM_EMAIL"],
      to: process.env["LEAD_NOTIFICATION_EMAIL"],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend request failed (${res.status}): ${body}`);
  }
}

export async function notifyLead({
  kind,
  subject,
  html,
  payload,
}: {
  kind: LeadKind;
  subject: string;
  html: string;
  payload: Record<string, unknown>;
}) {
  await backupToFile(kind, payload);
  try {
    await sendEmail(subject, html);
  } catch (error) {
    // The lead is safe in the backup file — don't fail the visitor's
    // request over an email delivery problem, just make it loud in logs.
    console.error(`[leads] failed to send notification email for ${kind}:`, error);
  }
}

export function escapeHtml(value: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (c) => map[c] as string);
}
