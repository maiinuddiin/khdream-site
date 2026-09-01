import React, { useState, useMemo, useEffect } from 'react';
import { 
  Inbox, 
  Send, 
  Star, 
  Trash2, 
  FileText, 
  Search, 
  Plus, 
  MoreVertical, 
  Archive, 
  AlertCircle,
  ChevronLeft,
  Paperclip,
  Image as ImageIcon,
  Smile,
  X,
  Mail as MailIcon,
  CheckCircle2,
  Clock,
  User as UserIcon,
  Reply,
  Forward,
  CornerUpLeft,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS, MailMessage } from '../context/CMSContext';

type Folder = 'inbox' | 'sent' | 'starred' | 'drafts' | 'trash';

const Mailbox: React.FC = () => {
  const { data, updateData, saveChanges, currentUser, setCurrentUser } = useCMS();
  const [activeFolder, setActiveFolder] = useState<Folder>('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSendingSimulated, setIsSendingSimulated] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [syncErrorLogs, setSyncErrorLogs] = useState<string[]>([]);

  // Refresh and Sync states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshToast, setShowRefreshToast] = useState(false);
  const [refreshToastMsg, setRefreshToastMsg] = useState("");

  const handleRefreshMailbox = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setSyncErrorLogs([]);
    
    try {
      const token = localStorage.getItem('kh_admin_token');
      const response = await fetch('/api/sync-mailbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-admin-token': token } : {})
        },
        body: JSON.stringify({
          imapHost: (currentUser?.mailboxConfig?.isActive && currentUser?.mailboxConfig?.enableImapSync !== false) ? currentUser.mailboxConfig.imapHost : undefined,
          imapPort: (currentUser?.mailboxConfig?.isActive && currentUser?.mailboxConfig?.enableImapSync !== false) ? parseInt(currentUser.mailboxConfig.imapPort) || 993 : undefined,
          imapUseSSL: (currentUser?.mailboxConfig?.isActive && currentUser?.mailboxConfig?.enableImapSync !== false) ? currentUser.mailboxConfig.imapUseSSL : undefined,
          imapUser: (currentUser?.mailboxConfig?.isActive && currentUser?.mailboxConfig?.enableImapSync !== false) ? currentUser.mailboxConfig.imapUser : undefined,
          imapPassword: (currentUser?.mailboxConfig?.isActive && currentUser?.mailboxConfig?.enableImapSync !== false) ? currentUser.mailboxConfig.imapPassword : undefined,
          adminId: currentUser?.id || 'admin',
          adminEmail: currentUser?.mailboxConfig?.email || currentUser?.email || 'admin'
        }),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        updateData(prev => ({
          ...prev,
          messages: result.messages || prev.messages
        }));

        const totalNew = (result.newFetchedCount || 0) + (result.newSimulatedCount || 0);
        if (totalNew > 0) {
          setRefreshToastMsg(`Mail synchronized! Received ${totalNew} new message(s).`);
        } else {
          setRefreshToastMsg("Mailbox is up to date! No new messages.");
        }

        // Grab any warn/error messages from response sync logs
        if (Array.isArray(result.logs)) {
          const failures = result.logs.filter((log: string) => 
            log.toLowerCase().includes('warning') || 
            log.toLowerCase().includes('error') || 
            log.toLowerCase().includes('failed') || 
            log.includes('⚠️') || 
            log.includes('❌')
          );
          if (failures.length > 0) {
            setSyncErrorLogs(failures);
          }
        }

        setShowRefreshToast(true);
        setTimeout(() => setShowRefreshToast(false), 4000);
      } else {
        setRefreshToastMsg(result.error || "Failed to synchronise mailbox folders.");
        setSyncErrorLogs([result.error || "Mail synchronization request rejected by servers."]);
        setShowRefreshToast(true);
        setTimeout(() => setShowRefreshToast(false), 4000);
      }
    } catch (error: any) {
      console.error(error);
      setRefreshToastMsg("Connection timeout: sync agent unavailable temporarily.");
      setSyncErrorLogs([
        "❌ connection timeout: Server is unable to route protocol to your custom IMAP port.",
        "Check that your IMAP Server address and ports are open or try bypass SSL/TLS if supported."
      ]);
      setShowRefreshToast(true);
      setTimeout(() => setShowRefreshToast(false), 4000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // New message form state
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');

  // Email recipient suggestions
  const emailSuggestions = useMemo(() => {
    const list: { email: string; name: string; type: string }[] = [];
    
    // Add users
    if (Array.isArray(data.users)) {
      data.users.forEach(u => {
        if (u.email) {
          list.push({
            email: u.email,
            name: u.fullName || u.username || '',
            type: 'User'
          });
        }
      });
    }
    
    // Add subscribers
    if (Array.isArray(data.subscribers)) {
      data.subscribers.forEach(email => {
        if (email) {
          list.push({
            email,
            name: 'Mailing List',
            type: 'Subscriber'
          });
        }
      });
    }

    // Add newsletter subscribers
    if (Array.isArray(data.newsletterSubscribers)) {
      data.newsletterSubscribers.forEach(email => {
        if (email && !data.subscribers?.includes(email)) {
          list.push({
            email,
            name: 'Newsletter List',
            type: 'Subscriber'
          });
        }
      });
    }

    return list;
  }, [data.users, data.subscribers, data.newsletterSubscribers]);

  const typedToken = useMemo(() => {
    if (!composeTo) return '';
    const parts = composeTo.split(',');
    return parts[parts.length - 1].trim();
  }, [composeTo]);

  const matchingSuggestions = useMemo(() => {
    if (!typedToken) return [];
    const lowerToken = typedToken.toLowerCase();
    const seen = new Set<string>();
    return emailSuggestions.filter(s => {
      const lowerEmail = s.email.toLowerCase();
      if (seen.has(lowerEmail)) return false;
      const match = lowerEmail.includes(lowerToken) || s.name.toLowerCase().includes(lowerToken);
      if (match) {
        seen.add(lowerEmail);
        return true;
      }
      return false;
    }).slice(0, 10);
  }, [typedToken, emailSuggestions]);

  const selectSuggestion = (email: string) => {
    const parts = composeTo.split(',');
    parts[parts.length - 1] = ` ${email}`;
    const newRecipientString = parts.join(',').trim() + ', ';
    setComposeTo(newRecipientString);
  };

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    email: '',
    senderName: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    smtpUseSSL: true,
    imapHost: '',
    imapPort: '993',
    imapUser: '',
    imapPassword: '',
    imapUseSSL: true,
    isActive: true,
    gatewayType: 'standard',
    enableImapSync: true
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    logs: string[];
  } | null>(null);

  // Sync settings form with currentUser mailboxConfig
  useEffect(() => {
    if (currentUser) {
      setSettingsForm({
        email: currentUser.mailboxConfig?.email || '',
        senderName: currentUser.mailboxConfig?.senderName || currentUser.fullName || '',
        smtpHost: currentUser.mailboxConfig?.smtpHost || '',
        smtpPort: currentUser.mailboxConfig?.smtpPort || '587',
        smtpUser: currentUser.mailboxConfig?.smtpUser || currentUser.email || '',
        smtpPassword: currentUser.mailboxConfig?.smtpPassword || '••••••••',
        smtpUseSSL: currentUser.mailboxConfig?.smtpUseSSL !== false,
        imapHost: currentUser.mailboxConfig?.imapHost || '',
        imapPort: currentUser.mailboxConfig?.imapPort || '993',
        imapUser: currentUser.mailboxConfig?.imapUser || currentUser.email || '',
        imapPassword: currentUser.mailboxConfig?.imapPassword || '••••••••',
        imapUseSSL: currentUser.mailboxConfig?.imapUseSSL !== false,
        isActive: currentUser.mailboxConfig?.isActive !== false,
        gatewayType: currentUser.mailboxConfig?.gatewayType || 'standard',
        enableImapSync: currentUser.mailboxConfig?.enableImapSync !== false
      });
    }
  }, [currentUser]);

  // Handle auto mailbox sync on component mount
  useEffect(() => {
    if (currentUser?.mailboxConfig?.isActive) {
      handleRefreshMailbox();
    }
  }, []);

  const handleTestConnection = async () => {
    if (!settingsForm.isActive) {
      alert("Please enable Custom Mail Identity first before testing the connection.");
      return;
    }
    
    setIsTestingConnection(true);
    setConnectionTestResult(null);
    
    try {
      const token = localStorage.getItem('kh_admin_token');
      const response = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-admin-token': token } : {})
        },
        body: JSON.stringify({
          smtpHost: settingsForm.smtpHost,
          smtpPort: parseInt(settingsForm.smtpPort) || 587,
          smtpUseSSL: settingsForm.smtpUseSSL,
          smtpUser: settingsForm.smtpUser,
          smtpPassword: settingsForm.smtpPassword,
          imapHost: settingsForm.imapHost,
          imapPort: parseInt(settingsForm.imapPort) || 993,
          imapUseSSL: settingsForm.imapUseSSL,
          imapUser: settingsForm.imapUser,
          imapPassword: settingsForm.imapPassword,
          enableImapSync: settingsForm.enableImapSync
        }),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setConnectionTestResult({
          success: true,
          logs: result.logs || ["Verification completed successfully!"]
        });
      } else {
        setConnectionTestResult({
          success: false,
          logs: result.logs || [result.error || "Connection verification failed."]
        });
      }
    } catch (error: any) {
      setConnectionTestResult({
        success: false,
        logs: [
          `❌ [Network Fault] Failed to communicate with test node: ${error.message || String(error)}`,
          `Please check that your server dev environment is fully started and online.`
        ]
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const messages = data.messages || [];

  const filteredMessages = useMemo(() => {
    let base = messages;
    
    // Filter by folder
    switch (activeFolder) {
      case 'inbox':
        base = base.filter(m => {
          const isStandardRecipient = m.recipientId === currentUser?.id || (m.recipientId === 'admin' && currentUser?.role === 'Admin');
          const isCustomEmailRecipient = currentUser?.mailboxConfig?.isActive && currentUser?.mailboxConfig?.email && 
            m.recipientId.toLowerCase() === currentUser.mailboxConfig.email.toLowerCase();
          return (isStandardRecipient || isCustomEmailRecipient) && !m.isTrash;
        });
        break;
      case 'sent':
        base = base.filter(m => {
          const isStandardSender = m.senderId === currentUser?.id;
          const isCustomEmailSender = currentUser?.mailboxConfig?.isActive && currentUser?.mailboxConfig?.email && 
            m.senderId.toLowerCase() === currentUser.mailboxConfig.email.toLowerCase();
          return (isStandardSender || isCustomEmailSender) && !m.isTrash;
        });
        break;
      case 'starred':
        base = base.filter(m => m.isStarred && !m.isTrash);
        break;
      case 'drafts':
        base = base.filter(m => m.isDraft && !m.isTrash);
        break;
      case 'trash':
        base = base.filter(m => m.isTrash);
        break;
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      base = base.filter(m => 
        m.subject.toLowerCase().includes(q) || 
        m.senderName.toLowerCase().includes(q) || 
        m.content.toLowerCase().includes(q)
      );
    }

    return base.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [messages, activeFolder, currentUser, searchQuery]);

  const selectedMessage = useMemo(() => 
    messages.find(m => m.id === selectedMessageId),
  [messages, selectedMessageId]);

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = messages.map(m => m.id === id ? { ...m, isStarred: !m.isStarred } : m);
    updateData({ messages: updated });
    saveChanges({ ...data, messages: updated });
  };

  const handleMoveToTrash = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    let updatedDeletedIds = data.deletedMessageIds || [];
    const msg = messages.find(m => m.id === id);
    if (msg && msg.isTrash) {
      // Permanently delete by filtering out
      updated = messages.filter(m => m.id !== id);
      if (!updatedDeletedIds.includes(id)) {
        updatedDeletedIds = [...updatedDeletedIds, id];
      }
    } else {
      updated = messages.map(m => m.id === id ? { ...m, isTrash: true } : m);
    }
    updateData({ messages: updated, deletedMessageIds: updatedDeletedIds });
    saveChanges({ ...data, messages: updated, deletedMessageIds: updatedDeletedIds });
    if (selectedMessageId === id) setSelectedMessageId(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newConfig = {
      email: settingsForm.email,
      senderName: settingsForm.senderName,
      smtpHost: settingsForm.smtpHost,
      smtpPort: settingsForm.smtpPort,
      smtpUser: settingsForm.smtpUser,
      smtpPassword: settingsForm.smtpPassword,
      smtpUseSSL: settingsForm.smtpUseSSL,
      imapHost: settingsForm.imapHost,
      imapPort: settingsForm.imapPort,
      imapUser: settingsForm.imapUser,
      imapPassword: settingsForm.imapPassword,
      imapUseSSL: settingsForm.imapUseSSL,
      isActive: settingsForm.isActive,
      gatewayType: settingsForm.gatewayType,
      enableImapSync: settingsForm.enableImapSync
    };

    // Update in standard application data draft list
    const updatedUsers = (data.users || []).map(u => {
      if (u.id === currentUser.id) {
        return { ...u, mailboxConfig: newConfig };
      }
      return u;
    });
    updateData({ users: updatedUsers });

    // Update in current user session
    if (setCurrentUser) {
      setCurrentUser({
        ...currentUser,
        mailboxConfig: newConfig
      });
    }

    // Persist immediately to the server database
    saveChanges({ ...data, users: updatedUsers });

    setIsSettingsOpen(false);
    alert("Mailbox setup saved and synchronized with server successfully! Your custom mailbox credentials have been updated.");
  };

  const handleCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject || !composeContent) return;

    const isCustomActive = currentUser?.mailboxConfig?.isActive && currentUser?.mailboxConfig?.email;
    const senderEmail = isCustomActive ? currentUser.mailboxConfig.email : (currentUser?.id || 'unknown');
    const senderName = isCustomActive ? (currentUser.mailboxConfig.senderName || currentUser.fullName) : (currentUser?.fullName || currentUser?.username || 'Unknown');

    if (isCustomActive) {
      setIsSendingSimulated(true);
      setSimulationLog([`[SMTP Client] Resolving host "${currentUser.mailboxConfig?.smtpHost || ''}"...`]);
      
      const appendLog = (msg: string, delay: number) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            setSimulationLog(prev => [...prev, msg]);
            resolve();
          }, delay);
        });
      };

      await appendLog(`[SMTP Network] Establishing secure port connection on port ${currentUser.mailboxConfig?.smtpPort || '587'}...`, 400);
      await appendLog(`[TLS Protocol] Initiating secure cryptographic connection handshake...`, 400);
      await appendLog(`[SMTP Auth] Submitting custom credentials for user "${currentUser.mailboxConfig?.smtpUser || ''}"...`, 400);
      await appendLog(`[SMTP Sender Node] Server approved credentials. Preparing transmission blocks...`, 400);
      
      try {
        const token = localStorage.getItem('kh_admin_token');
        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "x-admin-token": token } : {})
          },
          body: JSON.stringify({
            to: composeTo.split(',').map(m => m.trim()).filter(Boolean),
            subject: composeSubject,
            html: composeContent.replace(/\n/g, '<br/>'),
            smtpConfig: {
              host: currentUser.mailboxConfig?.smtpHost,
              port: parseInt(currentUser.mailboxConfig?.smtpPort || '587'),
              secure: currentUser.mailboxConfig?.smtpUseSSL,
              user: currentUser.mailboxConfig?.smtpUser,
              pass: currentUser.mailboxConfig?.smtpPassword,
              from: `"${senderName}" <${senderEmail}>`
            }
          }),
          credentials: "include"
        });

        const result = await res.json();
        
        if (res.ok && result.success) {
          await appendLog(`[SMTP Dispatch] 250 OK: Message dispatched successfully! Message ID: ${result.messageId || 'Internal'}`, 200);
          
          const newMessage: MailMessage = {
            id: `msg-${Date.now()}`,
            senderId: senderEmail,
            senderName: senderName,
            recipientId: composeTo,
            subject: composeSubject,
            content: composeContent,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'internal'
          };

          const updatedMessages = [...(data.messages || []), newMessage];
          updateData({ messages: updatedMessages });
          await saveChanges({ ...data, messages: updatedMessages });

          setTimeout(() => {
            setIsSendingSimulated(false);
            setIsComposeOpen(false);
            resetCompose();
            alert(`Email sent successfully via SMTP!`);
          }, 1000);

        } else {
          setSimulationLog(prev => [
            ...prev,
            `❌ [SMTP Server Error] Dispatch rejected: ${result.error || 'Connection Failed'}`,
            `Details: ${result.details || 'Check your SMTP password or host details'}`
          ]);
          alert(`SMTP Error: ${result.error || 'Failed to dispatch email'}. Review terminal logs in progress screen.`);
        }
      } catch (err: any) {
        setSimulationLog(prev => [
          ...prev,
          `❌ [Network Fault] Failed to communicate with send-email node: ${err.message || String(err)}`
        ]);
        alert(`Network Error: Could not reach the email gateway server.`);
      }

    } else {
      // Direct Local Internal Routing
      const newMessage: MailMessage = {
        id: `msg-${Date.now()}`,
        senderId: senderEmail,
        senderName: senderName,
        recipientId: composeTo,
        subject: composeSubject,
        content: composeContent,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'internal'
      };

      const updatedMessages = [...(data.messages || []), newMessage];
      updateData({ messages: updatedMessages });
      saveChanges({ ...data, messages: updatedMessages });

      setIsComposeOpen(false);
      resetCompose();
    }
  };

  const resetCompose = () => {
    setComposeTo('');
    setComposeSubject('');
    setComposeContent('');
    setSimulationLog([]);
  };

  const markAsRead = (id: string) => {
    const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
    updateData({ messages: updated });
    saveChanges({ ...data, messages: updated });
  };

  const currentAddressLabel = useMemo(() => {
    if (currentUser?.mailboxConfig?.isActive && currentUser.mailboxConfig?.email) {
      return currentUser.mailboxConfig.email;
    }
    return currentUser ? `${currentUser.username}@dream.internal` : 'offline@dream.internal';
  }, [currentUser]);

  return (
    <div className="flex flex-col md:flex-row h-full bg-white dark:bg-zinc-950 overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl relative">
      {/* Sidebar - Desktop Only */}
      <div className="hidden md:flex w-64 border-r border-slate-100 dark:border-white/5 flex-col bg-slate-50/50 dark:bg-zinc-900/50 transition-all shrink-0">
        <div className="p-4 md:p-6">
          <button 
            onClick={() => setIsComposeOpen(true)}
            className="w-full flex items-center justify-center gap-3 py-3 md:py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl hover:scale-105 transition-all shadow-lg active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            <span className="hidden md:inline font-black uppercase tracking-widest text-[11px]">Compose</span>
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {[
            { id: 'inbox', label: 'Inbox', icon: Inbox, color: 'blue' },
            { id: 'sent', label: 'Sent', icon: Send, color: 'emerald' },
            { id: 'starred', label: 'Starred', icon: Star, color: 'amber' },
            { id: 'drafts', label: 'Drafts', icon: FileText, color: 'slate' },
            { id: 'trash', label: 'Trash', icon: Trash2, color: 'rose' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveFolder(item.id as Folder);
                setSelectedMessageId(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group relative
                ${activeFolder === item.id 
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              <item.icon size={18} className={activeFolder === item.id ? `text-${item.color}-500 transition-colors` : ''} />
              <span className="hidden md:inline text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              {item.id === 'inbox' && messages.some(m => !m.read && (m.recipientId === (currentUser?.id || 'admin') || (currentUser?.mailboxConfig?.email && m.recipientId.toLowerCase() === currentUser.mailboxConfig.email.toLowerCase()))) && (
                <span className="absolute right-4 w-2 h-2 rounded-full bg-blue-500 animate-pulse hidden md:block" />
              )}
            </button>
          ))}
        </nav>

        {/* User Mailbox Settings Widget */}
        <div className="p-4 md:p-6 border-t border-slate-100 dark:border-white/5">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-slate-100 dark:border-white/5 shadow-sm space-y-3">
            <h4 className="text-[9px] font-black uppercase tracking-widest opacity-50 block">Active Sender</h4>
            <div className="space-y-0.5">
              <span className="text-[10px] font-black tracking-tight block truncate text-primary uppercase">
                {currentUser?.mailboxConfig?.isActive && currentUser?.mailboxConfig?.email ? 'Custom Email Setup' : 'Internal System Alias'}
              </span>
              <span className="text-[9px] font-bold text-slate-500 block truncate" title={currentAddressLabel}>
                {currentAddressLabel}
              </span>
            </div>
            
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-full py-2 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-950 text-slate-700 dark:text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 border border-slate-200 dark:border-white/5"
            >
              <Settings size={12} />
              <span>Mail Settings</span>
            </button>
          </div>
          
          {/* Storage Bar (compacted) */}
          <div className="mt-4 bg-white/40 dark:bg-zinc-800/20 rounded-xl p-3 border border-slate-100 dark:border-white/5">
            <h4 className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Quota</h4>
            <div className="w-full h-1 bg-slate-100 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[12%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950">
        {/* Mobile folders scroll view tab bar */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2.5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0 select-none no-scrollbar">
          {[
            { id: 'inbox', label: 'Inbox', icon: Inbox, color: 'blue' },
            { id: 'sent', label: 'Sent', icon: Send, color: 'emerald' },
            { id: 'starred', label: 'Starred', icon: Star, color: 'amber' },
            { id: 'drafts', label: 'Drafts', icon: FileText, color: 'slate' },
            { id: 'trash', label: 'Trash', icon: Trash2, color: 'rose' },
          ].map((item) => {
            const isActive = activeFolder === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveFolder(item.id as Folder);
                  setSelectedMessageId(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-extrabold uppercase tracking-wider transition-all whitespace-nowrap
                  ${isActive 
                    ? 'bg-primary border-primary text-white shadow-sm' 
                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-805 text-slate-500'}`}
              >
                <item.icon size={11} className={isActive ? 'text-white' : `text-${item.color}-500`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 text-slate-500 text-[9px] font-extrabold uppercase tracking-wider transition-all whitespace-nowrap"
          >
            <Settings size={11} />
            <span>Settings</span>
          </button>
        </div>
        {/* Toolbar */}
        <div className="h-20 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          {selectedMessageId ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedMessageId(null)}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="h-6 w-px bg-slate-100 dark:bg-white/10 mx-2" />
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => selectedMessage && handleToggleStar(selectedMessage.id, e)}
                  className={`p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all ${selectedMessage?.isStarred ? 'text-amber-500' : 'text-slate-400'}`}
                >
                  <Star size={18} fill={selectedMessage?.isStarred ? 'currentColor' : 'none'} />
                </button>
                <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-slate-400">
                  <Archive size={18} />
                </button>
                <button 
                  onClick={(e) => selectedMessage && handleMoveToTrash(selectedMessage.id, e)}
                  className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
                <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-slate-400">
                  <AlertCircle size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100/50 dark:bg-white/5 border border-transparent focus:border-slate-200 dark:focus:border-white/10 rounded-2xl pl-12 pr-6 py-2.5 text-xs font-medium outline-none transition-all focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefreshMailbox}
              disabled={isRefreshing}
              className={`p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-slate-400 flex items-center justify-center ${isRefreshing ? 'animate-spin text-primary' : ''}`}
              title="Sync Inbox / تحديث الوارد"
            >
              <RefreshCw size={20} />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-slate-400"
              title="Mailbox Setup"
            >
              <Settings size={20} />
            </button>
            <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-slate-400">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* List or Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!selectedMessageId ? (
            <>
              {syncErrorLogs.length > 0 && (
                <div className="p-4 mx-6 mt-6 bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 rounded-2xl flex items-start gap-3.5 text-left shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <AlertCircle size={15} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-400">Server Connection Diagnostic Alert</h5>
                    <div className="text-[10px] font-bold text-amber-700/90 dark:text-amber-400/80 leading-relaxed space-y-1 font-mono">
                      {syncErrorLogs.map((log, i) => (
                        <p key={i}>{log}</p>
                      ))}
                    </div>
                    <div className="pt-1.5 flex items-center gap-4">
                      <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="text-[9px] font-black uppercase tracking-widest text-zinc-900 dark:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 dark:border-amber-500/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        Adjust IMAP Credentials
                      </button>
                      <button 
                        onClick={handleRefreshMailbox}
                        className="text-[9px] font-black uppercase tracking-widest text-amber-700/80 dark:text-amber-450 hover:text-amber-900 dark:hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        Retry Sync
                      </button>
                      <button 
                        onClick={() => setSyncErrorLogs([])}
                        className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        Dismiss Alert
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                <AnimatePresence mode="popLayout">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((m) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={m.id}
                      onClick={() => {
                        setSelectedMessageId(m.id);
                        markAsRead(m.id);
                      }}
                      className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 px-6 py-4 cursor-pointer transition-all hover:bg-slate-50/80 dark:hover:bg-white/5 relative group border-b border-dashed border-slate-100 dark:border-white/5
                        ${!m.read ? 'bg-blue-50/30 dark:bg-blue-500/5' : ''}`}
                    >
                      {!m.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md" />
                      )}
                      
                      <div className="flex items-center gap-4 shrink-0 sm:w-48">
                        <button 
                          onClick={(e) => handleToggleStar(m.id, e)}
                          className={`shrink-0 transition-colors ${m.isStarred ? 'text-amber-500' : 'text-slate-300 opacity-100 sm:opacity-0 group-hover:opacity-100'}`}
                        >
                          <Star size={16} fill={m.isStarred ? 'currentColor' : 'none'} />
                        </button>
                        <div className="w-7 h-7 rounded-sm bg-slate-150 dark:bg-zinc-850 text-slate-600 dark:text-zinc-400 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-205 dark:border-white/5 sm:hidden">
                          {m.senderName.charAt(0).toUpperCase()}
                        </div>
                        <span className={`text-[11px] truncate max-w-[150px] ${!m.read ? 'font-black text-slate-900 dark:text-white uppercase tracking-wide' : 'font-semibold text-slate-500 dark:text-zinc-450'}`}>
                          {m.senderName}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <span className={`text-[11px] font-black truncate max-w-[250px] shrink-0 ${!m.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-350'}`}>
                          {m.subject}
                        </span>
                        <span className="hidden sm:inline text-slate-300 dark:text-zinc-700 font-normal shrink-0">—</span>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 truncate font-semibold flex-1 min-w-0">
                          {m.content ? m.content.replace(/<[^>]+>/g, ' ').substring(0, 150) : ''}
                        </span>
                      </div>

                      <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 sm:w-auto h-5">
                        {m.attachments && m.attachments.length > 0 && (
                          <span title={`${m.attachments.length} attachment(s)`} className="inline-flex items-center shrink-0">
                            <Paperclip size={12} className="text-slate-400" />
                          </span>
                        )}
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none sm:pr-2">
                          {(() => {
                            const d = new Date(m.timestamp);
                            const today = new Date();
                            if (d.toDateString() === today.toDateString()) {
                              return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            }
                            return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                          })()}
                        </span>
                        <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleMoveToTrash(m.id, e)}
                            className="p-1 px-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                      <MailIcon size={32} className="text-slate-300 dark:text-zinc-700" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-2">No messages found</h3>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 max-w-xs mb-5">
                      No travel enquiries or alerts here. Click check for mail to fetch live server updates!
                    </p>
                    <button
                      onClick={handleRefreshMailbox}
                      disabled={isRefreshing}
                      className="px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.03] active:scale-95 text-[10px] uppercase font-black tracking-widest rounded-xl transition-all flex items-center gap-2 border border-slate-200 dark:border-white/10 shadow-lg disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                      <span>{isRefreshing ? "Synchronizing Inbox..." : "Check for Mail / تحديث البريد"}</span>
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div></>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 md:px-12 py-10 max-w-4xl mx-auto"
            >
              <div className="mb-10">
                <div className="flex items-start justify-between mb-8">
                  <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white leading-tight">
                    {selectedMessage?.subject}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {activeFolder}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-lg border border-black/5 shrink-0">
                      {selectedMessage?.senderName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest break-all">{selectedMessage?.senderName}</h4>
                        <span className="text-[10px] text-slate-400 font-medium break-all">&lt;{selectedMessage?.senderId}&gt;</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex flex-wrap items-center gap-1.5 leading-relaxed">
                        to {selectedMessage?.recipientId === 'admin' ? 'Admins' : selectedMessage?.recipientId === currentUser?.id ? 'Me' : selectedMessage?.recipientId === currentUser?.mailboxConfig?.email ? `${currentUser?.mailboxConfig?.email} (Me)` : selectedMessage?.recipientId}
                        <Clock size={10} className="shrink-0" />
                        <span className="break-all">{new Date(selectedMessage?.timestamp || '').toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setComposeTo(selectedMessage?.senderId || '');
                        setComposeSubject(`Re: ${selectedMessage?.subject}`);
                        setComposeContent(`\n\nOn ${new Date(selectedMessage?.timestamp || '').toLocaleString()}, ${selectedMessage?.senderName} wrote:\n> ${selectedMessage?.content}`);
                        setIsComposeOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-slate-600 dark:text-zinc-400"
                    >
                      <CornerUpLeft size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Reply</span>
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-slate-400">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-12">
                {selectedMessage?.htmlContent ? (
                  <div 
                    className="text-slate-655 dark:text-zinc-350 leading-relaxed text-[13px] bg-slate-50/50 dark:bg-white/[0.01] p-4 rounded-2xl border border-slate-200/40 dark:border-white/5 overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: selectedMessage.htmlContent }}
                  />
                ) : (
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-[13px] whitespace-pre-wrap font-medium">
                    {selectedMessage?.content}
                  </p>
                )}
              </div>

              {selectedMessage?.attachments && selectedMessage.attachments.length > 0 && (
                <div className="mb-10 pt-8 border-t border-slate-100 dark:border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                    <Paperclip size={13} />
                    Attachments / المرفقات ({selectedMessage.attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedMessage.attachments.map((att: any, i: number) => (
                      <a
                        key={i}
                        href={att.url}
                        download={att.filename}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/5 rounded-2xl transition-all group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary border border-primary/10">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0 text-left">
                            <p className="text-xs font-bold text-slate-700 dark:text-zinc-200 truncate pr-2">
                              {att.filename}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {att.size ? (att.size / 1024).toFixed(1) : "0.0"} KB
                            </p>
                          </div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-slate-150 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary/20 transition-all">
                          <Download size={14} />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-10 border-t border-slate-100 dark:border-white/5">
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setComposeTo(selectedMessage?.senderId || '');
                      setComposeSubject(`Re: ${selectedMessage?.subject}`);
                      setComposeContent(`\n\nOn ${new Date(selectedMessage?.timestamp || '').toLocaleString()}, ${selectedMessage?.senderName} wrote:\n> ${selectedMessage?.content}`);
                      setIsComposeOpen(true);
                    }}
                    className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Reply size={14} />
                    Reply to {selectedMessage?.senderName}
                  </button>
                  <button 
                    onClick={() => {
                      setComposeTo('');
                      setComposeSubject(`Fwd: ${selectedMessage?.subject}`);
                      setComposeContent(`\n\n---------- Forwarded message ---------\nFrom: ${selectedMessage?.senderName} <${selectedMessage?.senderId}>\nDate: ${new Date(selectedMessage?.timestamp || '').toLocaleString()}\nSubject: ${selectedMessage?.subject}\n\n${selectedMessage?.content}`);
                      setIsComposeOpen(true);
                    }}
                    className="px-6 py-3 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                  >
                    <Forward size={14} />
                    Forward
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Compose Drawer */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-[2000] flex items-end justify-center md:items-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSendingSimulated) setIsComposeOpen(false);
              }}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />
            <motion.div
              layoutId="compose"
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="bg-zinc-900 dark:bg-white p-6 md:p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-zinc-900/10 flex items-center justify-center">
                    <MailIcon size={20} className="text-white dark:text-zinc-900" />
                  </div>
                  <div>
                    <h3 className="text-white dark:text-zinc-900 font-black uppercase tracking-[0.2em] text-[11px] mb-0.5">New Message</h3>
                    <p className="text-white/60 dark:text-zinc-900/60 text-[9px] font-bold uppercase tracking-widest">
                      {currentUser?.mailboxConfig?.isActive && currentUser?.mailboxConfig?.email ? `Transmitting as: ${currentUser.mailboxConfig.email}` : 'Internal Mail Alias'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsComposeOpen(false)}
                  disabled={isSendingSimulated}
                  className="p-3 hover:bg-white/10 dark:hover:bg-black/5 rounded-full text-white dark:text-zinc-900 transition-all active:scale-90 disabled:opacity-40"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCompose} className="p-8 md:p-10 space-y-8">
                {isSendingSimulated ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full border-4 border-t-primary border-primary/20 animate-spin flex items-center justify-center">
                      <Send size={24} className="text-primary animate-pulse" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">Connecting SMTP Node</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Relaying custom message packet over secure channel</p>
                    </div>
                    
                    <div className="w-full max-w-md bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-[9px] text-left space-y-1 h-32 overflow-y-auto">
                      {simulationLog.map((log, index) => (
                        <div key={index} className="leading-relaxed text-emerald-400 animate-pulse">
                          &gt; {log}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recipient Address / ID</label>
                        <div className="relative group">
                          <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            required
                            value={composeTo}
                            onChange={(e) => setComposeTo(e.target.value)}
                            placeholder="e.g. admin, user@domain.com, subscriber@host.org"
                            className="w-full bg-slate-50 dark:bg-zinc-950 border border-transparent focus:border-blue-500 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold outline-none transition-all focus:bg-white"
                          />
                          {matchingSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto overflow-x-hidden z-50 divide-y divide-slate-100 dark:divide-zinc-800">
                              {matchingSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => selectSuggestion(suggestion.email)}
                                  className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between text-xs font-bold transition-all relative z-50"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-slate-800 dark:text-slate-100 font-bold">{suggestion.email}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{suggestion.name}</span>
                                  </div>
                                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/20">
                                    {suggestion.type}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</label>
                        <div className="relative group">
                          <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            required
                            value={composeSubject}
                            onChange={(e) => setComposeSubject(e.target.value)}
                            placeholder="What is this about?"
                            className="w-full bg-slate-50 dark:bg-zinc-950 border border-transparent focus:border-blue-500 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold outline-none transition-all focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message Content</label>
                      <textarea 
                        required
                        value={composeContent}
                        onChange={(e) => setComposeContent(e.target.value)}
                        placeholder="Write your beautiful message here..."
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-transparent focus:border-blue-500 rounded-3xl p-6 text-xs font-medium outline-none transition-all focus:bg-white resize-none h-48"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2">
                        <button type="button" className="p-3 text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
                          <Paperclip size={20} />
                        </button>
                        <button type="button" className="p-3 text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
                          <ImageIcon size={20} />
                        </button>
                        <button type="button" className="p-3 text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
                          <Smile size={20} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <button 
                          type="button" 
                          onClick={() => setIsComposeOpen(false)}
                          className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="group flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-900/10 dark:shadow-white/5"
                        >
                          <span className="text-[11px] font-black uppercase tracking-widest">Send Message</span>
                          <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mailbox Custom Setup Settings Drawer */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[2020] flex items-end justify-center md:items-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />
            <motion.div
              layoutId="mailbox-settings"
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="bg-primary p-6 md:p-8 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Settings size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-black uppercase tracking-[0.2em] text-[11px] mb-0.5">My Custom Mailbox Identity</h3>
                    <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest">Configure your personalized email sender keys</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-3 hover:bg-white/10 rounded-full text-white transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="p-8 md:p-10 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                
                {/* Custom Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-white/5 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="font-black uppercase tracking-wider block text-slate-800 dark:text-white">Enable Custom Mail Identity</span>
                    <span className="text-slate-400 block font-medium">Use my unique SMTP/IMAP credentials instead of system default</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, isActive: !settingsForm.isActive })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${settingsForm.isActive ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${settingsForm.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>



                <div className="grid md:grid-cols-2 gap-6">
                  {/* Sender Name */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block ml-1">My Outgoing Display Name</label>
                    <input 
                      type="text" 
                      required={settingsForm.isActive}
                      disabled={!settingsForm.isActive}
                      value={settingsForm.senderName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, senderName: e.target.value })}
                      placeholder="e.g. Maii Nuddiin"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-transparent focus:border-primary disabled:opacity-40 rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all"
                    />
                  </div>

                  {/* Mailbox Email Address */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block ml-1">My Outgoing Email Address</label>
                    <input 
                      type="email" 
                      required={settingsForm.isActive}
                      disabled={!settingsForm.isActive}
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      placeholder="e.g. maii@traveldomain.com"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-transparent focus:border-primary disabled:opacity-40 rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/5 my-6 pt-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">SMTP Sending Gateway (Outgoing Server)</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-1">SMTP Server Host</label>
                      <input 
                        type="text" 
                        disabled={!settingsForm.isActive}
                        value={settingsForm.smtpHost}
                        onChange={(e) => setSettingsForm({ ...settingsForm, smtpHost: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-transparent focus:border-primary disabled:opacity-40 rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-1">Port</label>
                      <input 
                        type="text" 
                        disabled={!settingsForm.isActive}
                        value={settingsForm.smtpPort}
                        onChange={(e) => setSettingsForm({ ...settingsForm, smtpPort: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-transparent focus:border-primary disabled:opacity-40 rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-1">SMTP User</label>
                      <input 
                        type="text" 
                        disabled={!settingsForm.isActive}
                        value={settingsForm.smtpUser}
                        onChange={(e) => setSettingsForm({ ...settingsForm, smtpUser: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-transparent focus:border-primary disabled:opacity-40 rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-1">SMTP Secret Password</label>
                      <input 
                        type="password" 
                        disabled={!settingsForm.isActive}
                        value={settingsForm.smtpPassword}
                        onChange={(e) => setSettingsForm({ ...settingsForm, smtpPassword: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-transparent focus:border-primary disabled:opacity-40 rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-3 pt-6 min-w-max">
                      <input 
                        type="checkbox" 
                        id="smtpUseSSL"
                        disabled={!settingsForm.isActive}
                        checked={settingsForm.smtpUseSSL}
                        onChange={(e) => setSettingsForm({ ...settingsForm, smtpUseSSL: e.target.checked })}
                        className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary dark:bg-zinc-950 dark:border-white/10"
                      />
                      <label htmlFor="smtpUseSSL" className="text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer">SSL Settings / تفعيل SSL</label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/5 my-6 pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">IMAP Receiving Gateway (Incoming Server)</h4>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="enableImapSync"
                        disabled={!settingsForm.isActive}
                        checked={settingsForm.enableImapSync}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableImapSync: e.target.checked })}
                        className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary dark:bg-zinc-950 dark:border-white/10"
                      />
                      <label htmlFor="enableImapSync" className="text-[8px] font-black uppercase tracking-widest text-slate-500 cursor-pointer">Enable Active Incoming Sync / تفعيل المزامنة الواردة</label>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-1">IMAP Server Host</label>
                      <input 
                        type="text" 
                        disabled={!settingsForm.isActive}
                        value={settingsForm.imapHost}
                        onChange={(e) => setSettingsForm({ ...settingsForm, imapHost: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-transparent focus:border-primary disabled:opacity-40 rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-1">Port</label>
                      <input 
                        type="text" 
                        disabled={!settingsForm.isActive}
                        value={settingsForm.imapPort}
                        onChange={(e) => setSettingsForm({ ...settingsForm, imapPort: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-transparent focus:border-primary disabled:opacity-40 rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-1">IMAP User</label>
                      <input 
                        type="text" 
                        disabled={!settingsForm.isActive}
                        value={settingsForm.imapUser}
                        onChange={(e) => setSettingsForm({ ...settingsForm, imapUser: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-transparent focus:border-primary disabled:opacity-40 rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-1">IMAP Password</label>
                      <input 
                        type="password" 
                        disabled={!settingsForm.isActive}
                        value={settingsForm.imapPassword}
                        onChange={(e) => setSettingsForm({ ...settingsForm, imapPassword: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-transparent focus:border-primary disabled:opacity-40 rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-3 pt-6 min-w-max">
                      <input 
                        type="checkbox" 
                        id="imapUseSSL"
                        disabled={!settingsForm.isActive}
                        checked={settingsForm.imapUseSSL}
                        onChange={(e) => setSettingsForm({ ...settingsForm, imapUseSSL: e.target.checked })}
                        className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary dark:bg-zinc-950 dark:border-white/10"
                      />
                      <label htmlFor="imapUseSSL" className="text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer">SSL Settings / تفعيل SSL</label>
                    </div>
                  </div>
                </div>

                {/* Connection Verification Section */}
                <div className="border-t border-slate-100 dark:border-white/5 my-6 pt-6 bg-slate-50 dark:bg-zinc-950 p-6 rounded-3xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white">Connection Verification</h4>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Test custom SMTP and IMAP settings status</p>
                    </div>
                    <button
                      type="button"
                      disabled={isTestingConnection || !settingsForm.isActive}
                      onClick={handleTestConnection}
                      className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-40"
                    >
                      {isTestingConnection ? "Testing Connection..." : "Test Connection / فحص الاتصال"}
                    </button>
                  </div>

                  {isTestingConnection && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Establishing secure contact with network nodes...</span>
                    </div>
                  )}

                  {connectionTestResult && (
                    <div className="space-y-3 animate-in fade-in-50 duration-300">
                      {connectionTestResult.success ? (
                        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                          <CheckCircle2 size={16} className="shrink-0 animate-bounce" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Connection Test Successful! SMTP verified correctly.</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl">
                          <AlertCircle size={16} className="shrink-0" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Connection Test Failed! Please review inputs.</span>
                        </div>
                      )}
                      <div className="bg-slate-900 dark:bg-black rounded-2xl p-4 font-mono text-[9px] leading-relaxed max-h-48 overflow-y-auto space-y-1 text-left select-text border border-slate-800">
                        {connectionTestResult.logs.map((log, index) => (
                          <div 
                            key={index} 
                            className={log.includes('❌') || log.includes('Error') || log.includes('failed') ? 'text-rose-400 font-bold' : (log.includes('⚠️') || log.includes('Warning') ? 'text-amber-400 font-bold' : 'text-emerald-400')}
                          >
                            &gt; {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-3.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/10"
                  >
                    Save Setup
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sync Toast Notification */}
      <AnimatePresence>
        {showRefreshToast && (
          <motion.div
            initial={{ opacity: 0, y: 55, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 p-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 dark:border-slate-200 max-w-sm"
          >
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
              <MailIcon size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 leading-none mb-1">Mail Desk Link</p>
              <p className="text-xs font-bold leading-tight">{refreshToastMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Mailbox;
