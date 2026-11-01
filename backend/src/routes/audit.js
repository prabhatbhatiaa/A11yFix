import express from 'express';
import { z } from 'zod';
import { validateScanUrl } from '../utils/security.js';
import { runAxeScan } from '../services/scanner.js';
import { analyzeAuditResults } from '../services/analyzer.js';
import { generateA11yFix } from '../services/ai.js';

const router = express.Router();

const AuditRequestSchema = z.object({
  url: z.string().min(1, 'Target URL is required'),
});

const FixRequestSchema = z.object({
  ruleId: z.string().min(1),
  ruleDescription: z.string().optional().default(''),
  help: z.string().optional().default(''),
  wcagTags: z.array(z.string()).optional().default([]),
  html: z.string().min(1, 'HTML element is required'),
  failureSummary: z.string().optional().default(''),
  selector: z.string().optional().default(''),
});

/**
 * POST /api/audit
 * Audits a given URL using Playwright + axe-core
 */
router.post('/audit', async (req, res) => {
  try {
    const parseResult = AuditRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors[0]?.message || 'Invalid request body',
      });
    }

    const { url } = parseResult.data;
    const allowLocalhost = process.env.ALLOW_LOCALHOST_SCAN === 'true';

    // SSRF Security Validation
    const validation = await validateScanUrl(url, allowLocalhost);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const validatedUrl = validation.parsedUrl.toString();

    // Run Playwright + axe scan
    const scanRaw = await runAxeScan(validatedUrl);

    // Group, rank, score results
    const analysis = analyzeAuditResults(scanRaw.axeResults);

    return res.json({
      success: true,
      data: {
        url: scanRaw.url,
        pageTitle: scanRaw.pageTitle,
        scanTimestamp: scanRaw.scanTimestamp,
        executionTimeMs: scanRaw.executionTimeMs,
        score: analysis.score,
        summary: analysis.summary,
        violations: analysis.violations,
      },
    });
  } catch (error) {
    console.error('Audit execution error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while auditing the target page.',
    });
  }
});

/**
 * POST /api/fix
 * Generates an AI-powered code fix and explanation for a specific violation
 */
router.post('/fix', async (req, res) => {
  try {
    const parseResult = FixRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors[0]?.message || 'Invalid fix request',
      });
    }

    const fixResult = await generateA11yFix(parseResult.data);

    return res.json({
      success: true,
      data: fixResult,
    });
  } catch (error) {
    console.error('Fix generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate accessibility remediation.',
    });
  }
});

export default router;
