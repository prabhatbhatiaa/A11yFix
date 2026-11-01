/**
 * Weight mappings for WCAG impact levels.
 */
const SEVERITY_WEIGHTS = {
  critical: 4,
  serious: 3,
  moderate: 2,
  minor: 1,
};

/**
 * Calculates an objective accessibility score (0 to 100).
 * Based on axe-core's passed vs violated rule checks, weighted by impact severity.
 * 
 * Score Formula:
 * - Each pass contributes positively.
 * - Each violation penalizes according to its severity and instance count.
 * - Score is normalized to an integer between 0 and 100.
 * 
 * @param {Array} violations
 * @param {Array} passes
 * @returns {number} Score from 0 to 100
 */
export function calculateAccessibilityScore(violations = [], passes = []) {
  const totalPasses = passes.length;
  if (violations.length === 0 && totalPasses === 0) return 100;
  if (violations.length === 0) return 100;

  let penaltyPoints = 0;
  for (const v of violations) {
    const weight = SEVERITY_WEIGHTS[v.impact] || 1;
    const nodeCount = v.nodes ? v.nodes.length : 1;
    // Each violation rule adds baseline penalty + minor increment per affected node
    penaltyPoints += (weight * 6) + (nodeCount * 1.5);
  }

  // Baseline potential: passes represent positive adherence
  const passPoints = totalPasses * 3;
  const rawScore = 100 - (penaltyPoints * 100) / (penaltyPoints + passPoints + 20);

  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

/**
 * Analyzes raw axe-core output:
 * - Groups violations by rule ID
 * - Sorts by severity (critical > serious > moderate > minor) and affected node count
 * - Extracts clean HTML snippets and selectors for each node
 * - Calculates overall audit statistics and compliance score
 * 
 * @param {import('axe-core').AxeResults} axeResults
 * @returns {object} Formatted audit summary and grouped issues
 */
export function analyzeAuditResults(axeResults) {
  const { violations = [], passes = [], incomplete = [], inapplicable = [] } = axeResults;

  // Breakdown counts
  const severityCounts = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    unknown: 0,
  };

  let totalAffectedElements = 0;

  // Process and structure violations
  const processedViolations = violations.map((v) => {
    const impact = v.impact || 'minor';
    const nodeCount = v.nodes ? v.nodes.length : 0;

    if (severityCounts[impact] !== undefined) {
      severityCounts[impact] += nodeCount;
    } else {
      severityCounts.unknown += nodeCount;
    }

    totalAffectedElements += nodeCount;

    // Extract nodes details
    const elements = (v.nodes || []).map((node, index) => {
      // Find primary CSS selector
      const selector = Array.isArray(node.target) ? node.target.join(' > ') : String(node.target || '');
      
      // Extract target HTML
      const html = node.html ? node.html.trim() : '';
      
      // Failure summary
      const failureSummary = node.failureSummary || '';

      return {
        id: `${v.id}-node-${index + 1}`,
        selector,
        html,
        failureSummary,
        any: node.any || [],
        all: node.all || [],
        none: node.none || [],
      };
    });

    // Extract WCAG tags
    const wcagTags = (v.tags || []).filter((tag) => 
      tag.startsWith('wcag') || tag.startsWith('section508') || tag === 'best-practice'
    );

    return {
      ruleId: v.id,
      impact: v.impact || 'minor',
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      wcagTags,
      affectedElementsCount: nodeCount,
      elements,
    };
  });

  // Sort violations: Critical first, then serious, moderate, minor; within same tier, by element count
  processedViolations.sort((a, b) => {
    const weightDiff = (SEVERITY_WEIGHTS[b.impact] || 0) - (SEVERITY_WEIGHTS[a.impact] || 0);
    if (weightDiff !== 0) return weightDiff;
    return b.affectedElementsCount - a.affectedElementsCount;
  });

  const accessibilityScore = calculateAccessibilityScore(violations, passes);

  return {
    score: accessibilityScore,
    summary: {
      totalViolations: violations.length,
      totalAffectedElements,
      passesCount: passes.length,
      incompleteCount: incomplete.length,
      inapplicableCount: inapplicable.length,
      severityCounts,
    },
    violations: processedViolations,
  };
}
