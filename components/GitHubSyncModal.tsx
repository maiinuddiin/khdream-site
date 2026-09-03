import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Download, 
  CloudUpload, 
  Github, 
  GitBranch, 
  RefreshCw, 
  Key, 
  FolderGit2, 
  ShieldCheck, 
  Sliders, 
  FileText, 
  Upload, 
  ExternalLink,
  Check,
  Database
} from 'lucide-react';
import { 
  getGitHubConfig, 
  saveGitHubConfig, 
  isGitHubConfigured, 
  fetchInvoicesFromGitHub, 
  saveInvoiceToGitHub, 
  downloadAllInvoicesBackup,
  saveCMSDataToGitHub,
  fetchCMSDataFromGitHub,
  downloadCMSDataJsonFile,
  readUploadedJsonFile,
  GitHubConfig 
} from '../lib/githubSync';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  localInvoices?: any[];
  onInvoicesUpdated?: () => void;
  currentCMSData?: any;
  onCMSDataUpdated?: (data: any) => void;
  initialTab?: 'cms' | 'invoices' | 'settings';
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  localInvoices = [],
  onInvoicesUpdated,
  currentCMSData,
  onCMSDataUpdated,
  initialTab = 'cms'
}) => {
  const [activeTab, setActiveTab] = useState<'cms' | 'invoices' | 'settings'>(initialTab);
  const [config, setConfig] = useState<GitHubConfig>(getGitHubConfig());
  
  // Loading & progress states
  const [isSyncingCMS, setIsSyncingCMS] = useState(false);
  const [isPullingCMS, setIsPullingCMS] = useState(false);
  const [isTestingInvoices, setIsTestingInvoices] = useState(false);
  const [isPushingInvoices, setIsPushingInvoices] = useState(false);
  const [pushProgress, setPushProgress] = useState<{ current: number; total: number } | null>(null);
  
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info'; link?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getGitHubConfig());
      setStatusMessage(null);
      setPushProgress(null);
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleSaveConfig = () => {
    saveGitHubConfig(config);
    setStatusMessage({ text: 'GitHub repository configuration saved successfully.', type: 'success' });
  };

  // -------------------------------------------------------------
  // CMS DATA OPERATIONS (data/cms_data.json)
  // -------------------------------------------------------------
  const handlePushCMSToGitHub = async () => {
    if (!config.owner || !config.repo || !config.token) {
      setStatusMessage({ 
        text: 'Owner, repository, and Personal Access Token (PAT) are required to commit settings to GitHub.', 
        type: 'error' 
      });
      setActiveTab('settings');
      return;
    }

    if (!currentCMSData) {
      setStatusMessage({ text: 'No CMS data available to commit.', type: 'error' });
      return;
    }

    setIsSyncingCMS(true);
    setStatusMessage(null);
    saveGitHubConfig(config);

    try {
      const res = await saveCMSDataToGitHub(currentCMSData);
      if (res.success) {
        setStatusMessage({
          text: `Successfully committed all CMS & Admin settings directly to data/cms_data.json on GitHub!`,
          type: 'success',
          link: res.commitUrl
        });
      } else {
        setStatusMessage({
          text: `GitHub commit failed: ${res.error}`,
          type: 'error'
        });
      }
    } catch (err: any) {
      setStatusMessage({ text: `Failed to commit to GitHub: ${err.message}`, type: 'error' });
    } finally {
      setIsSyncingCMS(false);
    }
  };

  const handlePullCMSFromGitHub = async () => {
    if (!config.owner || !config.repo) {
      setStatusMessage({ text: 'Please configure GitHub owner and repository name first.', type: 'error' });
      setActiveTab('settings');
      return;
    }

    setIsPullingCMS(true);
    setStatusMessage(null);
    saveGitHubConfig(config);

    try {
      const res = await fetchCMSDataFromGitHub();
      if (res.error) {
        setStatusMessage({ text: `Pull error: ${res.error}`, type: 'error' });
      } else if (res.data) {
        if (onCMSDataUpdated) {
          onCMSDataUpdated(res.data);
        }
        localStorage.setItem('kh_dream_cms_v6', JSON.stringify(res.data));
        setStatusMessage({ 
          text: 'Successfully pulled latest data/cms_data.json from GitHub host and applied to CMS!', 
          type: 'success' 
        });
      } else {
        setStatusMessage({ text: 'No data returned from GitHub.', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: `Failed to fetch from GitHub: ${err.message}`, type: 'error' });
    } finally {
      setIsPullingCMS(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await readUploadedJsonFile(file);
      if (parsed && typeof parsed === 'object') {
        if (onCMSDataUpdated) {
          onCMSDataUpdated(parsed);
        }
        localStorage.setItem('kh_dream_cms_v6', JSON.stringify(parsed));
        setStatusMessage({ 
          text: `Successfully imported settings from ${file.name} into CMS! Click "Publish Changes" to persist.`, 
          type: 'success' 
        });
      } else {
        setStatusMessage({ text: 'Invalid JSON file structure.', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: `Failed to import JSON file: ${err.message}`, type: 'error' });
    }
    e.target.value = '';
  };

  // -------------------------------------------------------------
  // INVOICE OPERATIONS (data/invoices/)
  // -------------------------------------------------------------
  const handleTestAndPullInvoices = async () => {
    if (!config.owner || !config.repo) {
      setStatusMessage({ text: 'Please enter GitHub owner and repository name.', type: 'error' });
      setActiveTab('settings');
      return;
    }
    setIsTestingInvoices(true);
    setStatusMessage(null);
    try {
      saveGitHubConfig(config);
      // Trigger server-side pull first
      await fetch('/api/invoices/sync', { method: 'POST', credentials: 'include' }).catch(() => null);

      const res = await fetchInvoicesFromGitHub();
      if (res.error) {
        setStatusMessage({ text: `Connection error: ${res.error}`, type: 'error' });
      } else {
        if (res.invoices && res.invoices.length > 0) {
          const raw = localStorage.getItem('kh_dream_invoices');
          const currentList = raw ? JSON.parse(raw) : [];
          const map = new Map();
          currentList.forEach((i: any) => map.set(String(i.id), i));
          res.invoices.forEach((i: any) => map.set(String(i.id), i));
          const merged = Array.from(map.values());
          localStorage.setItem('kh_dream_invoices', JSON.stringify(merged));
          if (onInvoicesUpdated) onInvoicesUpdated();
          setStatusMessage({ 
            text: `Sync completed! Successfully synchronized ${res.invoices.length} invoices with data/invoices/ on GitHub.`, 
            type: 'success' 
          });
        } else {
          setStatusMessage({ 
            text: 'Connected successfully! No invoices currently found in data/invoices/ folder on GitHub.', 
            type: 'info' 
          });
        }
      }
    } catch (err: any) {
      setStatusMessage({ text: `Failed to connect: ${err.message}`, type: 'error' });
    } finally {
      setIsTestingInvoices(false);
    }
  };

  const handlePushAllInvoicesToGitHub = async () => {
    if (!config.owner || !config.repo || !config.token) {
      setStatusMessage({ text: 'Owner, repository, and Personal Access Token are required to commit invoices to GitHub.', type: 'error' });
      setActiveTab('settings');
      return;
    }

    if (localInvoices.length === 0) {
      setStatusMessage({ text: 'No cached invoices found to upload.', type: 'info' });
      return;
    }

    setIsPushingInvoices(true);
    setStatusMessage(null);
    setPushProgress({ current: 0, total: localInvoices.length });

    let successCount = 0;
    let failCount = 0;
    let lastError = '';

    saveGitHubConfig(config);

    for (let i = 0; i < localInvoices.length; i++) {
      const inv = localInvoices[i];
      setPushProgress({ current: i + 1, total: localInvoices.length });
      try {
        const res = await saveInvoiceToGitHub(inv);
        if (res.success) {
          successCount++;
        } else {
          failCount++;
          lastError = res.error || 'Unknown error';
        }
      } catch (err: any) {
        failCount++;
        lastError = err.message;
      }
    }

    setIsPushingInvoices(false);
    setPushProgress(null);

    if (failCount === 0) {
      setStatusMessage({ 
        text: `Successfully committed all ${successCount} invoices directly into data/invoices/ in your GitHub repository!`, 
        type: 'success' 
      });
    } else {
      setStatusMessage({ 
        text: `Committed ${successCount} invoices. ${failCount} failed. Last error: ${lastError}`, 
        type: 'error' 
      });
    }
  };

  if (!isOpen) return null;

  const isConfigured = isGitHubConfigured();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-850/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl dark:bg-white dark:text-zinc-900 shadow-sm">
                <Github size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    GitHub Host & Data Sync Hub
                  </h3>
                  {isConfigured ? (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Host Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      <AlertCircle size={10} />
                      Cache Only
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  Persist CMS settings (<code className="font-mono text-[10px]">data/cms_data.json</code>) & Invoices to GitHub
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 pt-3 border-b border-slate-100 dark:border-zinc-800 flex gap-2 bg-slate-50/30 dark:bg-zinc-900">
            <button
              onClick={() => setActiveTab('cms')}
              className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'cms'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders size={14} />
              <span>CMS & Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'invoices'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText size={14} />
              <span>Invoices ({localInvoices.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Key size={14} />
              <span>Repository & Token</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Explanatory Host Notice */}
            <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl space-y-1.5 text-blue-900 dark:text-blue-300">
              <div className="flex items-center gap-2 font-bold text-xs">
                <FolderGit2 size={15} />
                <span>How GitHub Host Persistence Works</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90 font-normal">
                Because GitHub Pages is a static host without a live Node.js server, settings saved only in browser cache are lost for other devices. 
                Connecting your GitHub token allows this Admin Panel to commit directly to <code className="font-mono text-[10px] bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded font-bold">data/cms_data.json</code> and <code className="font-mono text-[10px] bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded font-bold">data/invoices/</code> on your GitHub repository!
              </p>
            </div>

            {/* Status Notification */}
            {statusMessage && (
              <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
                statusMessage.type === 'success' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400'
                  : 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
              }`}>
                <div className="flex items-center gap-2">
                  {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <div>
                    <span>{statusMessage.text}</span>
                    {statusMessage.link && (
                      <a 
                        href={statusMessage.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex items-center gap-1 underline text-[11px] font-bold"
                      >
                        View Commit on GitHub <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
                <button onClick={() => setStatusMessage(null)} className="text-[10px] uppercase font-bold opacity-75 hover:opacity-100 shrink-0 ml-3">
                  Dismiss
                </button>
              </div>
            )}

            {/* TAB 1: CMS SETTINGS SYNC */}
            {activeTab === 'cms' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                        <Database size={15} className="text-primary" />
                        Target File: <code className="font-mono text-primary font-bold">data/cms_data.json</code>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        Holds all site configurations, general info, contact details, hero slides, catalog, users & permissions.
                      </p>
                    </div>
                    {isConfigured && (
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 block">Repository:</span>
                        <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 font-mono">
                          {config.owner}/{config.repo}@{config.branch}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isConfigured && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
                      <span>⚠️ Personal Access Token not configured. Click below to connect your repository.</span>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="px-2.5 py-1 bg-amber-600 text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-amber-700 transition-colors shrink-0 ml-2"
                      >
                        Setup Token
                      </button>
                    </div>
                  )}

                  {/* Primary Sync Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handlePushCMSToGitHub}
                      disabled={isSyncingCMS || !isConfigured}
                      className="px-4 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/20"
                    >
                      {isSyncingCMS ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
                      <span>Commit Settings to GitHub</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePullCMSFromGitHub}
                      disabled={isPullingCMS || !config.owner || !config.repo}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50 text-slate-900 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-zinc-700"
                    >
                      {isPullingCMS ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      <span>Pull Settings from GitHub</span>
                    </button>
                  </div>
                </div>

                {/* Local Backup & Manual File Operations */}
                <div className="p-4 bg-slate-50/50 dark:bg-zinc-850/40 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                    Manual Backup & File Import
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => downloadCMSDataJsonFile(currentCMSData)}
                      className="px-3.5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700 transition-colors"
                    >
                      <Download size={14} className="text-primary" />
                      <span>Download cms_data.json</span>
                    </button>

                    <label className="px-3.5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer text-center">
                      <Upload size={14} className="text-emerald-500" />
                      <span>Import cms_data.json</span>
                      <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INVOICES SYNC */}
            {activeTab === 'invoices' && (
              <div className="space-y-4">
                {/* Auto Sync Banner */}
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Automatic Invoice Push & Pull Active
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded">
                      {config.owner}/{config.repo}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-emerald-900/80 dark:text-emerald-300/80 pt-1">
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-black">✓</span>
                      <span><strong>Auto Push:</strong> New & updated invoices are committed to GitHub automatically.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-black">✓</span>
                      <span><strong>Auto Pull:</strong> Syncs automatically at startup, every 2 mins, & on tab open.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-black">✓</span>
                      <span><strong>Auto Delete:</strong> Deleted invoices are automatically removed from GitHub.</span>
                    </div>
                  </div>
                </div>

                {pushProgress && (
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
                      <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-primary" />
                        Committing invoices to data/invoices/ on GitHub...
                      </span>
                      <span>{pushProgress.current} / {pushProgress.total}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${(pushProgress.current / pushProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Target Folder: <code className="font-mono text-primary font-bold">data/invoices/</code>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        Invoices are committed individually as <code className="font-mono text-[10px]">invoice_INV-....json</code>
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-slate-200 dark:bg-zinc-700 px-2.5 py-1 rounded-lg">
                      {localInvoices.length} local invoices
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleTestAndPullInvoices}
                      disabled={isTestingInvoices || isPushingInvoices}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-zinc-700"
                    >
                      {isTestingInvoices ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      <span>Force Pull Now</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePushAllInvoicesToGitHub}
                      disabled={isPushingInvoices || isTestingInvoices || !isConfigured}
                      className="px-4 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/20"
                    >
                      {isPushingInvoices ? <Loader2 size={14} className="animate-spin" /> : <CloudUpload size={14} />}
                      <span>Push All to data/invoices/</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadAllInvoicesBackup(localInvoices)}
                      className="px-4 py-3 bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-zinc-700"
                    >
                      <Download size={14} />
                      <span>Export All (.json)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SETTINGS & TOKEN CONFIG */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                      GitHub Owner / Username
                    </label>
                    <input 
                      type="text"
                      value={config.owner}
                      onChange={(e) => setConfig({ ...config, owner: e.target.value.trim() })}
                      placeholder="e.g. maiinuddiin"
                      className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                      Repository Name
                    </label>
                    <input 
                      type="text"
                      value={config.repo}
                      onChange={(e) => setConfig({ ...config, repo: e.target.value.trim() })}
                      placeholder="e.g. kh-dream-travels"
                      className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                      Branch
                    </label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={config.branch}
                        onChange={(e) => setConfig({ ...config, branch: e.target.value.trim() || 'main' })}
                        placeholder="main"
                        className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-mono"
                      />
                      <GitBranch size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center justify-between">
                      <span>Personal Access Token (PAT)</span>
                      <a 
                        href="https://github.com/settings/tokens/new?scopes=repo&description=KHDreams_Admin_Sync" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-[9px] lowercase font-semibold flex items-center gap-1"
                      >
                        generate token (repo scope) <ExternalLink size={9} />
                      </a>
                    </label>
                    <div className="relative">
                      <input 
                        type="password"
                        value={config.token}
                        onChange={(e) => setConfig({ ...config, token: e.target.value.trim() })}
                        placeholder="Personal access token"
                        className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-mono"
                      />
                      <Key size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Auto Sync Toggle */}
                <div className="pt-2 p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={config.autoSync}
                      onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span>Auto-commit settings and invoices to GitHub on Save / Publish</span>
                  </label>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 pl-6">
                    When enabled, clicking "Publish Changes" in the Admin Panel automatically commits the changes to <code className="font-mono">data/cms_data.json</code> on GitHub.
                  </p>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md shadow-primary/20"
                  >
                    <Check size={14} />
                    <span>Save Repository Config</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50 flex justify-between items-center text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Token stored securely in browser localStorage only
            </span>
            <button 
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
