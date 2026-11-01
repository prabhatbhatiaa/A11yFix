'use client';

import React from 'react';
import { SeverityLevel } from '@/types/audit';

interface SeverityBadgeProps {
  level: SeverityLevel;
  count?: number;
}

const config: Record<
  SeverityLevel,
  { label: string; text: string; bg: string; border: string; indicator: string }
> = {
  critical: {
    label: 'CRITICAL',
    text: 'text-rose-300',
    bg: 'bg-rose-950/40',
    border: 'border-rose-800/40',
    indicator: 'bg-rose-500',
  },
  serious: {
    label: 'SERIOUS',
    text: 'text-amber-300',
    bg: 'bg-amber-950/40',
    border: 'border-amber-800/40',
    indicator: 'bg-amber-500',
  },
  moderate: {
    label: 'MODERATE',
    text: 'text-yellow-300',
    bg: 'bg-yellow-950/40',
    border: 'border-yellow-800/40',
    indicator: 'bg-yellow-500',
  },
  minor: {
    label: 'MINOR',
    text: 'text-cyan-300',
    bg: 'bg-cyan-950/40',
    border: 'border-cyan-800/40',
    indicator: 'bg-cyan-500',
  },
  unknown: {
    label: 'INFO',
    text: 'text-zinc-300',
    bg: 'bg-zinc-900',
    border: 'border-zinc-800',
    indicator: 'bg-zinc-500',
  },
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ level, count }) => {
  const item = config[level] || config.unknown;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] tracking-widest font-semibold border ${item.bg} ${item.text} ${item.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-sm ${item.indicator}`} />
      <span>{item.label}</span>
      {count !== undefined && (
        <span className="ml-1 px-1 py-0.1 rounded bg-black/60 font-mono text-[9px] text-zinc-300">
          {count}
        </span>
      )}
    </span>
  );
};
