'use client';

import React from 'react';

interface ScoreGaugeProps {
  score: number;
  previousScore?: number | null;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, previousScore }) => {
  const getRating = (s: number) => {
    if (s >= 90) return { label: 'OPTIMAL COMPLIANCE', color: '#10b981', textColor: 'text-emerald-500 dark:text-emerald-400', grade: 'AAA / AA' };
    if (s >= 75) return { label: 'ACCEPTABLE STANDARDS', color: '#06b6d4', textColor: 'text-cyan-600 dark:text-cyan-400', grade: 'AA MARGINAL' };
    if (s >= 50) return { label: 'DEFICIENT A11Y', color: '#f59e0b', textColor: 'text-amber-600 dark:text-amber-400', grade: 'NON-COMPLIANT' };
    return { label: 'CRITICAL FAILURE', color: '#f43f5e', textColor: 'text-rose-600 dark:text-rose-400', grade: 'SEVERELY BLOCKED' };
  };

  const current = getRating(score);

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border-dim)] pb-3">
        <span className="font-mono text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
          INDEX METRIC // WCAG 2.2
        </span>
        <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">SYSTEM DIAGNOSTIC</span>
      </div>

      <div className="flex items-baseline gap-3 my-auto">
        <span className="font-mono text-6xl font-black tracking-tight text-[var(--text-primary)]">
          {score}
        </span>
        <div className="space-y-0.5">
          <span className="font-mono text-sm text-[var(--text-muted)] block">/ 100</span>
          <span className={`font-mono text-[11px] font-bold tracking-wider ${current.textColor} block`}>
            {current.grade}
          </span>
        </div>
      </div>

      {/* Precision Segmented Bar */}
      <div className="space-y-2">
        <div className="w-full bg-[var(--bg-page)] rounded-sm h-2.5 flex gap-1 p-0.5 border border-[var(--border-dim)]">
          {[...Array(20)].map((_, i) => {
            const active = (i + 1) * 5 <= score;
            return (
              <div
                key={i}
                className="flex-1 rounded-[1px] transition-all duration-500"
                style={{
                  backgroundColor: active ? current.color : 'transparent',
                  opacity: active ? 1 : 0.2,
                }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-secondary)]">
          <span>{current.label}</span>
          {previousScore !== undefined && previousScore !== null && (
            <span
              className={
                score > previousScore
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : score < previousScore
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-[var(--text-muted)]'
              }
            >
              {score > previousScore ? `▲ +${score - previousScore} PTS` : score < previousScore ? `▼ ${score - previousScore} PTS` : '— UNCHANGED'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
