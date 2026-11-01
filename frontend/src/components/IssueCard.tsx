'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Terminal } from 'lucide-react';
import { AuditViolation, AuditElementNode } from '@/types/audit';
import { SeverityBadge } from './SeverityBadge';

interface IssueCardProps {
  violation: AuditViolation;
  onSelectNode: (violation: AuditViolation, node: AuditElementNode) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ violation, onSelectNode }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="instrument-card rounded overflow-hidden">
      {/* Header Bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="px-5 py-3.5 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-[var(--border-dim)] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
            <span className="font-mono text-xs font-bold text-[var(--text-primary)] tracking-wide">
              {violation.ruleId}
            </span>
            <SeverityBadge level={violation.impact} />
            <span className="font-mono text-[10px] text-[var(--text-muted)]">
              {violation.affectedElementsCount} {violation.affectedElementsCount === 1 ? 'NODE' : 'NODES'}
            </span>
          </div>

          <span className="font-mono text-xs text-[var(--text-secondary)] truncate hidden md:inline ml-2">
            // {violation.help}
          </span>
        </div>

        {violation.helpUrl && (
          <a
            href={violation.helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded hover:bg-[var(--border-dim)] text-[var(--text-muted)] hover:text-cyan-500 transition-colors"
            title="Inspect Axe Specification"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Expanded Node Inspector */}
      {expanded && (
        <div className="border-t border-[var(--border-dim)] bg-[var(--bg-surface)] p-5 space-y-4">
          {/* WCAG Criteria Tags */}
          {violation.wcagTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-[var(--border-dim)] font-mono text-[10px]">
              <span className="text-[var(--text-muted)] uppercase font-semibold">TAGS:</span>
              {violation.wcagTags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text-secondary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Node Instances */}
          <div className="space-y-3">
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest block">
              DETECTED DOM INSTANCES ({violation.elements.length})
            </span>
            {violation.elements.map((node, index) => (
              <div
                key={node.id}
                className="p-3.5 rounded bg-[var(--bg-card)] border border-[var(--border-dim)] hover:border-[var(--border-bright)] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1 space-y-1 font-mono">
                  <div className="flex items-center gap-2 text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">
                    <span className="text-[var(--text-muted)]">[{index + 1}]</span>
                    <span className="truncate max-w-xl">{node.selector || 'element'}</span>
                  </div>
                  <div className="code-viewport p-2 rounded text-[11px] text-rose-300 truncate">
                    {node.html}
                  </div>
                </div>

                <button
                  onClick={() => onSelectNode(violation, node)}
                  className="shrink-0 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 dark:bg-zinc-800 dark:hover:bg-cyan-500 text-white dark:text-zinc-200 dark:hover:text-black font-mono font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>REMEDIATE</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
