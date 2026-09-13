import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, 
  Send, 
  Users, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  Eye, 
  RefreshCw, 
  FileText, 
  Settings, 
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Save,
  Clock,
  UserCheck
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';

interface BroadcastInvoice {
  id?: string;
  clientEmail?: string;
  recipientEmail?: string;
  [key: string]: any;
}

interface BroadcastManagerProps {
  invoices?: BroadcastInvoice[];
}

interface BroadcastHistoryItem {
  id: string;
  timestamp: string;
  subject: string;
  recipientCount: number;
  recipientsList: string[];
  status: 'delivered' | 'failed' | 'simulated';
  sender: string;
}

export const BroadcastManager: React.FC<BroadcastManagerProps> = ({ invoices = [] }) => {
  const { data, updateData, currentUser } = useCMS();

  // Active view: 'composer' | 'subscribers' | 'template' | 'history'
  const [activeSubTab, setActiveSubTab] = useState<'composer' | 'subscribers' | 'template' | 'history'>('composer');

  // Broadcast Content State
  const [subject, setSubject] = useState<string>('Important Update & Announcement - ' + (data?.general?.siteName || 'KH Dream Services'));
  const [senderName, setSenderName] = useState<string>(data?.general?.siteName || 'KH Dream Services Announcements');
  const [senderEmail, setSenderEmail] = useState<string>(data?.general?.email || currentUser?.email || 'announcements@khdreamservices.com');
  const [content, setContent] = useState<string>(
    `Dear Valued Partner & Client,\n\nWe are pleased to announce significant operational enhancements to our enterprise portal and advisory services. Our updated billing, real-time documentation systems, and automated tracking are now live.\n\nKey Highlights:\n- Automated Invoice & Receipt Generation with verified QR codes\n- Direct corporate correspondence via encrypted internal mailbox\n- 24/7 dedicated corporate account assistance\n\nIf you have any questions or require administrative assistance, please reply directly to this notice or contact your designated corporate advisor.\n\nWarm regards,\nManagement Team\n${data?.general?.siteName || 'KH Dream Services Limited'}`
  );
  const [ctaText, setCtaText] = useState<string>('Access Portal');
  const [ctaUrl, setCtaUrl] = useState<string>('https://khdreamservices.com');
  const [templateStyle, setTemplateStyle] = useState<'corporate' | 'clean' | 'custom'>('corporate');

  // Audience Target Selection
  const [targetStaff, setTargetStaff] = useState<boolean>(true);
  const [targetSubscribers, setTargetSubscribers] = useState<boolean>(true);
  const [targetClients, setTargetClients] = useState<boolean>(true);
  const [customEmailsInput, setCustomEmailsInput] = useState<string>('');
  const [excludedEmails, setExcludedEmails] = useState<string[]>([]);

  // Preview Mode: 'desktop' | 'mobile'
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Sending State
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendProgress, setSendProgress] = useState<{ current: number; total: number; logs: string[] }>({
    current: 0,
    total: 0,
    logs: []
  });
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Quick Test Email State
  const [testRecipient, setTestRecipient] = useState<string>(currentUser?.email || 'admin@khdreamservices.com');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'success' | 'error' | null>(null);

  // Subscribers Management State
  const [newSubscriberEmail, setNewSubscriberEmail] = useState<string>('');
  const [subscriberSearch, setSubscriberSearch] = useState<string>('');
  const [copiedEmails, setCopiedEmails] = useState<boolean>(false);

  // History State
  const [history, setHistory] = useState<BroadcastHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('kh_broadcast_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'hist-1',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        subject: 'Scheduled System Maintenance Notice',
        recipientCount: 14,
        recipientsList: ['admin@khdreamservices.com', 'maiinuddiin@gmail.com'],
        status: 'delivered',
        sender: 'KH Dream Services Support'
      }
    ];
  });

  // Template Editor State
  const [templateSubject, setTemplateSubject] = useState<string>(
    data?.general?.broadcastEmailTemplate?.subject || 'Dream Services Corporate Announcement'
  );
  const [templateBody, setTemplateBody] = useState<string>(
    data?.general?.broadcastEmailTemplate?.body || `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1e293b; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="background: #1e3a8a; padding: 24px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.05em;">KH DREAM SERVICES</h1>
    <p style="color: #93c5fd; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Official Corporate Dispatch</p>
  </div>
  <div style="padding: 32px 28px; line-height: 1.6; font-size: 14px;">
    {broadcastContent}
  </div>
  <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
    <p style="margin: 0 0 4px 0; font-weight: bold; color: #334155;">KH Dream Services Limited • Olaya District, Riyadh, KSA</p>
    <p style="margin: 0;">Authorized under Saudi Vision 2030 Corporate Framework</p>
  </div>
</div>`
  );
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);
  const [templateSaveSuccess, setTemplateSaveSuccess] = useState<boolean>(false);

  // Recipient aggregation
  const audienceLists = useMemo(() => {
    // 1. Staff users
    const staffEmails = (data.users || [])
      .map(u => u.email?.trim().toLowerCase())
      .filter((e): e is string => !!e && e.includes('@'));

    // 2. Subscribers
    const subEmails = [...(data.subscribers || []), ...(data.newsletterSubscribers || [])]
      .map(s => s.trim().toLowerCase())
      .filter((e): e is string => !!e && e.includes('@'));

    // 3. Invoice clients
    const clientEmails = (invoices || [])
      .map(inv => inv.clientEmail?.trim().toLowerCase())
      .filter((e): e is string => !!e && e.includes('@'));

    // 4. Custom emails
    const customEmails = customEmailsInput
      .split(/[\n,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => !!e && e.includes('@'));

    return {
      staff: Array.from(new Set(staffEmails)),
      subscribers: Array.from(new Set(subEmails)),
      clients: Array.from(new Set(clientEmails)),
      custom: Array.from(new Set(customEmails))
    };
  }, [data.users, data.subscribers, data.newsletterSubscribers, invoices, customEmailsInput]);

  // Combined Unique Target Audience
  const finalRecipients = useMemo(() => {
    const list: string[] = [];
    if (targetStaff) list.push(...audienceLists.staff);
    if (targetSubscribers) list.push(...audienceLists.subscribers);
    if (targetClients) list.push(...audienceLists.clients);
    list.push(...audienceLists.custom);

    const unique = Array.from(new Set(list));
    // Filter out excluded emails
    return unique.filter(e => !excludedEmails.includes(e));
  }, [targetStaff, targetSubscribers, targetClients, audienceLists, excludedEmails]);

  // Generate Email HTML
  const generateEmailHtml = (rawContent: string) => {
    const formattedBody = rawContent
      .split('\n\n')
      .map(para => `<p style="margin: 0 0 16px 0; color: #334155; font-size: 14.5px; line-height: 1.65;">${para.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    const logoImgTag = data?.general?.logoUrl 
      ? `<img src="${data.general.logoUrl}" alt="KH Dream" style="max-height: 48px; max-width: 220px; object-fit: contain; margin: 0 auto; display: block;" />`
      : `<div style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 2px;">KH DREAM</div>`;

    const ctaHtml = ctaText && ctaUrl ? `
      <div style="text-align: center; margin: 28px 0 20px 0;">
        <a href="${ctaUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-size: 13.5px; font-weight: bold; display: inline-block; letter-spacing: 0.03em; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
          ${ctaText}
        </a>
      </div>
    ` : '';

    if (templateStyle === 'clean') {
      return `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"/><title>${subject}</title></head>
        <body style="margin: 0; padding: 30px 15px; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
            <tr>
              <td style="padding: 28px 32px; border-bottom: 1px solid #f1f5f9; text-align: left;">
                ${logoImgTag}
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 32px 20px 32px;">
                <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.3;">${subject}</h2>
                ${formattedBody}
                ${ctaHtml}
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
                <p style="margin: 0 0 4px 0;">Official communication dispatched by ${data?.general?.siteName || 'KH Dream Services'}.</p>
                <p style="margin: 0;">Kingdom of Saudi Arabia • CR / VAT Compliant</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    }

    if (templateStyle === 'custom') {
      let customTpl = templateBody;
      customTpl = customTpl.replace('{broadcastContent}', formattedBody + ctaHtml);
      customTpl = customTpl.replace('{siteName}', data?.general?.siteName || 'KH Dream Services');
      customTpl = customTpl.replace('{logoUrl}', data?.general?.logoUrl || '');
      customTpl = customTpl.replace('{year}', new Date().getFullYear().toString());
      return customTpl;
    }

    // Default 'corporate'
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"/><title>${subject}</title></head>
      <body style="margin: 0; padding: 30px 15px; background-color: #0f172a; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 640px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 36px 24px; text-align: center;">
              ${logoImgTag}
              <div style="margin-top: 14px; font-size: 11px; font-weight: 700; color: #93c5fd; letter-spacing: 0.15em; text-transform: uppercase;">
                ${data?.general?.siteName || 'KH Dream Services Limited'} • Corporate Broadcast
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px 24px 32px;">
              <h1 style="margin: 0 0 22px 0; font-size: 21px; font-weight: 800; color: #0f172a; line-height: 1.35; letter-spacing: -0.01em;">
                ${subject}
              </h1>
              ${formattedBody}
              ${ctaHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
              <div style="text-align: center; line-height: 1.5;">
                <p style="margin: 0 0 4px 0; font-weight: 700; color: #1e293b;">
                  ${data?.general?.siteName || 'KH Dream Services Limited'}
                </p>
                <p style="margin: 0 0 8px 0;">
                  Al Olaya District, King Fahd Road, Riyadh, Kingdom of Saudi Arabia
                </p>
                <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                  You received this official notice as an active corporate client, staff member, or verified subscriber.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  };

  // Dispatch Broadcast Handler
  const handleDispatchBroadcast = async () => {
    if (finalRecipients.length === 0) {
      alert('Please select at least one recipient or audience group.');
      return;
    }

    if (!subject.trim() || !content.trim()) {
      alert('Please provide both a subject line and announcement message.');
      return;
    }

    setIsSending(true);
    setShowConfirmModal(false);
    setSendError(null);
    setSendSuccess(null);

    const emailHtml = generateEmailHtml(content);
    const token = localStorage.getItem('kh_admin_token');

    // Batch send in chunks of 50 to avoid SMTP size limits
    const batchSize = 25;
    const total = finalRecipients.length;
    let deliveredCount = 0;
    const logs: string[] = [`[Broadcast Core] Commencing broadcast transmission to ${total} recipients...`];
    setSendProgress({ current: 0, total, logs });

    try {
      for (let i = 0; i < total; i += batchSize) {
        const batch = finalRecipients.slice(i, i + batchSize);
        logs.push(`[SMTP Dispatcher] Sending batch ${Math.floor(i / batchSize) + 1} (${batch.length} addresses)...`);
        setSendProgress({ current: i, total, logs: [...logs] });

        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'x-admin-token': token } : {})
          },
          body: JSON.stringify({
            to: batch,
            subject,
            html: emailHtml,
            smtpConfig: {
              host: currentUser?.mailboxConfig?.smtpHost,
              port: parseInt(currentUser?.mailboxConfig?.smtpPort || '587'),
              secure: currentUser?.mailboxConfig?.smtpUseSSL,
              user: currentUser?.mailboxConfig?.smtpUser,
              pass: currentUser?.mailboxConfig?.smtpPassword,
              from: `"${senderName}" <${senderEmail}>`
            }
          }),
          credentials: 'include'
        });

        const result = await res.json();
        if (res.ok && result.success) {
          deliveredCount += batch.length;
          logs.push(`[SMTP 250 OK] Batch delivered successfully (ID: ${result.messageId || 'OK'})`);
        } else {
          logs.push(`[SMTP Warning] Batch ${Math.floor(i / batchSize) + 1} encountered: ${result.error || 'Check SMTP configurations'}`);
        }
        setSendProgress({ current: Math.min(i + batch.length, total), total, logs: [...logs] });
      }

      // Record to history
      const newHistoryItem: BroadcastHistoryItem = {
        id: `broadcast-${Date.now()}`,
        timestamp: new Date().toISOString(),
        subject,
        recipientCount: finalRecipients.length,
        recipientsList: finalRecipients,
        status: 'delivered',
        sender: `${senderName} <${senderEmail}>`
      };

      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      try {
        localStorage.setItem('kh_broadcast_history', JSON.stringify(updatedHistory));
      } catch {
        // ignore
      }

      setSendSuccess(`Broadcast completed! Dispatched to ${finalRecipients.length} target recipients.`);
      logs.push(`[Broadcast Complete] All transmission packets finalized at ${new Date().toLocaleTimeString()}`);
      setSendProgress({ current: total, total, logs: [...logs] });
    } catch (err: any) {
      setSendError(err.message || 'An error occurred during transmission. Please verify your SMTP settings.');
      logs.push(`[Fatal Error] ${err.message || 'Network dispatch interrupted'}`);
      setSendProgress(prev => ({ ...prev, logs: [...logs] }));
    } finally {
      setIsSending(false);
    }
  };

  // Quick Test Email Send
  const handleSendTestEmail = async () => {
    if (!testRecipient || !testRecipient.includes('@')) {
      alert('Please enter a valid test recipient email.');
      return;
    }

    setIsSendingTest(true);
    setTestStatus(null);
    const emailHtml = generateEmailHtml(content);
    const token = localStorage.getItem('kh_admin_token');

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-admin-token': token } : {})
        },
        body: JSON.stringify({
          to: [testRecipient.trim()],
          subject: `[TEST PREVIEW] ${subject}`,
          html: emailHtml,
          smtpConfig: {
            host: currentUser?.mailboxConfig?.smtpHost,
            port: parseInt(currentUser?.mailboxConfig?.smtpPort || '587'),
            secure: currentUser?.mailboxConfig?.smtpUseSSL,
            user: currentUser?.mailboxConfig?.smtpUser,
            pass: currentUser?.mailboxConfig?.smtpPassword,
            from: `"${senderName} (Test)" <${senderEmail}>`
          }
        }),
        credentials: 'include'
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        alert('Test send failed: ' + (result.error || 'Verify SMTP credentials'));
      }
    } catch (err: any) {
      setTestStatus('error');
      alert('Test send error: ' + err.message);
    } finally {
      setIsSendingTest(false);
      setTimeout(() => setTestStatus(null), 4000);
    }
  };

  // Add new subscriber
  const handleAddSubscriber = () => {
    const email = newSubscriberEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    const currentSubs = data.subscribers || [];
    if (currentSubs.includes(email)) {
      alert('This email is already in the subscribers list.');
      return;
    }

    updateData({
      subscribers: [...currentSubs, email]
    });
    setNewSubscriberEmail('');
  };

  // Remove subscriber
  const handleRemoveSubscriber = (emailToRemove: string) => {
    updateData({
      subscribers: (data.subscribers || []).filter(s => s !== emailToRemove),
      newsletterSubscribers: (data.newsletterSubscribers || []).filter(s => s !== emailToRemove)
    });
  };

  // Copy all subscribers
  const handleCopyAllSubscribers = () => {
    const all = Array.from(new Set([...(data.subscribers || []), ...(data.newsletterSubscribers || [])]));
    navigator.clipboard.writeText(all.join('\n'));
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  // Save template edits
  const handleSaveTemplate = () => {
    setIsSavingTemplate(true);
    updateData({
      general: {
        ...data.general,
        broadcastEmailTemplate: {
          subject: templateSubject,
          body: templateBody
        }
      }
    });
    setTimeout(() => {
      setIsSavingTemplate(false);
      setTemplateSaveSuccess(true);
      setTimeout(() => setTemplateSaveSuccess(false), 3000);
    }, 400);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Radio size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Email Broadcast Console
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Dispatch announcements, regulatory updates, and corporate notices to staff, subscribers, and invoice clients.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('composer')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubTab === 'composer'
                ? 'bg-white dark:bg-zinc-900 text-primary shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Send size={13} />
            <span>Composer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('subscribers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubTab === 'subscribers'
                ? 'bg-white dark:bg-zinc-900 text-primary shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users size={13} />
            <span>Subscribers ({data.subscribers?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('template')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubTab === 'template'
                ? 'bg-white dark:bg-zinc-900 text-primary shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings size={13} />
            <span>Master Template</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubTab === 'history'
                ? 'bg-white dark:bg-zinc-900 text-primary shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock size={13} />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: COMPOSER */}
      {activeSubTab === 'composer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Audience Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* CARD 1: TARGET AUDIENCE SELECTION */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center space-x-2">
                  <Users size={18} className="text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    1. Target Audience Selection
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {finalRecipients.length} Selected Recipient{finalRecipients.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Audience Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Staff */}
                <button
                  type="button"
                  onClick={() => setTargetStaff(!targetStaff)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    targetStaff
                      ? 'bg-primary/5 border-primary/40 ring-2 ring-primary/20'
                      : 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <UserCheck size={16} className={targetStaff ? 'text-primary' : 'text-slate-400'} />
                    <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                      {audienceLists.staff.length}
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white mt-2">
                    Staff & Users
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Internal admins & team
                  </div>
                </button>

                {/* Subscribers */}
                <button
                  type="button"
                  onClick={() => setTargetSubscribers(!targetSubscribers)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    targetSubscribers
                      ? 'bg-primary/5 border-primary/40 ring-2 ring-primary/20'
                      : 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Mail size={16} className={targetSubscribers ? 'text-primary' : 'text-slate-400'} />
                    <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                      {audienceLists.subscribers.length}
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white mt-2">
                    Subscribers
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Newsletter opt-ins
                  </div>
                </button>

                {/* Clients */}
                <button
                  type="button"
                  onClick={() => setTargetClients(!targetClients)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    targetClients
                      ? 'bg-primary/5 border-primary/40 ring-2 ring-primary/20'
                      : 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <FileText size={16} className={targetClients ? 'text-primary' : 'text-slate-400'} />
                    <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                      {audienceLists.clients.length}
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white mt-2">
                    Invoice Clients
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Verified billable accounts
                  </div>
                </button>
              </div>

              {/* Custom Recipients Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                  Additional Custom Recipient Emails (comma or line separated)
                </label>
                <textarea
                  value={customEmailsInput}
                  onChange={e => setCustomEmailsInput(e.target.value)}
                  placeholder="investor@example.com, client.rep@saudicorp.sa"
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* Recipient Chips Preview */}
              {finalRecipients.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Target List Sample ({finalRecipients.length} total addresses)</span>
                    {excludedEmails.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExcludedEmails([])}
                        className="text-primary hover:underline"
                      >
                        Reset Exclusions ({excludedEmails.length})
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-800">
                    {finalRecipients.slice(0, 20).map(email => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 shadow-2xs"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => setExcludedEmails(prev => [...prev, email])}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="Exclude from this broadcast"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {finalRecipients.length > 20 && (
                      <span className="text-[10px] font-bold text-slate-400 self-center px-1">
                        +{finalRecipients.length - 20} more...
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CARD 2: CAMPAIGN MESSAGE COMPOSER */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center space-x-2">
                  <FileText size={18} className="text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    2. Announcement Content
                  </h3>
                </div>

                {/* Template Style Selector */}
                <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setTemplateStyle('corporate')}
                    className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-colors ${
                      templateStyle === 'corporate'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    Corporate
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateStyle('clean')}
                    className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-colors ${
                      templateStyle === 'clean'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    Clean
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateStyle('custom')}
                    className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-colors ${
                      templateStyle === 'custom'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    Custom Master
                  </button>
                </div>
              </div>

              {/* Sender Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                    Sender Display Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                    Sender Reply-To Email
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={e => setSenderEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Subject Line */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                  Campaign Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Enter notice subject..."
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-black outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
                />
              </div>

              {/* Message Body */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                  Message Body (Paragraphs formatted automatically)
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3.5 text-xs font-medium leading-relaxed outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white resize-y"
                />
              </div>

              {/* Optional Call to Action Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                    Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={e => setCtaText(e.target.value)}
                    placeholder="e.g. Access Portal"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                    Button Target Link
                  </label>
                  <input
                    type="url"
                    value={ctaUrl}
                    onChange={e => setCtaUrl(e.target.value)}
                    placeholder="https://khdreamservices.com"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* CARD 3: TEST DISPATCH & BROADCAST ACTIONS */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                  3. Verification & Dispatch Actions
                </h3>
              </div>

              {/* Quick Test Email Section */}
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 dark:text-zinc-200">
                    Send Single Test Verification Email
                  </span>
                  {testStatus === 'success' && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Test Sent!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={testRecipient}
                    onChange={e => setTestRecipient(e.target.value)}
                    placeholder="your.email@example.com"
                    className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={isSendingTest || !testRecipient}
                    className="px-4 py-2 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    {isSendingTest ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    <span>Test Send</span>
                  </button>
                </div>
              </div>

              {/* Main Blast Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isSending || finalRecipients.length === 0}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-primary/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Broadcasting Transmission...</span>
                    </>
                  ) : (
                    <>
                      <Radio size={16} />
                      <span>Launch Broadcast to {finalRecipients.length} Recipient{finalRecipients.length === 1 ? '' : 's'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Notifications / Alerts */}
              {sendSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{sendSuccess}</span>
                </div>
              )}

              {sendError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{sendError}</span>
                </div>
              )}

              {/* Live Dispatch Logs */}
              {sendProgress.logs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Dispatcher Log ({sendProgress.current} / {sendProgress.total})</span>
                  </div>
                  <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] max-h-32 overflow-y-auto space-y-0.5 border border-slate-800">
                    {sendProgress.logs.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Responsive Preview Frame */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-sm sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center space-x-2">
                  <Eye size={16} className="text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    Live Email Rendering
                  </h3>
                </div>

                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      previewDevice === 'desktop' ? 'bg-white dark:bg-zinc-900 text-primary shadow-xs' : 'text-slate-400'
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      previewDevice === 'mobile' ? 'bg-white dark:bg-zinc-900 text-primary shadow-xs' : 'text-slate-400'
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              {/* Email Client Simulated Frame */}
              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-800 text-[11px] space-y-1">
                  <div><strong className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">From:</strong> <span className="font-medium text-slate-700 dark:text-zinc-300">"{senderName}" &lt;{senderEmail}&gt;</span></div>
                  <div><strong className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Subject:</strong> <span className="font-bold text-slate-900 dark:text-white">{subject || '(No subject)'}</span></div>
                  <div><strong className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">To:</strong> <span className="font-mono text-primary font-bold">{finalRecipients.length} Target Recipients</span></div>
                </div>

                {/* Rendered HTML Container */}
                <div 
                  className={`mx-auto rounded-xl overflow-hidden border border-slate-300 dark:border-zinc-700 shadow-inner bg-slate-100 dark:bg-zinc-950 transition-all duration-300 ${
                    previewDevice === 'mobile' ? 'max-w-[340px]' : 'w-full'
                  }`}
                >
                  <iframe
                    title="Broadcast Email Preview"
                    srcDoc={generateEmailHtml(content)}
                    className="w-full h-[520px] bg-white border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SUBSCRIBERS DIRECTORY */}
      {activeSubTab === 'subscribers' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Subscribers & Newsletter Directory
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Manage registered subscribers captured from public landing pages, newsletters, and direct admin registration.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAllSubscribers}
                className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {copiedEmails ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copiedEmails ? 'Copied to Clipboard!' : 'Copy All Emails'}</span>
              </button>
            </div>
          </div>

          {/* Add New Subscriber Bar */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <input
                type="email"
                value={newSubscriberEmail}
                onChange={e => setNewSubscriberEmail(e.target.value)}
                placeholder="Enter new subscriber email (e.g. director@holding.sa)"
                className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="button"
              onClick={handleAddSubscriber}
              className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 hover:scale-105 transition-all"
            >
              <Plus size={14} />
              <span>Add Subscriber</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Active Subscribers: {(data.subscribers || []).length}
            </div>
          </div>

          {/* Subscribers List */}
          {(data.subscribers || []).length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
              <Mail className="mx-auto text-slate-300 dark:text-zinc-600 mb-2" size={32} />
              <p className="text-xs font-bold text-slate-500">No subscribers currently recorded in the registry.</p>
              <p className="text-[11px] text-slate-400 mt-1">Add emails above or capture them via the public landing newsletter form.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(data.subscribers || []).map((subEmail, idx) => (
                <div
                  key={subEmail + idx}
                  className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between group hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-800 dark:text-zinc-200 truncate">
                      {subEmail}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubscriber(subEmail)}
                    className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Subscriber"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: MASTER TEMPLATE CUSTOMIZER */}
      {activeSubTab === 'template' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Master HTML Email Broadcast Template
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Customize the default HTML envelope wrapped around your broadcast text when selecting "Custom Master" template.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveTemplate}
              disabled={isSavingTemplate}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-primary/25 hover:scale-105 transition-all self-start sm:self-auto"
            >
              <Save size={14} />
              <span>{isSavingTemplate ? 'Saving...' : 'Save Template'}</span>
            </button>
          </div>

          {templateSaveSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>Broadcast template saved successfully into CMS storage!</span>
            </div>
          )}

          {/* Supported Dynamic Tags Guide */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 block">
              Supported Template Replacement Tags:
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-primary border border-blue-200 dark:border-blue-900">
                {'{broadcastContent}'}
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-primary border border-blue-200 dark:border-blue-900">
                {'{siteName}'}
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-primary border border-blue-200 dark:border-blue-900">
                {'{logoUrl}'}
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-primary border border-blue-200 dark:border-blue-900">
                {'{year}'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                Default Master Subject
              </label>
              <input
                type="text"
                value={templateSubject}
                onChange={e => setTemplateSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                Master HTML Code
              </label>
              <textarea
                value={templateBody}
                onChange={e => setTemplateBody(e.target.value)}
                rows={14}
                className="w-full bg-slate-900 text-emerald-400 font-mono border border-slate-800 rounded-xl p-4 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-primary/20 resize-y"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BROADCAST HISTORY */}
      {activeSubTab === 'history' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Broadcast Transmission Logs
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Auditing log of historical email campaigns and mass notification dispatches.
              </p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
              <Clock className="mx-auto text-slate-300 dark:text-zinc-600 mb-2" size={32} />
              <p className="text-xs font-bold text-slate-500">No broadcast dispatches recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(item => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {item.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Dispatched by {item.sender} on {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-mono font-bold text-primary shrink-0">
                    <span>{item.recipientCount} Recipients</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONFIRMATION LAUNCH MODAL */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-5"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Confirm Broadcast Launch
                  </h3>
                  <p className="text-xs text-slate-400">
                    Please confirm before transmitting mass emails.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Total Recipients:</span>
                  <span className="font-mono font-black text-primary">{finalRecipients.length} addresses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Subject:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[200px]">{subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">From:</span>
                  <span className="text-slate-700 dark:text-zinc-300 truncate max-w-[200px]">{senderName}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                This will dispatch real email transmissions via your configured SMTP host. Make sure your content and links are accurate.
              </p>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDispatchBroadcast}
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
                >
                  <Send size={13} />
                  <span>Confirm & Send</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BroadcastManager;
