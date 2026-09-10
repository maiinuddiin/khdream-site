export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  autoSync: boolean;
}

const STORAGE_KEY = 'kh_github_sync_config';

export const DEFAULT_GITHUB_OWNER = 'maiinuddiin';
export const DEFAULT_GITHUB_REPO = 'khdream-site';
export const DEFAULT_GITHUB_BRANCH = 'main';
export const DEFAULT_GITHUB_TOKEN = '';

/**
 * Default GitHub config with user's repository credentials and auto-sync enabled
 */
export function getDefaultGitHubConfig(): GitHubConfig {
  let detectedOwner = DEFAULT_GITHUB_OWNER;
  let detectedRepo = DEFAULT_GITHUB_REPO;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // e.g. maiinuddiin.github.io
    if (host.endsWith('.github.io')) {
      detectedOwner = host.replace('.github.io', '') || DEFAULT_GITHUB_OWNER;
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        detectedRepo = pathSegments[0] || DEFAULT_GITHUB_REPO;
      }
    }
  }

  return {
    owner: detectedOwner,
    repo: detectedRepo,
    branch: DEFAULT_GITHUB_BRANCH,
    token: DEFAULT_GITHUB_TOKEN,
    autoSync: true
  };
}

let serverConfigFetched = false;
export async function initializeGitHubConfigFromServer(): Promise<GitHubConfig> {
  if (serverConfigFetched || typeof window === 'undefined') {
    return getGitHubConfig();
  }
  serverConfigFetched = true;
  try {
    const res = await fetch('/api/github/config').catch(() => null);
    if (res && res.ok) {
      const serverCfg = await res.json().catch(() => null);
      if (serverCfg && serverCfg.token && serverCfg.owner && serverCfg.repo) {
        return saveGitHubConfig({
          owner: serverCfg.owner,
          repo: serverCfg.repo,
          branch: serverCfg.branch || 'main',
          token: serverCfg.token,
          autoSync: true
        });
      }
    }
  } catch (e) {
    // Fallback to local / defaults
  }
  return getGitHubConfig();
}

if (typeof window !== 'undefined') {
  initializeGitHubConfigFromServer().catch(() => {});
}

export function getGitHubConfig(): GitHubConfig {
  const defaults = getDefaultGitHubConfig();
  if (typeof window === 'undefined') {
    return defaults;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaults;
    }
    const parsed = JSON.parse(raw);
    const rawParsedOwner = (parsed.owner || '').trim();
    const rawParsedRepo = (parsed.repo || '').trim();
    const rawParsedBranch = (parsed.branch || '').trim();
    const rawParsedToken = (parsed.token || '').trim();

    const isTokenFormat = (str: string) => str.length > 20 && (/^gh[pousr]_[a-zA-Z0-9]+$/.test(str) || /^[a-zA-Z0-9_-]{30,}$/.test(str));

    const owner = (rawParsedOwner && !isTokenFormat(rawParsedOwner)) ? rawParsedOwner : defaults.owner;
    const repo = (rawParsedRepo && !isTokenFormat(rawParsedRepo)) ? rawParsedRepo : defaults.repo;
    const branch = (rawParsedBranch && !isTokenFormat(rawParsedBranch)) ? rawParsedBranch : (defaults.branch || 'main');
    const token = (rawParsedToken && isTokenFormat(rawParsedToken)) 
      ? rawParsedToken 
      : (isTokenFormat(rawParsedOwner) ? rawParsedOwner : (isTokenFormat(rawParsedRepo) ? rawParsedRepo : defaults.token));

    return {
      owner,
      repo,
      branch,
      token: token || defaults.token,
      autoSync: parsed.autoSync !== false
    };
  } catch (e) {
    return defaults;
  }
}

export function saveGitHubConfig(updates: Partial<GitHubConfig>): GitHubConfig {
  const current = getGitHubConfig();
  const defaults = getDefaultGitHubConfig();
  const isTokenFormat = (str: string) => str.length > 20 && (/^gh[pousr]_[a-zA-Z0-9]+$/.test(str) || /^[a-zA-Z0-9_-]{30,}$/.test(str));

  const rawOwner = (updates.owner !== undefined ? updates.owner : current.owner).trim();
  const rawRepo = (updates.repo !== undefined ? updates.repo : current.repo).trim();
  const rawBranch = (updates.branch !== undefined ? updates.branch : current.branch).trim();
  const rawToken = (updates.token !== undefined ? updates.token : current.token).trim();

  let token = (rawToken && isTokenFormat(rawToken)) ? rawToken : current.token;
  if (!token || !isTokenFormat(token)) {
    if (isTokenFormat(rawOwner)) token = rawOwner;
    else if (isTokenFormat(rawRepo)) token = rawRepo;
    else if (isTokenFormat(rawBranch)) token = rawBranch;
    else token = defaults.token;
  }

  const next: GitHubConfig = {
    ...current,
    ...updates,
    owner: (rawOwner && !isTokenFormat(rawOwner)) ? rawOwner : (current.owner || defaults.owner),
    repo: (rawRepo && !isTokenFormat(rawRepo)) ? rawRepo : (current.repo || defaults.repo),
    branch: (rawBranch && !isTokenFormat(rawBranch)) ? rawBranch : (current.branch || 'main'),
    token: token || defaults.token,
    autoSync: updates.autoSync !== undefined ? updates.autoSync : current.autoSync
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // Also notify server to persist and sync
    fetch('/api/github/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next)
    }).catch(() => {});
  }
  return next;
}

export function isGitHubConfigured(): boolean {
  const cfg = getGitHubConfig();
  return Boolean(cfg.owner && cfg.repo && cfg.token);
}

/**
 * Check if GitHub repository is configured for public reading (owner and repo present)
 */
export function canReadFromGitHub(): boolean {
  const cfg = getGitHubConfig();
  return Boolean(cfg.owner && cfg.repo);
}

/**
 * Universal invoice loader that works seamlessly in:
 * 1. Node.js Express server / AI Studio Preview environment (/api/invoices)
 * 2. Static GitHub Pages live website (./data/invoices.json bundle or raw GitHub CDN)
 * 3. Offline / localStorage cached state
 */
export async function loadAllInvoicesUniversal(options: { forceSync?: boolean } = {}): Promise<any[]> {
  const { forceSync = false } = options;
  const token = typeof window !== 'undefined' ? (localStorage.getItem('kh_admin_token') || '') : '';
  const syncQuery = forceSync ? '&sync=true' : '';

  // 1. Try server endpoint first (works in AI Studio preview & Node server)
  try {
    const res = await fetch(`/api/invoices?t=${Date.now()}${syncQuery}`, {
      headers: token ? { 'x-admin-token': token } : {},
      credentials: 'include'
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data) && data.length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('kh_dream_invoices', JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (err) {
    // Expected on static GitHub Pages
  }

  // 2. Static host fallback (GitHub Pages live website):
  // Fetch the pre-compiled static invoices bundle
  let staticInvoices: any[] = [];
  const candidateUrls: string[] = [
    './data/invoices.json',
    'data/invoices.json'
  ];

  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname.replace(/\/+$/, '');
    if (pathname) {
      candidateUrls.push(`${pathname}/data/invoices.json`);
    }
    candidateUrls.push(`${window.location.origin}/data/invoices.json`);
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      candidateUrls.push(`/${segments[0]}/data/invoices.json`);
    }
  }

  for (const url of candidateUrls) {
    try {
      const res = await fetch(`${url}?t=${Date.now()}`).catch(() => null);
      if (res && res.ok) {
        const parsed = await res.json().catch(() => null);
        if (Array.isArray(parsed) && parsed.length > 0) {
          staticInvoices = parsed;
          console.log(`[INVOICE-SYNC] Loaded ${parsed.length} invoices from static bundle: ${url}`);
          break;
        }
      }
    } catch (e) {
      // Continue to next candidate
    }
  }

  // 3. GitHub Raw CDN fallback (fetches live compiled invoices.json directly from public GitHub repository)
  const cfg = getGitHubConfig();
  const owner = cfg.owner || DEFAULT_GITHUB_OWNER;
  const repo = cfg.repo || DEFAULT_GITHUB_REPO;
  const branch = cfg.branch || DEFAULT_GITHUB_BRANCH;

  if (staticInvoices.length === 0 && owner && repo) {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/data/invoices.json?t=${Date.now()}`;
      const rawRes = await fetch(rawUrl).catch(() => null);
      if (rawRes && rawRes.ok) {
        const rawData = await rawRes.json().catch(() => null);
        if (Array.isArray(rawData) && rawData.length > 0) {
          staticInvoices = rawData;
          console.log(`[INVOICE-SYNC] Loaded ${rawData.length} invoices from GitHub Raw CDN`);
        }
      }
    } catch (e) {}
  }

  // 4. Merge with local storage cached invoices
  let localInvoices: any[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('kh_dream_invoices');
      if (raw) localInvoices = JSON.parse(raw);
    } catch (e) {}
  }

  const invoiceMap = new Map<string, any>();
  staticInvoices.forEach(inv => {
    const key = String(inv.id || inv.invoiceNumber);
    if (key) invoiceMap.set(key, inv);
  });
  localInvoices.forEach(inv => {
    const key = String(inv.id || inv.invoiceNumber);
    if (key && !invoiceMap.has(key)) {
      invoiceMap.set(key, inv);
    }
  });

  // 5. If forceSync or if invoices are still empty, fetch live from GitHub Contents API
  if ((forceSync || invoiceMap.size === 0) && owner && repo) {
    try {
      const ghRes = await fetchInvoicesFromGitHub().catch(() => ({ invoices: [] }));
      if (ghRes.invoices && ghRes.invoices.length > 0) {
        ghRes.invoices.forEach(inv => {
          const key = String(inv.id || inv.invoiceNumber);
          if (key) invoiceMap.set(key, inv);
        });
      }
    } catch (e) {}
  }

  const result = Array.from(invoiceMap.values());
  result.sort((a, b) => {
    const timeA = new Date(a.createdAt || a.date || 0).getTime();
    const timeB = new Date(b.createdAt || b.date || 0).getTime();
    return timeB - timeA;
  });

  if (typeof window !== 'undefined' && result.length > 0) {
    localStorage.setItem('kh_dream_invoices', JSON.stringify(result));
  }

  return result;
}

/**
 * Universal single invoice loader for viewing or printing any invoice by ID or Number
 */
export async function loadInvoiceByIdUniversal(invoiceId: string): Promise<any | null> {
  if (!invoiceId) return null;
  const safeId = String(invoiceId).trim();
  const normalized = safeId.toLowerCase();

  // 1. Check localStorage first
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('kh_dream_invoices');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const found = list.find((i: any) => 
            String(i.id || '').toLowerCase() === normalized || 
            String(i.invoiceNumber || '').toLowerCase() === normalized
          );
          if (found) return found;
        }
      }
    } catch (e) {}
  }

  // 2. Try server endpoint
  try {
    const res = await fetch(`/api/invoices/${encodeURIComponent(safeId)}`).catch(() => null);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data && (data.id || data.invoiceNumber)) return data;
    }
  } catch (e) {}

  // 3. Try static file in dist/data/invoices/
  const candidateStaticUrls = [
    `./data/invoices/invoice_${encodeURIComponent(safeId)}.json`,
    `data/invoices/invoice_${encodeURIComponent(safeId)}.json`
  ];
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname.replace(/\/+$/, '');
    if (pathname) candidateStaticUrls.push(`${pathname}/data/invoices/invoice_${encodeURIComponent(safeId)}.json`);
  }

  for (const staticUrl of candidateStaticUrls) {
    try {
      const staticRes = await fetch(staticUrl).catch(() => null);
      if (staticRes && staticRes.ok) {
        const data = await staticRes.json().catch(() => null);
        if (data) return data;
      }
    } catch (e) {}
  }

  // 4. Try loading the full bundle and search
  try {
    const all = await loadAllInvoicesUniversal();
    const found = all.find((i: any) => 
      String(i.id || '').toLowerCase() === normalized || 
      String(i.invoiceNumber || '').toLowerCase() === normalized ||
      (i.customerPhone && String(i.customerPhone).replace(/\D/g, '') === safeId.replace(/\D/g, ''))
    );
    if (found) return found;
  } catch (e) {}

  // 5. Try GitHub Raw URL
  const cfg = getGitHubConfig();
  const owner = cfg.owner || DEFAULT_GITHUB_OWNER;
  const repo = cfg.repo || DEFAULT_GITHUB_REPO;
  const branch = cfg.branch || DEFAULT_GITHUB_BRANCH;
  if (owner && repo) {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/data/invoices/invoice_${encodeURIComponent(safeId)}.json`;
      const ghRes = await fetch(rawUrl).catch(() => null);
      if (ghRes && ghRes.ok) {
        const data = await ghRes.json().catch(() => null);
        if (data) return data;
      }
    } catch (e) {}
  }

  return null;
}

/**
 * Helper to encode UTF-8 string to base64 for GitHub Contents API
 */
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper to decode base64 from GitHub Contents API to UTF-8 string
 */
function base64ToUtf8(base64: string): string {
  const cleanBase64 = base64.replace(/\n|\r/g, '');
  const binary = atob(cleanBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Save / commit invoice JSON file directly to data/invoices/invoice_<id>.json in GitHub repository
 */
export async function saveInvoiceToGitHub(invoice: any): Promise<{ success: boolean; commitUrl?: string; error?: string }> {
  const cfg = getGitHubConfig();
  if (!cfg.owner || !cfg.repo || !cfg.token) {
    return { success: false, error: 'GitHub repository or Personal Access Token not configured.' };
  }

  const invoiceId = invoice.id || invoice.invoiceNumber;
  const filePath = `data/invoices/invoice_${invoiceId}.json`;
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${filePath}`;

  try {
    // Check if file already exists to obtain its SHA
    let sha: string | undefined = undefined;
    const checkRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(cfg.branch)}`, {
      headers: {
        'Authorization': `Bearer ${cfg.token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).catch(() => null);

    if (checkRes && checkRes.ok) {
      const existingData = await checkRes.json();
      if (existingData && existingData.sha) {
        sha = existingData.sha;
      }
    }

    const payloadString = JSON.stringify(invoice, null, 2);
    const base64Content = utf8ToBase64(payloadString);

    const commitMessage = sha 
      ? `Update invoice ${invoice.invoiceNumber || invoiceId} in data/invoices/` 
      : `Add invoice ${invoice.invoiceNumber || invoiceId} to data/invoices/`;

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${cfg.token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        branch: cfg.branch,
        ...(sha ? { sha } : {})
      })
    });

    if (!putRes.ok) {
      const errBody = await putRes.json().catch(() => ({}));
      const msg = errBody.message || `GitHub API error (${putRes.status})`;
      return { success: false, error: msg };
    }

    const resJson = await putRes.json();
    return {
      success: true,
      commitUrl: resJson.commit?.html_url || resJson.content?.html_url
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to connect to GitHub API' };
  }
}

/**
 * Fetch all invoice JSON files from data/invoices in the GitHub repository
 */
export async function fetchInvoicesFromGitHub(): Promise<{ invoices: any[]; error?: string }> {
  const cfg = getGitHubConfig();
  if (!cfg.owner || !cfg.repo) {
    return { invoices: [], error: 'GitHub repository not specified.' };
  }

  const dirUrl = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/data/invoices?ref=${encodeURIComponent(cfg.branch)}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (cfg.token) {
    headers['Authorization'] = `Bearer ${cfg.token}`;
  }

  try {
    const res = await fetch(dirUrl, { headers }).catch(() => null);
    if (!res || !res.ok) {
      return { invoices: [], error: `Could not list data/invoices (${res?.status || 'network error'})` };
    }

    const items = await res.json();
    if (!Array.isArray(items)) {
      return { invoices: [] };
    }

    const invoiceFiles = items.filter((item: any) => item.name && item.name.startsWith('invoice_') && item.name.endsWith('.json'));
    const invoices: any[] = [];

    // Fetch contents of invoice files concurrently in chunks of 8 for high performance
    const chunkSize = 8;
    for (let i = 0; i < invoiceFiles.length; i += chunkSize) {
      const chunk = invoiceFiles.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async (file: any) => {
        try {
          let contentStr = '';
          if (file.download_url) {
            const dlRes = await fetch(file.download_url).catch(() => null);
            if (dlRes && dlRes.ok) contentStr = await dlRes.text();
          }
          if (!contentStr && file.git_url) {
            const gitRes = await fetch(file.git_url, { headers }).catch(() => null);
            if (gitRes && gitRes.ok) {
              const gitJson = await gitRes.json().catch(() => null);
              if (gitJson && gitJson.content) {
                contentStr = base64ToUtf8(gitJson.content);
              }
            }
          }
          if (contentStr) {
            const parsed = JSON.parse(contentStr);
            if (!parsed.id) {
              parsed.id = file.name.replace('invoice_', '').replace('.json', '');
            }
            invoices.push(parsed);
          }
        } catch (e) {
          console.warn('Could not parse invoice file from GitHub:', file.name, e);
        }
      }));
    }

    return { invoices };
  } catch (err: any) {
    return { invoices: [], error: err.message };
  }
}

/**
 * Delete invoice file from data/invoices/ in GitHub repository
 */
export async function deleteInvoiceFromGitHub(invoiceId: string): Promise<{ success: boolean; error?: string }> {
  const cfg = getGitHubConfig();
  if (!cfg.owner || !cfg.repo || !cfg.token) {
    return { success: false, error: 'GitHub repository or token missing.' };
  }

  const filePath = `data/invoices/invoice_${invoiceId}.json`;
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${filePath}`;

  try {
    const checkRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(cfg.branch)}`, {
      headers: {
        'Authorization': `Bearer ${cfg.token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!checkRes.ok) {
      return { success: true }; // Already deleted or doesn't exist
    }

    const data = await checkRes.json();
    if (!data.sha) {
      return { success: false, error: 'Could not get file SHA from GitHub' };
    }

    const delRes = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${cfg.token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message: `Delete invoice ${invoiceId} from data/invoices/`,
        sha: data.sha,
        branch: cfg.branch
      })
    });

    return { success: delRes.ok };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Trigger direct client-side download of the individual invoice JSON file
 * Named precisely for the data/invoices/ directory: invoice_<id>.json
 */
export function downloadInvoiceJsonFile(invoice: any): void {
  const invoiceId = invoice.id || invoice.invoiceNumber || `INV-${Date.now()}`;
  const filename = `invoice_${invoiceId}.json`;
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(invoice, null, 2));
  
  const anchor = document.createElement('a');
  anchor.setAttribute('href', dataStr);
  anchor.setAttribute('download', filename);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/**
 * Trigger download of all local invoices as a combined JSON backup
 */
export function downloadAllInvoicesBackup(invoices: any[]): void {
  const filename = `invoices_backup_${new Date().toISOString().slice(0, 10)}.json`;
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(invoices, null, 2));
  
  const anchor = document.createElement('a');
  anchor.setAttribute('href', dataStr);
  anchor.setAttribute('download', filename);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/**
 * Save / commit entire CMS data directly to data/cms_data.json in GitHub repository
 */
export async function saveCMSDataToGitHub(cmsData: any): Promise<{ success: boolean; commitUrl?: string; error?: string }> {
  const cfg = getGitHubConfig();
  if (!cfg.owner || !cfg.repo || !cfg.token) {
    return { 
      success: false, 
      error: 'GitHub repository (Owner, Repo) or Personal Access Token (PAT) is not configured in GitHub Host Sync.' 
    };
  }

  const filePath = 'data/cms_data.json';
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${filePath}`;
  const branch = cfg.branch || 'main';

  try {
    // Check if data/cms_data.json already exists in the repo to obtain its current SHA
    let sha: string | undefined = undefined;
    const checkRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
      headers: {
        'Authorization': `Bearer ${cfg.token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).catch(() => null);

    if (checkRes && checkRes.ok) {
      const existingData = await checkRes.json();
      if (existingData && existingData.sha) {
        sha = existingData.sha;
      }
    }

    const payloadString = JSON.stringify(cmsData, null, 2);
    const base64Content = utf8ToBase64(payloadString);

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const commitMessage = sha 
      ? `Update CMS data/cms_data.json via Admin Panel [${nowStr}]`
      : `Initialize CMS data/cms_data.json via Admin Panel [${nowStr}]`;

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${cfg.token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        branch: branch,
        ...(sha ? { sha } : {})
      })
    });

    if (!putRes.ok) {
      const errBody = await putRes.json().catch(() => ({}));
      const msg = errBody.message || `GitHub API error (${putRes.status})`;
      return { success: false, error: msg };
    }

    const resJson = await putRes.json();
    return {
      success: true,
      commitUrl: resJson.commit?.html_url || resJson.content?.html_url
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to connect to GitHub API' };
  }
}

/**
 * Fetch cms_data.json from GitHub repository (supports public raw CDN or authenticated GitHub API)
 */
export async function fetchCMSDataFromGitHub(): Promise<{ data: any | null; error?: string }> {
  const cfg = getGitHubConfig();
  if (!cfg.owner || !cfg.repo) {
    return { data: null, error: 'GitHub repository owner/repo not configured.' };
  }

  const branch = cfg.branch || 'main';

  // 1. First attempt: Direct raw.githubusercontent.com (fast, unauthenticated, public repos)
  try {
    const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/${encodeURIComponent(branch)}/data/cms_data.json?t=${Date.now()}`;
    const rawRes = await fetch(rawUrl, { cache: 'no-store' }).catch(() => null);
    if (rawRes && rawRes.ok) {
      const parsed = await rawRes.json();
      if (parsed && typeof parsed === 'object') {
        return { data: parsed };
      }
    }
  } catch (e) {
    // Continue to authenticated API fallback
  }

  // 2. Second attempt: GitHub Contents API (works for private repos with token)
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/data/cms_data.json?ref=${encodeURIComponent(branch)}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (cfg.token) {
    headers['Authorization'] = `Bearer ${cfg.token}`;
  }

  try {
    const res = await fetch(apiUrl, { headers, cache: 'no-store' }).catch(() => null);
    if (!res || !res.ok) {
      return { data: null, error: `Could not retrieve data/cms_data.json from GitHub (${res?.status || 'network error'})` };
    }
    const file = await res.json();
    if (file && file.content) {
      const text = base64ToUtf8(file.content);
      const parsed = JSON.parse(text);
      return { data: parsed };
    }
    return { data: null, error: 'No content found in data/cms_data.json on GitHub' };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Trigger direct client-side download of the complete cms_data.json file
 * Ready to commit directly into the repository data/ folder
 */
export function downloadCMSDataJsonFile(cmsData: any): void {
  const filename = 'cms_data.json';
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cmsData, null, 2));
  
  const anchor = document.createElement('a');
  anchor.setAttribute('href', dataStr);
  anchor.setAttribute('download', filename);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/**
 * Read and parse a user-selected JSON file
 */
export function readUploadedJsonFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON file format.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
