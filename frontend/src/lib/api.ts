import { AuditResultData, A11yFixRemediation } from '@/types/audit';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function runAudit(url: string): Promise<AuditResultData> {
  const res = await fetch(`${API_BASE}/api/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to complete accessibility scan.');
  }

  return json.data;
}

export async function requestFix(payload: {
  ruleId: string;
  ruleDescription: string;
  help: string;
  wcagTags: string[];
  html: string;
  failureSummary?: string;
  selector?: string;
}): Promise<A11yFixRemediation> {
  const res = await fetch(`${API_BASE}/api/fix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to generate accessibility remediation.');
  }

  return json.data;
}
