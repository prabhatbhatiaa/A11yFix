import dns from 'node:dns/promises';
import { URL } from 'node:url';

/**
 * Checks if an IP string belongs to private, loopback, link-local, or cloud metadata ranges.
 * @param {string} ip
 * @returns {boolean}
 */
export function isPrivateOrReservedIP(ip) {
  // IPv4 loopback (127.0.0.0/8)
  if (/^127\./.test(ip)) return true;

  // Link-local / AWS metadata (169.254.0.0/16)
  if (/^169\.254\./.test(ip)) return true;

  // RFC 1918 Private ranges:
  // 10.0.0.0 - 10.255.255.255
  if (/^10\./.test(ip)) return true;

  // 172.16.0.0 - 172.31.255.255
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;

  // 192.168.0.0 - 192.168.255.255
  if (/^192\.168\./.test(ip)) return true;

  // 0.0.0.0
  if (ip === '0.0.0.0') return true;

  // IPv6 loopback and special
  if (ip === '::1' || ip === '::' || /^fe80:/i.test(ip) || /^fc00:/i.test(ip) || /^fd00:/i.test(ip)) {
    return true;
  }

  return false;
}

/**
 * Validates a target URL against SSRF and unsupported protocols.
 * Supports an optional allowLocalhost flag for testing demo sites locally.
 * 
 * @param {string} targetUrl
 * @param {boolean} allowLocalhost
 * @returns {Promise<{ valid: boolean, parsedUrl?: URL, error?: string }>}
 */
export async function validateScanUrl(targetUrl, allowLocalhost = false) {
  if (!targetUrl || typeof targetUrl !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string.' };
  }

  const trimmed = targetUrl.trim();
  let parsedUrl;
  try {
    parsedUrl = new URL(trimmed);
  } catch (err) {
    return { valid: false, error: 'Malformed URL. Please provide a valid HTTP or HTTPS URL.' };
  }

  // Enforce protocol
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return { valid: false, error: `Protocol "${parsedUrl.protocol}" is not supported. Use http: or https:.` };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Check for localhost / loopback aliases
  const isLoopbackHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';

  if (isLoopbackHost) {
    if (allowLocalhost) {
      return { valid: true, parsedUrl };
    }
    return { valid: false, error: 'Scanning local loopback addresses is restricted in production.' };
  }

  // Resolve hostname via DNS to prevent DNS rebinding or direct IP targeting
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const record of addresses) {
      if (isPrivateOrReservedIP(record.address)) {
        if (allowLocalhost && (record.address === '127.0.0.1' || record.address === '::1')) {
          return { valid: true, parsedUrl };
        }
        return { valid: false, error: `Access to private/internal network IP (${record.address}) is forbidden.` };
      }
    }
  } catch (err) {
    return { valid: false, error: `DNS resolution failed for hostname "${hostname}": ${err.message}` };
  }

  return { valid: true, parsedUrl };
}
