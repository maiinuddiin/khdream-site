import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { CMSProvider, useCMS } from './context/CMSContext';

const AdminPanel = lazy(() => import('./components/AdminPanel'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const PublicInvoiceView = lazy(() => import('./components/PublicInvoiceView'));
const PublicInvoicePortal = lazy(() => import('./components/PublicInvoicePortal'));

const ComponentLoader: React.FC = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-zinc-950">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Dashboard...</p>
  </div>
);

const AppContent: React.FC = () => {
  const { currentUser } = useCMS();

  // Dark/Light Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kh_dream_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kh_dream_theme', theme);
  }, [theme]);

  // Route / Path Detection
  const [pathname, setPathname] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Determine if viewing a public invoice or portal
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const queryInv = params.get('inv');
  const pathParts = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const isInvoicePath = pathParts[0] === 'invoice' || pathParts[0] === 'invoices' || pathParts[0] === 'receipt';
  const invoiceIdFromPath = isInvoicePath && pathParts[1] ? decodeURIComponent(pathParts[1]) : null;
  const targetInvoiceId = queryInv || invoiceIdFromPath;

  // 1. If public invoice link is accessed:
  if (targetInvoiceId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
        <Suspense fallback={<ComponentLoader />}>
          <PublicInvoiceView 
            invoiceId={targetInvoiceId} 
            onBack={() => {
              window.history.pushState({}, '', '/');
              setPathname('/');
            }}
          />
        </Suspense>
      </div>
    );
  }

  if (isInvoicePath && !targetInvoiceId && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
        <Suspense fallback={<ComponentLoader />}>
          <PublicInvoicePortal 
            onSelectInvoice={(invId) => {
              window.history.pushState({}, '', `/invoice/${encodeURIComponent(invId)}`);
              setPathname(`/invoice/${encodeURIComponent(invId)}`);
            }}
            onBack={() => {
              window.history.pushState({}, '', '/');
              setPathname('/');
            }}
          />
        </Suspense>
      </div>
    );
  }

  // 2. If logged in: Show Admin Dashboard with Invoices, Receipts, Mailbox, and User Management
  if (currentUser) {
    return (
      <Suspense fallback={<ComponentLoader />}>
        <AdminPanel 
          theme={theme} 
          setTheme={setTheme} 
          onBack={() => {}} 
        />
      </Suspense>
    );
  }

  // 3. Default site visit (not logged in): Show Login Page
  return (
    <Suspense fallback={<ComponentLoader />}>
      <LoginPage 
        theme={theme} 
        setTheme={setTheme} 
      />
    </Suspense>
  );
};

export default function App() {
  return (
    <CMSProvider>
      <AppContent />
    </CMSProvider>
  );
}
