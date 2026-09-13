import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Calculator, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Trash2, 
  Building2, 
  RotateCcw, 
  Download, 
  Search, 
  CheckCircle2, 
  ExternalLink, 
  Printer, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  ChevronDown, 
  ChevronRight, 
  Save, 
  Sun, 
  Moon,
  Github,
  Info,
  Settings,
  Globe,
  Image as ImageIcon,
  Radio,
  CloudUpload,
  Loader2
} from 'lucide-react';
import { useCMS, User, BusinessProfile } from '../context/CMSContext';
import InvoiceSystem from './InvoiceSystem';
import SadadInvoice from './SadadInvoice';
import Mailbox from './Mailbox';
import BroadcastManager from './BroadcastManager';
import ImageUpload from './ImageUpload';
import { GitHubSyncModal } from './GitHubSyncModal';
import { 
  downloadAllInvoicesBackup, 
  deleteInvoiceFromGitHub, 
  isGitHubConfigured, 
  loadAllInvoicesUniversal,
  triggerGitHubServerUpdate
} from '../lib/githubSync';

type TabType = 'invoices' | 'sadad-invoices' | 'mailbox' | 'broadcast' | 'users' | 'settings';

interface AdminPanelProps {
  onBack?: () => void;
  theme?: string;
  setTheme?: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
}

const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
}> = ({ isOpen, onClose, onConfirm, title, message }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-zinc-800"
        >
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Trash2 size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{title}</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{message}</p>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ theme, setTheme }) => {
  const { data, updateData, saveChanges, currentUser, setCurrentUser, logout, checkSessionActive } = useCMS();

  // Active Tab State - Defaults to 'invoices'
  const [activeTab, setActiveTab] = useState<TabType>('invoices');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  // Invoices Management State
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [showBusinessEntities, setShowBusinessEntities] = useState(false);
  const [invoiceSearchText, setInvoiceSearchText] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'all' | 'paid' | 'due' | 'partial'>('all');
  const [invoiceEntityFilter, setInvoiceEntityFilter] = useState<string>('all');
  const [invoiceToDelete, setInvoiceToDelete] = useState<any | null>(null);

  // Business Entity to Delete
  const [businessToDelete, setBusinessToDelete] = useState<BusinessProfile | null>(null);

  // User Management State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [expandedUserPerms, setExpandedUserPerms] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'Staff' as 'Admin' | 'Manager' | 'Staff'
  });

  // GitHub Sync Modal
  const [showGitHubSyncModal, setShowGitHubSyncModal] = useState(false);
  const [isUpdatingGitHub, setIsUpdatingGitHub] = useState(false);
  const [gitHubUpdateStatus, setGitHubUpdateStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleUpdateGitHubServer = async () => {
    setIsUpdatingGitHub(true);
    setGitHubUpdateStatus({ message: "Synchronizing all invoices and settings to GitHub server...", type: 'info' });
    try {
      const res = await triggerGitHubServerUpdate();
      if (res.success) {
        setGitHubUpdateStatus({ 
          message: `GitHub Server Updated Successfully! (${res.invoicesPushed || 0} active invoices pushed, settings saved, deleted items cleared)`,
          type: 'success' 
        });
        setTimeout(() => setGitHubUpdateStatus(null), 5000);
      } else {
        setGitHubUpdateStatus({ 
          message: "GitHub update failed: " + (res.error || "Unknown server error"),
          type: 'error' 
        });
        setTimeout(() => setGitHubUpdateStatus(null), 6000);
      }
    } catch (err: any) {
      setGitHubUpdateStatus({ 
        message: "Error updating GitHub server: " + (err.message || "Network error"),
        type: 'error' 
      });
      setTimeout(() => setGitHubUpdateStatus(null), 6000);
    } finally {
      setIsUpdatingGitHub(false);
    }
  };

  // Working Draft Data for Users & Business Profiles
  const [draftData, setDraftData] = useState(data);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setDraftData(data);
  }, [data]);

  const hasDraftChanges = useMemo(() => {
    return JSON.stringify(draftData) !== JSON.stringify(data);
  }, [draftData, data]);

  // Session verification hook
  useEffect(() => {
    const verify = async () => {
      const valid = await checkSessionActive();
      if (!valid) {
        logout();
      }
    };
    verify();
    const timer = setInterval(verify, 60000);
    return () => clearInterval(timer);
  }, [logout, checkSessionActive]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch Invoices
  const fetchInvoices = async (forceSync = true) => {
    setIsLoadingInvoices(true);
    try {
      const list = await loadAllInvoicesUniversal({ forceSync });
      setInvoices(list);
    } catch (err) {
      console.warn("Error fetching invoices:", err);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchInvoices(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'invoices') {
      fetchInvoices(true);
      const interval = setInterval(() => fetchInvoices(false), 45000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleSaveDraftChanges = async () => {
    setIsSaving(true);
    try {
      const ok = await saveChanges(draftData);
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (confirm("Discard all pending unsaved changes?")) {
      setDraftData(data);
    }
  };

  // Delete Invoice action
  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    const deletingId = invoiceToDelete.id;
    const deletingNum = invoiceToDelete.invoiceNumber;
    try {
      // 1. Call server API to delete from local disk, tombstone, and remove from GitHub
      await fetch(`/api/invoices/${encodeURIComponent(deletingId)}`, {
        method: 'DELETE',
        credentials: 'include'
      }).catch(err => console.warn("Backend delete request warning:", err));

      // 2. Direct GitHub deletion as client-side backup
      if (isGitHubConfigured()) {
        await deleteInvoiceFromGitHub(deletingId, deletingNum).catch(err => console.warn("GitHub client delete warning:", err));
      }

      // 3. Remove from UI state
      setInvoices(prev => prev.filter(inv => inv.id !== deletingId));
      setInvoiceToDelete(null);

      // 4. Trigger background push-all to ensure invoices.json bundle is updated
      setTimeout(() => {
        triggerGitHubServerUpdate().catch(() => {});
      }, 500);
    } catch (err: any) {
      alert("Failed to delete invoice: " + (err.message || 'Unknown error'));
    }
  };

  // Delete User action
  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    setDraftData(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userToDelete.id)
    }));
    setUserToDelete(null);
  };

  // Delete Entity action
  const confirmDeleteBusiness = () => {
    if (!businessToDelete) return;
    setDraftData(prev => ({
      ...prev,
      businessProfiles: prev.businessProfiles.filter(b => b.id !== businessToDelete.id)
    }));
    setBusinessToDelete(null);
  };

  // Add User action
  const handleAddNewUser = () => {
    if (!newUserData.username || !newUserData.fullName || !newUserData.password) {
      alert("Please fill in username, full name, and password.");
      return;
    }
    const newUser: User = {
      id: 'usr_' + Date.now(),
      username: newUserData.username.trim().toLowerCase(),
      fullName: newUserData.fullName.trim(),
      email: newUserData.email.trim(),
      password: newUserData.password,
      role: newUserData.role,
      permissions: ['invoices', 'sadad-invoices', 'mailbox']
    };

    setDraftData(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));

    setNewUserData({
      username: '',
      fullName: '',
      email: '',
      password: '',
      role: 'Staff'
    });
    setIsAddingUser(false);
  };

  // Navigation Items
  const navigationItems = [
    { 
      id: 'invoices' as TabType, 
      label: 'Invoices', 
      icon: FileText, 
      count: invoices.filter(i => !i.isSadad).length,
      show: true 
    },
    { 
      id: 'sadad-invoices' as TabType, 
      label: 'Receipts', 
      icon: Calculator, 
      show: true 
    },
    { 
      id: 'mailbox' as TabType, 
      label: 'Mailbox', 
      icon: Mail, 
      show: true 
    },
    { 
      id: 'broadcast' as TabType, 
      label: 'Broadcast', 
      icon: Radio, 
      count: (draftData.subscribers?.length || 0) + (draftData.newsletterSubscribers?.length || 0),
      show: true 
    },
    { 
      id: 'users' as TabType, 
      label: 'User Management', 
      icon: ShieldCheck, 
      count: draftData.users?.length || 0,
      show: currentUser?.role === 'Admin' || currentUser?.role === 'Manager' 
    },
    {
      id: 'settings' as TabType,
      label: 'Site Logo & Options',
      icon: Settings,
      show: true
    }
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col antialiased">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors lg:hidden"
            title="Toggle Menu"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center space-x-2.5">
            {draftData?.general?.logoUrl ? (
              <img 
                src={draftData.general.logoUrl} 
                alt="Site Logo" 
                className="h-8 max-w-[130px] object-contain dark:brightness-110" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center font-black text-base border border-primary/20">
                KH
              </div>
            )}
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                {activeTab === 'invoices' && 'Invoices & Billing'}
                {activeTab === 'sadad-invoices' && 'Receipts'}
                {activeTab === 'mailbox' && 'Mailbox'}
                {activeTab === 'broadcast' && 'Email Broadcast'}
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'settings' && 'Site Logo & Options'}
              </h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Update to GitHub Server button */}
          <button
            type="button"
            onClick={handleUpdateGitHubServer}
            disabled={isUpdatingGitHub}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
            title="Update all active invoices, delete removed invoices, and push settings to GitHub Server"
          >
            {isUpdatingGitHub ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CloudUpload size={14} />
            )}
            <span className="hidden sm:inline">{isUpdatingGitHub ? 'Updating...' : 'Update GitHub'}</span>
          </button>

          {/* GitHub Host Sync button */}
          <button
            type="button"
            onClick={() => setShowGitHubSyncModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-colors"
            title="GitHub Repository Sync Configuration"
          >
            <Github size={14} />
            <span className="hidden sm:inline">GitHub Sync</span>
            {isGitHubConfigured() && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          {/* Theme Switcher */}
          {setTheme && (
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}

          {/* User Profile & Sign Out */}
          <div className="h-6 w-px bg-slate-200 dark:border-zinc-800 mx-1 hidden sm:block" />
          <div className="flex items-center space-x-2">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                {currentUser?.fullName || currentUser?.username}
              </div>
              <span className="inline-block px-1.5 py-0.2 bg-primary/10 text-primary rounded text-[9px] font-black uppercase tracking-wider">
                {currentUser?.role || 'User'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm("Are you sure you want to sign out?")) {
                  logout();
                  setCurrentUser(null);
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 text-xs font-bold transition-colors"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Unsaved Changes Notification */}
      <AnimatePresence>
        {hasDraftChanges && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md sticky top-[57px] z-30"
          >
            <span>You have unsaved changes in User Accounts or Business Entities.</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDiscardChanges}
                disabled={isSaving}
                className="px-3 py-1 bg-amber-600/30 hover:bg-amber-600/50 rounded-lg text-slate-950 font-bold text-[11px] transition-colors"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveDraftChanges}
                disabled={isSaving}
                className="px-4 py-1 bg-slate-950 text-white hover:bg-slate-900 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
              >
                <Save size={12} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 lg:w-0'
          } fixed lg:static inset-y-[57px] left-0 z-30 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 transition-all duration-200 flex flex-col overflow-hidden`}
        >
          <div className="p-4 flex-1 space-y-1.5 overflow-y-auto">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">
              Modules
            </div>
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 font-black'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-zinc-800 space-y-2">
            <button
              type="button"
              onClick={() => {
                logout();
                setCurrentUser(null);
              }}
              className="w-full flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* TAB 1: INVOICES */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    onClick={() => setShowGitHubSyncModal(true)}
                    className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/15 transition-all"
                    title="Invoices auto-sync with maiinuddiin/khdream-site repository on GitHub"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      GitHub Auto-Sync Active
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUpdateGitHubServer}
                    disabled={isUpdatingGitHub}
                    className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                    title="Push All Active Invoices & Clean Deleted Invoices from GitHub"
                  >
                    {isUpdatingGitHub ? <Loader2 size={15} className="animate-spin" /> : <CloudUpload size={15} />}
                    <span>{isUpdatingGitHub ? 'Syncing...' : 'Update GitHub'}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => downloadAllInvoicesBackup(invoices)}
                    className="p-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-primary rounded-xl transition-all"
                    title="Export All Invoices (.json)"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => fetchInvoices(true)}
                    disabled={isLoadingInvoices}
                    className="p-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-primary rounded-xl transition-all"
                    title="Pull Latest from GitHub & Refresh"
                  >
                    <RotateCcw size={16} className={isLoadingInvoices ? 'animate-spin' : ''} />
                  </button>

                  {currentUser?.role === 'Admin' && (
                    <button 
                      type="button"
                      onClick={() => setShowBusinessEntities(!showBusinessEntities)}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <Building2 size={15} />
                      <span>{showBusinessEntities ? 'View Invoices' : 'Manage Entities'}</span>
                    </button>
                  )}

                  <button 
                    type="button"
                    onClick={() => {
                      setEditingInvoice(null);
                      setIsCreatingInvoice(true);
                    }} 
                    className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Plus size={15} />
                    <span>New Invoice</span>
                  </button>
                </div>
              </div>

              {/* GitHub Update Status Notification */}
              {gitHubUpdateStatus && (
                <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  gitHubUpdateStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : gitHubUpdateStatus.type === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                    : 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {gitHubUpdateStatus.type === 'success' ? (
                      <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : gitHubUpdateStatus.type === 'error' ? (
                      <X size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                    ) : (
                      <Loader2 size={16} className="animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                    <span>{gitHubUpdateStatus.message}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setGitHubUpdateStatus(null)} 
                    className="text-[10px] font-bold uppercase opacity-75 hover:opacity-100 ml-3 shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Invoice Builder Component */}
              {isCreatingInvoice ? (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm">
                  <InvoiceSystem 
                    onBack={() => { 
                      setIsCreatingInvoice(false); 
                      setEditingInvoice(null);
                      fetchInvoices(); 
                    }} 
                    t={path => path} 
                    initialData={editingInvoice}
                  />
                </div>
              ) : showBusinessEntities ? (
                /* Business Profiles / Company Entities Management */
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Company Entities & Profiles
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        Configure entity details, logos, CR/VAT numbers, and authorization stamps.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setDraftData(prev => ({ 
                        ...prev,
                        businessProfiles: [
                          ...prev.businessProfiles, 
                          { 
                            id: 'entity_' + Date.now(), 
                            name: 'New Business', 
                            arabicName: 'شركة جديدة', 
                            logoUrl: '', 
                            address: '', 
                            location: '', 
                            phone: '', 
                            email: '', 
                            vatId: '', 
                            invoicePrefix: 'INV', 
                            nextInvoiceNumber: 1 
                          }
                        ] 
                      }))} 
                      className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase flex items-center gap-1.5 shadow-md shadow-primary/20 hover:scale-105 transition-all"
                    >
                      <Plus size={14} />
                      Add Entity
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {draftData.businessProfiles.map((biz) => (
                      <div key={biz.id} className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-6 relative group">
                        <button 
                          type="button"
                          onClick={() => setBusinessToDelete(biz)}
                          className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"
                          title="Delete Entity"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Business Name (English)</label>
                            <input 
                              type="text" 
                              value={biz.name} 
                              onChange={e => {
                                const val = e.target.value;
                                setDraftData(prev => ({
                                  ...prev,
                                  businessProfiles: prev.businessProfiles.map(b => b.id === biz.id ? { ...b, name: val } : b)
                                }));
                              }} 
                              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-black outline-none focus:ring-2 focus:ring-primary/20" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Business Name (Arabic)</label>
                            <input 
                              type="text" 
                              value={biz.arabicName} 
                              onChange={e => {
                                const val = e.target.value;
                                setDraftData(prev => ({
                                  ...prev,
                                  businessProfiles: prev.businessProfiles.map(b => b.id === biz.id ? { ...b, arabicName: val } : b)
                                }));
                              }} 
                              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-bold text-right outline-none focus:ring-2 focus:ring-primary/20" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <ImageUpload 
                              label="Entity Logo"
                              recommendedSize="400x400px"
                              value={biz.logoUrl}
                              onChange={(url) => setDraftData(prev => ({
                                ...prev,
                                businessProfiles: prev.businessProfiles.map(b => b.id === biz.id ? { ...b, logoUrl: url } : b)
                              }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Address / Location</label>
                            <textarea 
                              value={biz.address} 
                              rows={4}
                              onChange={e => {
                                const val = e.target.value;
                                setDraftData(prev => ({
                                  ...prev,
                                  businessProfiles: prev.businessProfiles.map(b => b.id === biz.id ? { ...b, address: val } : b)
                                }));
                              }} 
                              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 resize-none" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Phone</label>
                            <input 
                              type="text" 
                              value={biz.phone || ''} 
                              onChange={e => {
                                const val = e.target.value;
                                setDraftData(prev => ({
                                  ...prev,
                                  businessProfiles: prev.businessProfiles.map(b => b.id === biz.id ? { ...b, phone: val } : b)
                                }));
                              }} 
                              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Email</label>
                            <input 
                              type="email" 
                              value={biz.email || ''} 
                              onChange={e => {
                                const val = e.target.value;
                                setDraftData(prev => ({
                                  ...prev,
                                  businessProfiles: prev.businessProfiles.map(b => b.id === biz.id ? { ...b, email: val } : b)
                                }));
                              }} 
                              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">VAT / Tax ID</label>
                            <input 
                              type="text" 
                              value={biz.vatId || ''} 
                              onChange={e => {
                                const val = e.target.value;
                                setDraftData(prev => ({
                                  ...prev,
                                  businessProfiles: prev.businessProfiles.map(b => b.id === biz.id ? { ...b, vatId: val } : b)
                                }));
                              }} 
                              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none" 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Invoices List and Table */
                <div className="space-y-6">
                  {(() => {
                    let invoiceList = invoices.filter(inv => !inv.isSadad);

                    if (invoiceEntityFilter && invoiceEntityFilter !== 'all') {
                      invoiceList = invoiceList.filter(inv => String(inv.businessId) === String(invoiceEntityFilter));
                    }

                    if (invoiceStatusFilter && invoiceStatusFilter !== 'all') {
                      invoiceList = invoiceList.filter(inv => inv.paymentStatus === invoiceStatusFilter);
                    }

                    if (invoiceSearchText.trim()) {
                      const q = invoiceSearchText.toLowerCase().trim();
                      invoiceList = invoiceList.filter(inv => {
                        return (inv.invoiceNumber || '').toLowerCase().includes(q) ||
                               (inv.customerName || '').toLowerCase().includes(q) ||
                               (inv.customerPhone || '').toLowerCase().includes(q) ||
                               (inv.customerEmail || '').toLowerCase().includes(q) ||
                               (inv.date || '').toLowerCase().includes(q);
                      });
                    }

                    invoiceList.sort((a, b) => {
                      if (a.createdAt && b.createdAt) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                      }
                      return (b.date || '').localeCompare(a.date || '');
                    });

                    const totalRevenue = invoiceList.reduce((acc, inv) => acc + (inv.total || 0), 0);
                    const outstandingDue = invoiceList.reduce((acc, inv) => acc + (inv.paymentStatus === 'due' ? (inv.total || 0) : (inv.paymentStatus === 'partial' ? ((inv.total || 0) - (inv.amountPaid || 0)) : 0)), 0);
                    const paidCollections = invoiceList.reduce((acc, inv) => acc + (inv.paymentStatus === 'paid' ? (inv.total || 0) : (inv.paymentStatus === 'partial' ? (inv.amountPaid || 0) : 0)), 0);

                    return (
                      <>
                        {/* Analytical Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Invoiced</span>
                            <div className="text-xl font-black text-slate-900 dark:text-white">
                              {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium mt-1 block">{invoiceList.length} Invoices</span>
                          </div>

                          <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">Paid Collections</span>
                            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                              {paidCollections.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium mt-1 block">Successfully Received</span>
                          </div>

                          <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-1">Outstanding Due</span>
                            <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                              {outstandingDue.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium mt-1 block">Pending Clearance</span>
                          </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                          <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input
                              type="text"
                              placeholder="Search invoice number, client, phone..."
                              value={invoiceSearchText}
                              onChange={e => setInvoiceSearchText(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                              value={invoiceStatusFilter}
                              onChange={e => setInvoiceStatusFilter(e.target.value as any)}
                              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                            >
                              <option value="all">All Statuses</option>
                              <option value="paid">Paid</option>
                              <option value="due">Due</option>
                              <option value="partial">Partial</option>
                            </select>

                            <select
                              value={invoiceEntityFilter}
                              onChange={e => setInvoiceEntityFilter(e.target.value)}
                              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                            >
                              <option value="all">All Entities</option>
                              {draftData.businessProfiles.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Invoices Table */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
                          {invoiceList.length === 0 ? (
                            <div className="p-12 text-center">
                              <FileText className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                              <h4 className="text-sm font-bold text-slate-700 dark:text-zinc-300">No invoices found</h4>
                              <p className="text-xs text-slate-400 mt-1">Create your first invoice by clicking "New Invoice".</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                                    <th className="px-5 py-3.5">Invoice #</th>
                                    <th className="px-5 py-3.5">Date</th>
                                    <th className="px-5 py-3.5">Customer</th>
                                    <th className="px-5 py-3.5">Entity</th>
                                    <th className="px-5 py-3.5">Total</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                  {invoiceList.map(inv => {
                                    const biz = draftData.businessProfiles.find(b => b.id === inv.businessId);
                                    return (
                                      <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-5 py-4 font-mono font-black text-slate-900 dark:text-white">
                                          {inv.invoiceNumber}
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 dark:text-zinc-400 font-medium">
                                          {inv.date}
                                        </td>
                                        <td className="px-5 py-4">
                                          <div className="font-bold text-slate-900 dark:text-white">{inv.customerName}</div>
                                          {inv.customerPhone && (
                                            <div className="text-[10px] text-slate-400 font-medium">{inv.customerPhone}</div>
                                          )}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-zinc-400 font-medium">
                                          {biz?.name || 'Default'}
                                        </td>
                                        <td className="px-5 py-4 font-black text-slate-900 dark:text-white">
                                          {(inv.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
                                        </td>
                                        <td className="px-5 py-4">
                                          <span
                                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                              inv.paymentStatus === 'paid'
                                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                                : inv.paymentStatus === 'partial'
                                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                                : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                                            }`}
                                          >
                                            {inv.paymentStatus || 'paid'}
                                          </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                          <div className="flex items-center justify-end space-x-1">
                                            <a
                                              href={`/invoice/${encodeURIComponent(inv.id)}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                                              title="View Public Link"
                                            >
                                              <ExternalLink size={15} />
                                            </a>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setEditingInvoice(inv);
                                                setIsCreatingInvoice(true);
                                              }}
                                              className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                                              title="Edit Invoice"
                                            >
                                              <FileText size={15} />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setInvoiceToDelete(inv)}
                                              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                              title="Delete Invoice"
                                            >
                                              <Trash2 size={15} />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECEIPTS (SADAD) */}
          {activeTab === 'sadad-invoices' && (
            <div className="space-y-6">
              <SadadInvoice 
                onBack={() => setActiveTab('invoices')} 
                t={path => path} 
              />
            </div>
          )}

          {/* TAB 3: MAILBOX */}
          {activeTab === 'mailbox' && (
            <div className="space-y-6">
              <Mailbox />
            </div>
          )}

          {/* TAB: BROADCAST */}
          {activeTab === 'broadcast' && (
            <div className="space-y-6">
              <BroadcastManager invoices={invoices} />
            </div>
          )}

          {/* TAB 4: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Administrative & Staff Accounts
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Manage system users and access permissions for Invoices, Receipts, Mailbox, and User Management.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingUser(!isAddingUser)}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase flex items-center gap-1.5 shadow-md shadow-primary/20 hover:scale-105 transition-all"
                >
                  <UserPlus size={15} />
                  {isAddingUser ? 'Cancel' : 'Add User'}
                </button>
              </div>

              {/* Add New User Form */}
              <AnimatePresence>
                {isAddingUser && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Create New User</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Username / UID</label>
                          <input
                            type="text"
                            value={newUserData.username}
                            onChange={e => setNewUserData({ ...newUserData, username: e.target.value })}
                            placeholder="e.g. john"
                            className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Full Name</label>
                          <input
                            type="text"
                            value={newUserData.fullName}
                            onChange={e => setNewUserData({ ...newUserData, fullName: e.target.value })}
                            placeholder="e.g. John Doe"
                            className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Email</label>
                          <input
                            type="email"
                            value={newUserData.email}
                            onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                            placeholder="e.g. john@example.com"
                            className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Password</label>
                          <input
                            type="password"
                            value={newUserData.password}
                            onChange={e => setNewUserData({ ...newUserData, password: e.target.value })}
                            placeholder="Set secure password"
                            className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Role</label>
                          <select
                            value={newUserData.role}
                            onChange={e => setNewUserData({ ...newUserData, role: e.target.value as any })}
                            className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                          >
                            <option value="Staff">Staff</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={handleAddNewUser}
                          className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-primary/20 hover:scale-105 transition-all"
                        >
                          Confirm Create User
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Users List */}
              <div className="space-y-3">
                {draftData.users.map(user => {
                  const isPermsOpen = expandedUserPerms === user.id;
                  const isCurrentUser = user.id === currentUser?.id;

                  return (
                    <div
                      key={user.id}
                      className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center font-black text-sm">
                            {user.fullName ? user.fullName.slice(0, 2).toUpperCase() : user.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-black text-slate-900 dark:text-white">{user.fullName}</span>
                              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                {user.role}
                              </span>
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-medium">
                              @{user.username} • {user.email || 'No email set'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setExpandedUserPerms(isPermsOpen ? null : user.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                              isPermsOpen
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                            }`}
                          >
                            Permissions
                          </button>
                          {!isCurrentUser && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(user)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Permissions Editor */}
                      <AnimatePresence>
                        {isPermsOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-4 border-t border-slate-100 dark:border-zinc-800 overflow-hidden space-y-4"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                  type="text"
                                  value={user.fullName}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setDraftData(prev => ({
                                      ...prev,
                                      users: prev.users.map(u => u.id === user.id ? { ...u, fullName: val } : u)
                                    }));
                                  }}
                                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                <input
                                  type="email"
                                  value={user.email}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setDraftData(prev => ({
                                      ...prev,
                                      users: prev.users.map(u => u.id === user.id ? { ...u, email: val } : u)
                                    }));
                                  }}
                                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
                                />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Change Password</label>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                                  <input
                                    type={visiblePasswords[user.id] ? "text" : "password"}
                                    placeholder="Enter new password to change..."
                                    onChange={e => {
                                      const val = e.target.value;
                                      setDraftData(prev => ({
                                        ...prev,
                                        users: prev.users.map(u => u.id === user.id ? { ...u, password: val } : u)
                                      }));
                                    }}
                                    className="w-full pl-9 pr-10 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setVisiblePasswords(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                                  >
                                    {visiblePasswords[user.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                                Module Access Authorizations
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[
                                  { key: 'invoices', label: 'Invoices & Billing' },
                                  { key: 'sadad-invoices', label: 'Receipts' },
                                  { key: 'mailbox', label: 'Internal Mailbox' },
                                  { key: 'broadcast', label: 'Email Broadcast' },
                                  { key: 'users', label: 'User Management' }
                                ].map(perm => {
                                  const isChecked = (user.permissions || []).includes(perm.key);
                                  return (
                                    <button
                                      key={perm.key}
                                      type="button"
                                      onClick={() => {
                                        setDraftData(prev => ({
                                          ...prev,
                                          users: prev.users.map(u => {
                                            if (u.id === user.id) {
                                              const cur = u.permissions || [];
                                              const nu = cur.includes(perm.key)
                                                ? cur.filter(p => p !== perm.key)
                                                : [...cur, perm.key];
                                              return { ...u, permissions: nu };
                                            }
                                            return u;
                                          })
                                        }));
                                      }}
                                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                                        isChecked
                                          ? 'bg-primary/5 border-primary/30 text-primary'
                                          : 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 text-slate-400'
                                      }`}
                                    >
                                      <span>{perm.label}</span>
                                      <div className={`w-4 h-4 rounded flex items-center justify-center ${
                                        isChecked ? 'bg-primary text-white' : 'border border-slate-300 dark:border-zinc-700'
                                      }`}>
                                        {isChecked && <CheckCircle2 size={12} />}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: SITE LOGO & OPTIONS */}
          {activeTab === 'settings' && (
            <div className="space-y-8 max-w-5xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    Site Logo & Platform Options
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                    Manage the main site logo, platform branding, support details, and company entities.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleUpdateGitHubServer}
                    disabled={isUpdatingGitHub}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50"
                    title="Update all settings and invoices to GitHub server"
                  >
                    {isUpdatingGitHub ? <Loader2 size={15} className="animate-spin" /> : <CloudUpload size={15} />}
                    <span>{isUpdatingGitHub ? 'Updating...' : 'Update GitHub Server'}</span>
                  </button>

                  {hasDraftChanges && (
                    <button
                      type="button"
                      onClick={handleSaveDraftChanges}
                      disabled={isSaving}
                      className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-primary/25 transition-all"
                    >
                      <Save size={15} />
                      <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* GitHub Update Status Notification */}
              {gitHubUpdateStatus && (
                <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  gitHubUpdateStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : gitHubUpdateStatus.type === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                    : 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {gitHubUpdateStatus.type === 'success' ? (
                      <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : gitHubUpdateStatus.type === 'error' ? (
                      <X size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                    ) : (
                      <Loader2 size={16} className="animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                    <span>{gitHubUpdateStatus.message}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setGitHubUpdateStatus(null)} 
                    className="text-[10px] font-bold uppercase opacity-75 hover:opacity-100 ml-3 shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* CARD 1: GLOBAL SITE LOGO */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Global Site Logo
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      This logo appears prominently on the login screen, top application headers, and official documents.
                    </p>
                  </div>
                </div>

                {/* Live Preview Boxes */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Live Contrast Preview
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Light Canvas */}
                    <div className="p-6 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center min-h-[120px] text-center relative">
                      <span className="absolute top-2 left-3 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Light Mode Preview
                      </span>
                      {draftData?.general?.logoUrl ? (
                        <img 
                          src={draftData.general.logoUrl} 
                          alt="Site Logo Preview" 
                          className="h-12 max-w-[220px] object-contain" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 italic">No logo configured</span>
                      )}
                    </div>

                    {/* Dark Canvas */}
                    <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center min-h-[120px] text-center relative">
                      <span className="absolute top-2 left-3 text-[9px] font-black uppercase tracking-wider text-zinc-500">
                        Dark Mode Preview
                      </span>
                      {draftData?.general?.logoUrl ? (
                        <img 
                          src={draftData.general.logoUrl} 
                          alt="Site Logo Preview Dark" 
                          className="h-12 max-w-[220px] object-contain brightness-110" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs text-zinc-600 italic">No logo configured</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload & Direct URL Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <ImageUpload 
                      label="Upload New Logo Image"
                      recommendedSize="Recommended: 400x120px, PNG with transparent background or SVG"
                      value={draftData?.general?.logoUrl || ''}
                      onChange={(url) => setDraftData(prev => ({
                        ...prev,
                        general: {
                          ...prev.general,
                          logoUrl: url
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                        Direct Logo Image URL
                      </label>
                      <input 
                        type="url"
                        value={draftData?.general?.logoUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftData(prev => ({
                            ...prev,
                            general: {
                              ...prev.general,
                              logoUrl: val
                            }
                          }));
                        }}
                        placeholder="https://example.com/logo.png"
                        className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
                      />
                      <p className="text-[10px] text-slate-400">
                        Paste a direct image URL from ImgBB, GitHub, or any public image hosting CDN.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDraftData(prev => ({
                            ...prev,
                            general: {
                              ...prev.general,
                              logoUrl: 'https://i.ibb.co/pjjqSnRF/Logo-23D.png'
                            }
                          }));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw size={12} />
                        <span>Restore Default KH Dream Logo</span>
                      </button>

                      {draftData?.general?.logoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setDraftData(prev => ({
                              ...prev,
                              general: {
                                ...prev.general,
                                logoUrl: ''
                              }
                            }));
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-colors"
                        >
                          Clear Logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: PLATFORM DETAILS */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Platform Identity & Contacts
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Configure corporate name, WhatsApp line, and support contact credentials.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                      Platform / Business Name
                    </label>
                    <input 
                      type="text" 
                      value={draftData?.general?.siteName || 'KH Dream Services Limited'} 
                      onChange={e => {
                        const val = e.target.value;
                        setDraftData(prev => ({
                          ...prev,
                          general: {
                            ...prev.general,
                            siteName: val
                          }
                        }));
                      }} 
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                      Support WhatsApp Number
                    </label>
                    <input 
                      type="text" 
                      value={draftData?.general?.whatsapp || '966537681618'} 
                      onChange={e => {
                        const val = e.target.value;
                        setDraftData(prev => ({
                          ...prev,
                          general: {
                            ...prev.general,
                            whatsapp: val
                          }
                        }));
                      }} 
                      placeholder="966537681618"
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white" 
                    />
                  </div>
                </div>
              </div>

              {/* CARD 3: COMPANY PROFILES & ENTITIES */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Company Entities & Invoice Profiles
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        Configure individual business profiles, localized Arabic names, entity logos, and VAT/CR IDs.
                      </p>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => setDraftData(prev => ({ 
                      ...prev,
                      businessProfiles: [
                        ...prev.businessProfiles, 
                        { 
                          id: 'entity_' + Date.now(), 
                          name: 'New Business', 
                          arabicName: 'شركة جديدة', 
                          logoUrl: draftData?.general?.logoUrl || '', 
                          address: '', 
                          location: '', 
                          phone: '', 
                          email: '', 
                          vatId: '', 
                          invoicePrefix: 'INV', 
                          nextInvoiceNumber: 1 
                        }
                      ] 
                    }))} 
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase flex items-center gap-1.5 shadow-md shadow-primary/20 hover:scale-105 transition-all self-start sm:self-auto"
                  >
                    <Plus size={14} />
                    Add Entity
                  </button>
                </div>

                <div className="space-y-6">
                  {draftData.businessProfiles.map((biz) => (
                    <div key={biz.id} className="p-6 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-6 relative group">
                      <button 
                        type="button"
                        onClick={() => setBusinessToDelete(biz)}
                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"
                        title="Delete Entity"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Business Name (English)</label>
                          <input 
                            type="text" 
                            value={biz.name} 
                            onChange={e => {
                              const val = e.target.value;
                              setDraftData(prev => ({
                                ...prev,
                                businessProfiles: prev.businessProfiles.map(b => b.id === biz.id ? { ...b, name: val } : b)
                              }));
                            }} 
                            className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-black outline-none focus:ring-2 focus:ring-primary/20" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Business Name (Arabic)</label>
                          <input 
                            type="text" 
                            value={biz.arabicName} 
                            onChange={e => {
                              const val = e.target.value;
                              setDraftData(prev => ({
                                ...prev,
                                businessProfiles: prev.businessProfiles.map(b => b.id === biz.id ? { ...b, arabicName: val } : b)
                              }));
                            }} 
                            className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-bold text-right outline-none focus:ring-2 focus:ring-primary/20" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <ImageUpload 
                            label="Entity Logo"
                            recommendedSize="400x400px"
                            value={biz.logoUrl}
                            onChange={(url) => setDraftData(prev => ({
                              ...prev,
                              businessProfiles: prev.businessProfiles.map(b => b.id === biz.id ? { ...b, logoUrl: url } : b)
                            }))}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Address / Location</label>
                          <textarea 
                            value={biz.address} 
                            rows={4}
                            onChange={e => {
                              const val = e.target.value;
                              setDraftData(prev => ({
                                ...prev,
                                businessProfiles: prev.businessProfiles.map(b => b.id === biz.id ? { ...b, address: val } : b)
                              }));
                            }} 
                            className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 resize-none" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">VAT / Tax ID</label>
                          <input 
                            type="text" 
                            value={biz.vatId || ''} 
                            onChange={e => {
                              const val = e.target.value;
                              setDraftData(prev => ({
                                ...prev,
                                businessProfiles: prev.businessProfiles.map(b => b.id === biz.id ? { ...b, vatId: val } : b)
                              }));
                            }} 
                            className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-mono font-bold outline-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Invoice Prefix</label>
                          <input 
                            type="text" 
                            value={biz.invoicePrefix || ''} 
                            onChange={e => {
                              const val = e.target.value;
                              setDraftData(prev => ({
                                ...prev,
                                businessProfiles: prev.businessProfiles.map(b => b.id === biz.id ? { ...b, invoicePrefix: val } : b)
                              }));
                            }} 
                            className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Next Number</label>
                          <input 
                            type="number" 
                            value={biz.nextInvoiceNumber || 1} 
                            onChange={e => {
                              const val = parseInt(e.target.value) || 1;
                              setDraftData(prev => ({
                                ...prev,
                                businessProfiles: prev.businessProfiles.map(b => b.id === biz.id ? { ...b, nextInvoiceNumber: val } : b)
                              }));
                            }} 
                            className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-mono font-bold outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* GitHub Sync Modal */}
      <GitHubSyncModal
        isOpen={showGitHubSyncModal}
        onClose={() => setShowGitHubSyncModal(false)}
        localInvoices={invoices}
        onInvoicesUpdated={() => fetchInvoices()}
        currentCMSData={draftData || data}
        onCMSDataUpdated={(newData) => {
          setDraftData(newData);
          updateData(newData);
        }}
      />

      {/* Delete Invoice Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!invoiceToDelete}
        onClose={() => setInvoiceToDelete(null)}
        onConfirm={confirmDeleteInvoice}
        title="Delete Invoice"
        message={`Are you sure you want to permanently delete invoice ${invoiceToDelete?.invoiceNumber}? This action cannot be undone.`}
      />

      {/* Delete User Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to remove user account ${userToDelete?.fullName} (@${userToDelete?.username})?`}
      />

      {/* Delete Business Profile Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!businessToDelete}
        onClose={() => setBusinessToDelete(null)}
        onConfirm={confirmDeleteBusiness}
        title="Delete Entity"
        message={`Are you sure you want to remove company entity ${businessToDelete?.name}?`}
      />
    </div>
  );
};

export default React.memo(AdminPanel);
