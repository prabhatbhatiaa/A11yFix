'use client';

import React, { useState } from 'react';
import {
  Terminal,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Clock,
  Radio,
  SlidersHorizontal,
  Cpu,
  Eye,
  MousePointerClick,
  Palette,
  FileCode2,
  Boxes,
  HelpCircle,
  ExternalLink,
  Download,
  FileDown,
} from 'lucide-react';
import { runAudit } from '@/lib/api';
import { exportAuditPDF, exportAuditJSON } from '@/lib/export';
import { AuditResultData, AuditViolation, AuditElementNode, SeverityLevel } from '@/types/audit';
import { ScoreGauge } from '@/components/ScoreGauge';
import { IssueCard } from '@/components/IssueCard';
import { RemediationDrawer } from '@/components/RemediationDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Interactive3DGrid } from '@/components/Interactive3DGrid';
import { Card3D } from '@/components/Card3D';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [auditData, setAuditData] = useState<AuditResultData | null>(null);
  const [previousData, setPreviousData] = useState<AuditResultData | null>(null);
  const [activeFilter, setActiveFilter] = useState<SeverityLevel | 'all'>('all');

  const [selectedViolation, setSelectedViolation] = useState<AuditViolation | null>(null);
  const [selectedNode, setSelectedNode] = useState<AuditElementNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleScan = async (targetUrl?: string) => {
    const finalUrl = (targetUrl || url).trim();
    if (!finalUrl) {
      setError('SPECIFY A TARGET HTTP/HTTPS ENDPOINT.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await runAudit(finalUrl);
      if (auditData) {
        setPreviousData(auditData);
      }
      setAuditData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Audit scan encountered a failure.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRemediation = (violation: AuditViolation, node: AuditElementNode) => {
    setSelectedViolation(violation);
    setSelectedNode(node);
    setIsDrawerOpen(true);
  };

  const filteredViolations = auditData?.violations.filter((v) => {
    if (activeFilter === 'all') return true;
    return v.impact === activeFilter;
  }) || [];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] bg-grid-cadence text-[var(--text-primary)] selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-x-hidden transition-colors">
      {/* Precision Top Telemetry Header */}
      <header className="border-b border-[var(--border-dim)] bg-[var(--bg-surface)]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-sm shadow-cyan-400/50" />
              <span className="font-mono text-sm font-bold tracking-wider text-[var(--text-primary)]">
                A11YFIX<span className="text-[var(--text-muted)]">.CORE</span>
              </span>
            </div>
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase px-2 py-0.5 rounded border border-[var(--border-dim)] bg-[var(--bg-card)] hidden sm:inline">
              WCAG::2.2_SUITE
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text-secondary)]">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-[11px]">AXE-CORE 4.10 + PLAYWRIGHT RUNTIME</span>
            </div>

            {auditData && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportAuditPDF(auditData)}
                  className="px-2.5 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--border-dim)] text-[var(--text-primary)] border border-[var(--border-dim)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Download PDF Compliance Report"
                >
                  <FileDown className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button
                  onClick={() => exportAuditJSON(auditData)}
                  className="px-2.5 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--border-dim)] text-[var(--text-primary)] border border-[var(--border-dim)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Export Raw JSON Audit Data"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">JSON</span>
                </button>
                <button
                  onClick={() => handleScan(auditData.url)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--border-dim)] text-[var(--text-primary)] border border-[var(--border-dim)] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>RESCAN</span>
                </button>
              </div>
            )}

            {/* Light / Dark Mode Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-12">
        {/* Hero Section: 3D Topology + Command Input */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[var(--border-dim)] pb-12">
          {/* Left Column: Command & Form */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs tracking-wider uppercase font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>AUTONOMOUS ACCESSIBILITY ROBOT</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)] font-mono leading-tight">
              Enterprise Accessibility Audits & Real-Time Fixes.
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono leading-relaxed max-w-xl">
              Inspect full DOM trees via headless Chromium, extract WCAG 2.1/2.2 AA violations with Deque axe-core, and synthesize instant drop-in code fixes via Gemini AI.
            </p>

            {/* Scan Form Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleScan();
              }}
              className="flex flex-col sm:flex-row items-stretch gap-2 font-mono pt-2"
            >
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)] text-xs">
                  TARGET&gt;
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={loading}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-bright)] rounded pl-24 pr-4 py-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-cyan-500 font-mono transition-colors shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                    <span>SCANNING DOM...</span>
                  </>
                ) : (
                  <>
                    <span>LAUNCH AUDIT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/40 text-rose-300 font-mono text-xs rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Fast Telemetry Pills */}
            <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-[var(--text-muted)] pt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>ZERO SYNTHETIC MOCKS</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>SSRF DEFENSE ACTIVE</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>WCAG 2.2 AA BENCHMARK</span>
              </span>
            </div>
          </div>

          {/* Right Column: 3D Topological Wireframe */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full relative">
              <Interactive3DGrid />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] text-[var(--text-muted)] tracking-widest uppercase bg-[var(--bg-surface)] px-2.5 py-1 rounded border border-[var(--border-dim)] pointer-events-none">
                3D DOM TOPOLOGY MESH // LIVE INTERACTIVE
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid (3D Tilt effect) */}
        {!auditData && (
          <section className="space-y-4">
            <div className="flex items-center justify-between font-mono">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                AUDIT SUBSYSTEMS &amp; DIAGNOSTIC DOMAINS
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">SYSTEM SPECIFICATIONS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card3D>
                <div className="instrument-card p-6 rounded space-y-3 h-full">
                  <div className="w-9 h-9 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <MousePointerClick className="w-4 h-4" />
                  </div>
                  <h3 className="font-mono text-sm font-bold text-[var(--text-primary)]">
                    Keyboard &amp; Focus Traversal
                  </h3>
                  <p className="font-mono text-xs text-[var(--text-secondary)] leading-relaxed">
                    Evaluates tabindex loops, focus traps, interactive targets, and landmark traversal requirements for non-pointer navigation.
                  </p>
                </div>
              </Card3D>

              <Card3D>
                <div className="instrument-card p-6 rounded space-y-3 h-full">
                  <div className="w-9 h-9 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h3 className="font-mono text-sm font-bold text-[var(--text-primary)]">
                    Assistive Semantics &amp; ARIA
                  </h3>
                  <p className="font-mono text-xs text-[var(--text-secondary)] leading-relaxed">
                    Extracts accessible names, form association, image text descriptions, role hierarchies, and live region announcements.
                  </p>
                </div>
              </Card3D>

              <Card3D>
                <div className="instrument-card p-6 rounded space-y-3 h-full">
                  <div className="w-9 h-9 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Palette className="w-4 h-4" />
                  </div>
                  <h3 className="font-mono text-sm font-bold text-[var(--text-primary)]">
                    Sub-Pixel Color Contrast
                  </h3>
                  <p className="font-mono text-xs text-[var(--text-secondary)] leading-relaxed">
                    Calculates foreground and background luminance ratios across rendered DOM nodes to enforce strict WCAG 4.5:1 AA compliance.
                  </p>
                </div>
              </Card3D>
            </div>
          </section>
        )}

        {/* Audit Dashboard Section */}
        {auditData && !loading && (
          <section className="space-y-6">
            {/* Top Metrics Instruments */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card3D>
                <div className="instrument-card p-5 rounded h-full">
                  <ScoreGauge
                    score={auditData.score}
                    previousScore={previousData ? previousData.score : null}
                  />
                </div>
              </Card3D>

              <Card3D>
                <div className="instrument-card p-5 rounded flex flex-col justify-between space-y-4 h-full">
                  <div className="flex items-center justify-between border-b border-[var(--border-dim)] pb-3">
                    <span className="font-mono text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
                      VIOLATIONS DETECTED
                    </span>
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <span className="font-mono text-5xl font-black text-rose-400 block">
                      {auditData.summary.totalViolations}
                    </span>
                    <span className="font-mono text-xs text-[var(--text-secondary)] block mt-1">
                      Affecting {auditData.summary.totalAffectedElements} DOM elements
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-dim)]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>LATENCY: {auditData.executionTimeMs}ms</span>
                  </div>
                </div>
              </Card3D>

              <Card3D>
                <div className="instrument-card p-5 rounded flex flex-col justify-between space-y-4 h-full">
                  <div className="flex items-center justify-between border-b border-[var(--border-dim)] pb-3">
                    <span className="font-mono text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
                      VERIFIED PASSES
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="font-mono text-5xl font-black text-emerald-400 block">
                      {auditData.summary.passesCount}
                    </span>
                    <span className="font-mono text-xs text-[var(--text-secondary)] block mt-1">
                      Rules satisfied without regressions
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-dim)]">
                    <Layers className="w-3.5 h-3.5" />
                    <span>MANUAL REVIEW: {auditData.summary.incompleteCount}</span>
                  </div>
                </div>
              </Card3D>

              <Card3D>
                <div className="instrument-card p-5 rounded flex flex-col justify-between space-y-4 font-mono h-full">
                  <div className="flex items-center justify-between border-b border-[var(--border-dim)] pb-3">
                    <span className="text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
                      TARGET SPECIMEN
                    </span>
                    <Terminal className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[var(--text-primary)] truncate" title={auditData.pageTitle}>
                      {auditData.pageTitle}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] truncate" title={auditData.url}>
                      {auditData.url}
                    </div>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-dim)]">
                    TIMESTAMP: {new Date(auditData.scanTimestamp).toISOString()}
                  </div>
                </div>
              </Card3D>
            </div>

            {/* Severity Filter Controls */}
            <div className="instrument-panel p-3 rounded flex flex-wrap items-center justify-between gap-3 font-mono">
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  SEVERITY FILTER:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    activeFilter === 'all'
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  ALL ({auditData.violations.length})
                </button>
                <button
                  onClick={() => setActiveFilter('critical')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    activeFilter === 'critical'
                      ? 'bg-rose-500 text-black font-bold'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-rose-400'
                  }`}
                >
                  CRITICAL ({auditData.summary.severityCounts.critical})
                </button>
                <button
                  onClick={() => setActiveFilter('serious')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    activeFilter === 'serious'
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-amber-400'
                  }`}
                >
                  SERIOUS ({auditData.summary.severityCounts.serious})
                </button>
                <button
                  onClick={() => setActiveFilter('moderate')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    activeFilter === 'moderate'
                      ? 'bg-yellow-500 text-black font-bold'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-yellow-400'
                  }`}
                >
                  MODERATE ({auditData.summary.severityCounts.moderate})
                </button>
                <button
                  onClick={() => setActiveFilter('minor')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    activeFilter === 'minor'
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-cyan-400'
                  }`}
                >
                  MINOR ({auditData.summary.severityCounts.minor})
                </button>
              </div>
            </div>

            {/* Violation Tree */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono">
                <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold">
                  AUDIT FINDINGS [{filteredViolations.length} RULES MATCHED]
                </span>
              </div>

              {filteredViolations.length === 0 ? (
                <div className="instrument-card p-10 text-center space-y-2 rounded font-mono">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    NO VIOLATIONS IN CURRENT TIER
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    All checks in this category satisfied.
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredViolations.map((violation) => (
                    <IssueCard
                      key={violation.ruleId}
                      violation={violation}
                      onSelectNode={handleOpenRemediation}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Remediation Drawer */}
      <RemediationDrawer
        isOpen={isDrawerOpen}
        violation={selectedViolation}
        node={selectedNode}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
