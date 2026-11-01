export type SeverityLevel = 'critical' | 'serious' | 'moderate' | 'minor' | 'unknown';

export interface AuditElementNode {
  id: string;
  selector: string;
  html: string;
  failureSummary: string;
  any?: unknown[];
  all?: unknown[];
  none?: unknown[];
}

export interface AuditViolation {
  ruleId: string;
  impact: SeverityLevel;
  description: string;
  help: string;
  helpUrl: string;
  wcagTags: string[];
  affectedElementsCount: number;
  elements: AuditElementNode[];
}

export interface SeverityCounts {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  unknown: number;
}

export interface AuditSummary {
  totalViolations: number;
  totalAffectedElements: number;
  passesCount: number;
  incompleteCount: number;
  inapplicableCount: number;
  severityCounts: SeverityCounts;
}

export interface AuditResultData {
  url: string;
  pageTitle: string;
  scanTimestamp: string;
  executionTimeMs: number;
  score: number;
  summary: AuditSummary;
  violations: AuditViolation[];
}

export interface A11yFixRemediation {
  explanation: string;
  impact: string;
  fixedHtml: string;
  changesMade: string[];
  wcagReference: string;
}
