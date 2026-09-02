export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  autoSync: boolean;
}

const STORAGE_KEY = 'kh_github_sync_config';

/**
 * Auto-detect GitHub owner and repo from current window URL if hosted on github.io
 */
export function getDefaultGitHubConfig(): GitHubConfig {
  let detectedOwner = '';
  let detectedRepo = '';

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // e.g. maiinuddiin.github.io
    if (host.endsWith('.github.io')) {
      detectedOwner = host.replace('.github.io', '');
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        detectedRepo = pathSegments[0];
      }
    }
  }

  return {
    owner: detectedOwner,
    repo: detectedRepo,
    branch: 'main',
    token: '',
    autoSync: true
  };
}

export function getGitHubConfig(): GitHubConfig {
  if (typeof window === 'undefined') {
    return getDefaultGitHubConfig();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultGitHubConfig();
    }
    const parsed = JSON.parse(raw);
    const defaults = getDefaultGitHubConfig();
    return {
      owner: (parsed.owner || defaults.owner || '').trim(),
      repo: (parsed.repo || defaults.repo || '').trim(),
      branch: (parsed.branch || 'main').trim(),
      token: (parsed.token || '').trim(),
      autoSync: parsed.autoSync !== false
    };
  } catch (e) {
    return getDefaultGitHubConfig();
  }
}

export function saveGitHubConfig(updates: Partial<GitHubConfig>): GitHubConfig {
  const current = getGitHubConfig();
  const next: GitHubConfig = {
    ...current,
    ...updates,
    owner: (updates.owner !== undefined ? updates.owner : current.owner).trim(),
    repo: (updates.repo !== undefined ? updates.repo : current.repo).trim(),
    branch: (updates.branch !== undefined ? updates.branch : current.branch).trim() || 'main',
    token: (updates.token !== undefined ? updates.token : current.token).trim()
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function isGitHubConfigured(): boolean {
  const cfg = getGitHubConfig();
  return Boolean(cfg.owner && cfg.repo && cfg.token);
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

    // Fetch contents of each invoice file
    for (const file of invoiceFiles) {
      try {
        let contentStr = '';
        if (file.download_url) {
          const dlRes = await fetch(file.download_url);
          if (dlRes.ok) contentStr = await dlRes.text();
        } else if (file.git_url) {
          const gitRes = await fetch(file.git_url, { headers });
          if (gitRes.ok) {
            const gitJson = await gitRes.json();
            if (gitJson.content) {
              contentStr = base64ToUtf8(gitJson.content);
            }
          }
        }
        if (contentStr) {
          const parsed = JSON.parse(contentStr);
          invoices.push(parsed);
        }
      } catch (e) {
        console.warn('Could not parse invoice file from GitHub:', file.name, e);
      }
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
