'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal, ShieldAlert, Cpu, X, ArrowRight, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuditViolation, AuditElementNode, A11yFixRemediation } from '@/types/audit';
import { requestFix } from '@/lib/api';

interface RemediationDrawerProps {
  violation: AuditViolation | null;
  node: AuditElementNode | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RemediationDrawer: React.FC<RemediationDrawerProps> = ({
  violation,
  node,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [remediation, setRemediation] = useState<A11yFixRemediation | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateFix = async () => {
    if (!violation || !node) return;
    setLoading(true);
    setError(null);

    try {
      const result = await requestFix({
        ruleId: violation.ruleId,
        ruleDescription: violation.description,
        help: violation.help,
        wcagTags: violation.wcagTags,
        html: node.html,
        failureSummary: node.failureSummary,
        selector: node.selector,
      });
      setRemediation(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Diagnostic remediation failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !violation || !node) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/60 dark:bg-black/80 backdrop-blur-sm">
        {/* Backdrop click */}
        <div className="flex-1" onClick={onClose} />

        {/* Precision Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
          className="w-full max-w-2xl h-full bg-[var(--drawer-bg)] border-l border-[var(--border-dim)] shadow-2xl flex flex-col z-10"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-[var(--border-dim)] flex items-center justify-between bg-[var(--bg-surface)]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-mono text-xs">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)] tracking-wide">
                    {violation.ruleId}
                  </span>
                  <span className="font-mono text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--badge-text)]">
                    {violation.impact}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5">{violation.help}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[var(--border-dim)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Target DOM Selector */}
            {node.selector && (
              <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-dim)] rounded font-mono text-xs text-cyan-700 dark:text-cyan-300 flex items-start gap-2">
                <span className="text-[var(--text-muted)] select-none">DOM&gt;</span>
                <span className="break-all">{node.selector}</span>
              </div>
            )}

            {/* Failing Node Raw Inspection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px] text-rose-500 dark:text-rose-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  FAILING DOM SPECIMEN
                </span>
                <span className="text-[var(--text-muted)] text-[10px]">ORIGINAL RAW NODE</span>
              </div>
              <div className="code-viewport p-4 rounded text-xs text-rose-300 overflow-x-auto leading-relaxed border-rose-900/40">
                <code>{node.html}</code>
              </div>
              {node.failureSummary && (
                <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-dim)] rounded font-mono text-[11px] text-[var(--text-secondary)] flex items-start gap-2">
                  <CornerDownRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 mt-0.5" />
                  <span>{node.failureSummary}</span>
                </div>
              )}
            </div>

            {/* AI Synthesizer trigger */}
            {!remediation && (
              <div className="p-6 bg-[var(--bg-card)] border border-cyan-500/20 rounded flex flex-col items-start gap-3">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-mono text-xs font-semibold">
                  <Terminal className="w-4 h-4" />
                  <span>AUTONOMOUS A11Y REMEDIATION ENGINE</span>
                </div>
                <p className="font-mono text-xs text-[var(--text-secondary)] leading-relaxed">
                  Synthesize an exact, drop-in replacement node complying with WCAG 2.2 AA specifications via Gemini AI.
                </p>
                <button
                  onClick={handleGenerateFix}
                  disabled={loading}
                  className="mt-2 px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>COMPUTING REMEDIATION...</span>
                    </>
                  ) : (
                    <>
                      <span>SYNTHESIZE CORRECTION</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/40 text-rose-300 font-mono text-xs rounded">
                {error}
              </div>
            )}

            {/* Generated Code & Rationale */}
            {remediation && (
              <div className="space-y-6">
                {/* Corrected Code */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      VERIFIED REMEDIATION
                    </span>
                    <button
                      onClick={() => handleCopy(remediation.fixedHtml)}
                      className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-mono text-[10px] flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>COPIED TO CLIPBOARD</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>COPY CODE</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="code-viewport p-4 rounded text-xs text-emerald-300 overflow-x-auto leading-relaxed border-emerald-900/40">
                    <code>{remediation.fixedHtml}</code>
                  </div>
                </div>

                {/* Plain-English Analysis */}
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-dim)] rounded space-y-3 font-mono">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block font-semibold mb-1">
                      DEFECT DIAGNOSIS
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {remediation.explanation}
                    </p>
                  </div>

                  {remediation.impact && (
                    <div className="pt-3 border-t border-[var(--border-dim)]">
                      <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 block font-semibold mb-1">
                        ASSISTIVE TECH IMPACT
                      </span>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {remediation.impact}
                      </p>
                    </div>
                  )}

                  {remediation.wcagReference && (
                    <div className="pt-2 text-[10px] text-[var(--text-muted)]">
                      STANDARD: <span className="text-[var(--text-primary)]">{remediation.wcagReference}</span>
                    </div>
                  )}
                </div>

                {/* Changelog */}
                {remediation.changesMade && remediation.changesMade.length > 0 && (
                  <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded font-mono">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] block font-semibold mb-2">
                      SPECIFICATION DELTAS:
                    </span>
                    <ul className="space-y-1.5">
                      {remediation.changesMade.map((ch, idx) => (
                        <li key={idx} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                          <span className="text-cyan-500 select-none">→</span>
                          <span>{ch}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
