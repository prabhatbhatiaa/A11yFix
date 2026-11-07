import { jsPDF } from 'jspdf';
import { AuditResultData } from '@/types/audit';

export function exportAuditPDF(data: AuditResultData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryDark = '#090d16';
  const cyanAccent = '#06b6d4';
  const roseAccent = '#f43f5e';
  const emeraldAccent = '#10b981';

  // Header Bar
  doc.setFillColor(9, 13, 22);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('A11YFIX // AUDIT COMPLIANCE REPORT', 14, 18);

  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(6, 182, 212);
  doc.text(`AUDIT ENGINE: AXE-CORE 4.10 + PLAYWRIGHT RUNTIME`, 14, 27);
  doc.setTextColor(148, 163, 184);
  doc.text(`GENERATED: ${new Date().toLocaleString()}`, 130, 27);

  // Target Specimen Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, 182, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('TARGET SPECIMEN:', 18, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${data.pageTitle.slice(0, 75)}`, 18, 56);

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`URL: ${data.url}`, 18, 62);

  // Executive Summary Box
  let y = 74;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE COMPLIANCE SUMMARY', 14, y);

  y += 6;
  // Metrics Blocks
  const metrics = [
    { label: 'SCORE', value: `${data.score} / 100`, color: data.score >= 70 ? [16, 185, 129] : [244, 63, 94] },
    { label: 'VIOLATIONS', value: `${data.summary.totalViolations} RULES`, color: [244, 63, 94] },
    { label: 'AFFECTED NODES', value: `${data.summary.totalAffectedElements} TOTAL`, color: [245, 158, 11] },
    { label: 'PASSES', value: `${data.summary.passesCount} RULES`, color: [16, 185, 129] },
  ];

  metrics.forEach((m, idx) => {
    const xPos = 14 + idx * 47;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(xPos, y, 43, 20, 1.5, 1.5, 'FD');

    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, xPos + 4, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.value, xPos + 4, y + 14);
  });

  // Severity Distribution
  y += 28;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('IMPACT SEVERITY BREAKDOWN:', 14, y);

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Critical: ${data.summary.severityCounts.critical}   Serious: ${data.summary.severityCounts.serious}   Moderate: ${data.summary.severityCounts.moderate}   Minor: ${data.summary.severityCounts.minor}`,
    68,
    y
  );

  // Violations Listing Table
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('DETAILED AUDIT FINDINGS', 14, y);

  y += 6;

  data.violations.forEach((v, index) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 24, 1.5, 1.5, 'FD');

    // Rule ID & Impact
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`[${index + 1}] RULE: ${v.ruleId}`, 18, y + 6);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    const impactColor = v.impact === 'critical' ? [225, 29, 72] : v.impact === 'serious' ? [217, 119, 6] : [71, 85, 105];
    doc.setTextColor(impactColor[0], impactColor[1], impactColor[2]);
    doc.text(`IMPACT: ${v.impact.toUpperCase()}`, 145, y + 6);

    // Help & details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Description: ${v.help.slice(0, 110)}`, 18, y + 12);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Affected Nodes: ${v.affectedElementsCount} | WCAG: ${v.wcagTags.slice(0, 3).join(', ')}`, 18, y + 18);

    y += 28;
  });

  // Footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`A11yFix — Page ${i} of ${totalPages} | Built with Google Gemini + Deque axe-core`, 14, 290);
  }

  // Save the PDF
  const filename = `A11yFix-Audit-${new URL(data.url).hostname}-${Date.now()}.pdf`;
  doc.save(filename);
}

export function exportAuditJSON(data: AuditResultData) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `A11yFix-Audit-${new URL(data.url).hostname}-${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
