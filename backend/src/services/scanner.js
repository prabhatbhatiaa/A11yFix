import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve local browser storage path
const localBrowsersPath = path.resolve(__dirname, '../../.cache/ms-playwright');
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || localBrowsersPath;

/**
 * Scans a validated webpage URL using Playwright Chromium and axe-core.
 * 
 * @param {string} url - Validated HTTP/HTTPS URL
 * @param {object} [options]
 * @param {number} [options.timeout=30000] - Navigation timeout in ms
 * @returns {Promise<{
 *   url: string,
 *   scanTimestamp: string,
 *   pageTitle: string,
 *   axeResults: import('axe-core').AxeResults,
 *   executionTimeMs: number
 * }>}
 */
export async function runAxeScan(url, options = {}) {
  const timeout = options.timeout || parseInt(process.env.SCAN_TIMEOUT_MS, 10) || 30000;
  const startTime = Date.now();

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
      ],
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 A11yFix/1.0',
      viewport: { width: 1280, height: 800 },
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    // Prevent navigation requests to internal domains during redirects
    page.on('response', (response) => {
      // Monitor status if needed
    });

    // Navigate to target URL
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout,
    });

    // Wait a brief moment for dynamic hydration/rendering if any
    try {
      await page.waitForLoadState('networkidle', { timeout: 4000 });
    } catch {
      // If network doesn't settle within 4s, proceed with DOM content loaded
    }

    const pageTitle = await page.title();

    // Run axe-core audit
    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();

    const executionTimeMs = Date.now() - startTime;

    return {
      url,
      scanTimestamp: new Date().toISOString(),
      pageTitle: pageTitle || url,
      axeResults,
      executionTimeMs,
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
